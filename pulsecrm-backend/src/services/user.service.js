const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  emailVerified: true,
  teamId: true,
  createdAt: true,
};

const listUsers = async (companyId) => {
  return prisma.user.findMany({
    where: { companyId },
    select: SAFE_SELECT,
    orderBy: { createdAt: "asc" },
  });
};

const findCompanyUser = async (companyId, userId) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, companyId },
  });

  if (!user) {
    throw new ApiError(404, "User not found in this company");
  }

  return user;
};

// Guard against locking a company out of admin access entirely.
const assertNotLastAdmin = async (companyId, userId) => {
  const admins = await prisma.user.count({
    where: { companyId, role: "ADMIN", isActive: true },
  });

  if (admins <= 1) {
    throw new ApiError(
      400,
      "Cannot change this user — they are the only remaining Admin for this company"
    );
  }
};

const assignRole = async (companyId, userId, role) => {
  const user = await findCompanyUser(companyId, userId);

  if (user.role === "ADMIN" && role !== "ADMIN") {
    await assertNotLastAdmin(companyId, userId);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: SAFE_SELECT,
  });
};

const assignTeam = async (companyId, userId, teamId) => {
  await findCompanyUser(companyId, userId);

  if (teamId) {
    const team = await prisma.team.findFirst({ where: { id: teamId, companyId } });
    if (!team) {
      throw new ApiError(404, "Team not found in this company");
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: { teamId },
    select: SAFE_SELECT,
  });
};

const setActiveStatus = async (companyId, userId, isActive) => {
  const user = await findCompanyUser(companyId, userId);

  if (user.role === "ADMIN" && !isActive) {
    await assertNotLastAdmin(companyId, userId);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: SAFE_SELECT,
  });
};

module.exports = { listUsers, assignRole, assignTeam, setActiveStatus };
