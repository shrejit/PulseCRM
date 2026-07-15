const crypto = require("crypto");

const prisma = require("../prisma/client");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { sendEmail } = require("../utils/email");
const refreshTokenService = require("./refreshToken.service");

// Register
const register = async (data) => {
  const {
    name,
    email,
    password,
    companyId,
    companyName,
    teamId = null,
    role,
  } = data;

  let resolvedCompanyId = companyId;
  let resolvedRole = role || "REP";

  if (!resolvedCompanyId && companyName) {
    const newCompany = await prisma.company.create({
      data: {
        name: companyName,
      },
    });
    resolvedCompanyId = newCompany.id;
    resolvedRole = role || "ADMIN";
  }

  if (!name || !email || !password || !resolvedCompanyId) {
    throw new Error("Missing required fields");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: resolvedRole,
      companyId: resolvedCompanyId,
      teamId,
      emailVerificationToken,
    },
  });

  const { accessToken, refreshToken } = await refreshTokenService.issueTokenPair(user);

  // Send email verification asynchronously
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email/${emailVerificationToken}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Welcome to PulseCRM!</h2>
      <p>Thank you for registering. Please verify your email address to get started:</p>
      <p style="margin: 20px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
      </p>
      <p>Or copy this link to your browser:</p>
      <p>${verifyUrl}</p>
    </div>
  `;
  sendEmail({
    to: user.email,
    subject: "Verify your PulseCRM Account",
    html: htmlContent,
  }).catch(err => console.error("Error sending verification email:", err.message));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Login
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("Account is inactive");
  }

  const validPassword = await comparePassword(
    password,
    user.password
  );

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const { accessToken, refreshToken } = await refreshTokenService.issueTokenPair(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Logout — revokes the presented refresh token (current session). Falls
// back to revoking every session for the user if no refresh token is
// supplied, so an authenticated client can always guarantee it is logged
// out even if it lost track of its refresh token.
const logout = async ({ userId, refreshToken }) => {
  if (refreshToken) {
    await refreshTokenService.revokeToken(refreshToken);
  } else {
    await refreshTokenService.revokeAllForUser(userId);
  }

  return true;
};

// Refresh Token — rotation with reuse detection is implemented in
// refreshToken.service.js.
const refreshToken = async ({ refreshToken }) => {
  return refreshTokenService.rotateRefreshToken(refreshToken);
};

// Get the currently authenticated user's profile (used by GET /me).
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      companyId: true,
      teamId: true,
      company: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Forgot Password
const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 3600000),
    },
  });

  // Send password reset email asynchronously
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${token}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Reset Password Request</h2>
      <p>You requested a password reset for your PulseCRM account. Click the button below to set a new password:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </p>
      <p>This link is valid for 1 hour. If you didn't make this request, you can ignore this email.</p>
      <p>Or copy this link to your browser:</p>
      <p>${resetUrl}</p>
    </div>
  `;
  sendEmail({
    to: user.email,
    subject: "Reset your PulseCRM Password",
    html: htmlContent,
  }).catch(err => console.error("Error sending reset email:", err.message));

  return token;
};

// Reset Password
const resetPassword = async (token, { password }) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
    },
  });

  if (!user) {
    throw new Error("Invalid token");
  }

  if (user.resetPasswordExpires < new Date()) {
    throw new Error("Token expired");
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  // Resetting the password invalidates every existing session.
  await refreshTokenService.revokeAllForUser(user.id);

  return true;
};

// Verify Email
const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
  });

  if (!user) {
    throw new Error("Invalid token");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
    },
  });

  return true;
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
