const { z } = require("zod");

const createTeamSchema = z.object({
  name: z.string().min(2).max(120),
});

const updateTeamSchema = z.object({
  name: z.string().min(2).max(120),
});

const teamIdParamSchema = z.object({
  id: z.string().min(1),
});

module.exports = { createTeamSchema, updateTeamSchema, teamIdParamSchema };
