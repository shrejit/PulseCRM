const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PulseCRM API",
      version: "1.0.0",
      description:
        "Authentication, organization (Company/Team), RBAC, and invitation APIs for PulseCRM.",
    },
    servers: [
      {
        url: "http://localhost:" + (process.env.PORT || 5000),
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Registration, login, tokens, password/email flows" },
      { name: "Company", description: "Company (tenant) management" },
      { name: "Team", description: "Team management within a company" },
      { name: "User", description: "Company user listing, role and team assignment" },
      { name: "Invitation", description: "Invite new users into a company" },
    ],
  },
  // JSDoc @openapi blocks live directly above each route definition.
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
