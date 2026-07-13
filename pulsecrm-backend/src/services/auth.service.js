const crypto = require("crypto");

const prisma = require("../prisma/client");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

// Register
const register = async (data) => {
  const {
    name,
    email,
    password,
    companyId,
    teamId = null,
    role = "REP",
  } = data;

  if (!name || !email || !password || !companyId) {
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
      role,
      companyId,
      teamId,
      emailVerificationToken,
    },
  });

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

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

  const validPassword = await comparePassword(
    password,
    user.password
  );

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

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

// Logout
const logout = async ({ userId }) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: null,
    },
  });

  return true;
};

// Refresh Token
const refreshToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken: newAccessToken,
  };
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
  forgotPassword,
  resetPassword,
  verifyEmail,
};