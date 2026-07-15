const crypto = require("crypto");

const prisma = require("../prisma/client");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../utils/jwt");

// Must match the expiresIn used in generateRefreshToken() (utils/jwt.js).
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Issue a brand new access/refresh token pair for a user, starting a new
 * token family. Used on register/login.
 */
const issueTokenPair = async (user) => {
  const family = crypto.randomUUID();

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    family,
  });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      family,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
};

/**
 * Rotate a refresh token: verify it, confirm it hasn't already been used,
 * revoke it, and issue a new access/refresh token pair in the same family.
 *
 * If the presented token has already been revoked, that means either:
 *  - the legitimate client already rotated past it, or
 *  - an attacker is replaying a stolen refresh token.
 * Either way, the entire token family is revoked so any copy of the
 * compromised token stops working, forcing a fresh login.
 */
const rotateRefreshToken = async (rawToken) => {
  if (!rawToken) {
    throw new Error("Refresh token required");
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(rawToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!stored) {
    throw new Error("Invalid refresh token");
  }

  if (stored.revoked) {
    // Reuse detected — kill the whole family.
    await prisma.refreshToken.updateMany({
      where: { family: stored.family, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    throw new Error(
      "Refresh token reuse detected. All sessions for this device chain have been revoked."
    );
  }

  if (stored.expiresAt < new Date()) {
    throw new Error("Refresh token expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    id: user.id,
    family: stored.family,
  });

  const newTokenHash = hashToken(newRefreshToken);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revoked: true,
        revokedAt: new Date(),
        replacedByTokenHash: newTokenHash,
      },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        family: stored.family,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Revoke a single refresh token (used on logout of the current session).
 * Safe to call even if the token is missing/already invalid.
 */
const revokeToken = async (rawToken) => {
  if (!rawToken) return;

  try {
    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
  } catch {
    // Logout should never fail because of a malformed/missing token.
  }
};

/**
 * Revoke every active refresh token for a user (logout of all sessions).
 */
const revokeAllForUser = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true, revokedAt: new Date() },
  });
};

module.exports = {
  issueTokenPair,
  rotateRefreshToken,
  revokeToken,
  revokeAllForUser,
};
