const { z } = require("zod");

const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "REP"]).default("REP"),
  teamId: z.string().min(1).optional().nullable(),
});

const acceptInvitationSchema = z.object({
  name: z.string().min(2).max(120),
  password: z.string().min(8).max(200),
});

module.exports = { createInvitationSchema, acceptInvitationSchema };
