const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

// Every user belongs to exactly one company, so "get my company" is the
// only read a normal user needs — there is no cross-tenant company listing.
const getMyCompany = async (companyId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      _count: {
        select: { users: true, teams: true },
      },
    },
  });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return company;
};

const updateMyCompany = async (companyId, data) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return prisma.company.update({
    where: { id: companyId },
    data,
  });
};

module.exports = { getMyCompany, updateMyCompany };
