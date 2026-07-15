const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

const listTeams = async (companyId) => {
  return prisma.team.findMany({
    where: { companyId },
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "asc" },
  });
};

const getTeam = async (companyId, teamId) => {
  const team = await prisma.team.findFirst({
    where: { id: teamId, companyId },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, isActive: true },
      },
    },
  });

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  return team;
};

const createTeam = async (companyId, data) => {
  return prisma.team.create({
    data: {
      name: data.name,
      companyId,
    },
  });
};

const updateTeam = async (companyId, teamId, data) => {
  const team = await prisma.team.findFirst({ where: { id: teamId, companyId } });

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  return prisma.team.update({
    where: { id: teamId },
    data,
  });
};

// Deleting a team unassigns its members rather than deleting them — a
// transaction guarantees the two operations succeed or fail together.
const deleteTeam = async (companyId, teamId) => {
  const team = await prisma.team.findFirst({ where: { id: teamId, companyId } });

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { teamId, companyId },
      data: { teamId: null },
    }),
    prisma.team.delete({ where: { id: teamId } }),
  ]);

  return true;
};

module.exports = { listTeams, getTeam, createTeam, updateTeam, deleteTeam };
