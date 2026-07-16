const { z } = require("zod");

const updateCompanySchema = z.object({
  name: z.string().min(2).max(120).optional(),
  industry: z.string().max(120).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field (name, industry) must be provided",
});

module.exports = { updateCompanySchema };
