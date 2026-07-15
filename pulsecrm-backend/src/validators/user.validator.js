const { z } = require("zod");

const assignRoleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "REP"]),
});

const assignTeamSchema = z.object({
  teamId: z.string().min(1).nullable(),
});

const setStatusSchema = z.object({
  isActive: z.boolean(),
});

module.exports = { assignRoleSchema, assignTeamSchema, setStatusSchema };
