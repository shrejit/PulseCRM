const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/prisma/client");

const uniqueEmail = (label) =>
  `${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.pulsecrm.dev`;

const createdUserIds = [];
const createdCompanyIds = [];

afterAll(async () => {
  if (createdUserIds.length) {
    await prisma.invitation.deleteMany({
      where: { invitedById: { in: createdUserIds } },
    });
    await prisma.refreshToken.deleteMany({
      where: { userId: { in: createdUserIds } },
    });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }
  if (createdCompanyIds.length) {
    await prisma.team.deleteMany({ where: { companyId: { in: createdCompanyIds } } });
    await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } });
  }
  await prisma.$disconnect();
});

// Registers a fresh admin (and company) and returns their auth context.
const registerAdmin = async (label) => {
  const email = uniqueEmail(label);
  const res = await request(app).post("/api/auth/register").send({
    name: `${label} Admin`,
    email,
    password: "Sup3rSecret!123",
    companyName: `${label} Co ${Date.now()}`,
  });

  createdUserIds.push(res.body.data.user.id);
  createdCompanyIds.push(
    (await prisma.user.findUnique({ where: { id: res.body.data.user.id } })).companyId
  );

  return {
    email,
    userId: res.body.data.user.id,
    companyId: (await prisma.user.findUnique({ where: { id: res.body.data.user.id } })).companyId,
    accessToken: res.body.data.accessToken,
  };
};

describe("Company API", () => {
  let admin;

  beforeAll(async () => {
    admin = await registerAdmin("company-suite");
  });

  test("GET /api/companies/me requires authentication", async () => {
    const res = await request(app).get("/api/companies/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/companies/me returns the caller's own company", async () => {
    const res = await request(app)
      .get("/api/companies/me")
      .set("Authorization", `Bearer ${admin.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(admin.companyId);
  });

  test("PATCH /api/companies/me updates the company as Admin", async () => {
    const res = await request(app)
      .patch("/api/companies/me")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ industry: "Fintech" });

    expect(res.status).toBe(200);
    expect(res.body.data.industry).toBe("Fintech");
  });

  test("PATCH /api/companies/me rejects an empty payload (validation)", async () => {
    const res = await request(app)
      .patch("/api/companies/me")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

describe("Team API", () => {
  let admin;
  let teamId;

  beforeAll(async () => {
    admin = await registerAdmin("team-suite");
  });

  test("POST /api/teams creates a team scoped to the caller's company", async () => {
    const res = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ name: "Outbound Sales" });

    expect(res.status).toBe(201);
    expect(res.body.data.companyId).toBe(admin.companyId);
    teamId = res.body.data.id;
  });

  test("GET /api/teams lists only the caller's own company teams", async () => {
    const res = await request(app)
      .get("/api/teams")
      .set("Authorization", `Bearer ${admin.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((t) => t.companyId === admin.companyId)).toBe(true);
  });

  test("a user from a different company cannot see or fetch this team", async () => {
    const otherAdmin = await registerAdmin("team-outsider");

    const res = await request(app)
      .get(`/api/teams/${teamId}`)
      .set("Authorization", `Bearer ${otherAdmin.accessToken}`);

    expect(res.status).toBe(404); // scoped query — team simply doesn't exist for them
  });

  test("PATCH /api/teams/:id renames the team", async () => {
    const res = await request(app)
      .patch(`/api/teams/${teamId}`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ name: "Outbound Sales EMEA" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Outbound Sales EMEA");
  });

  test("a REP cannot create a team (RBAC enforced)", async () => {
    // Promote a throwaway user to REP by registering into the same company.
    const repEmail = uniqueEmail("team-rep");
    const repRes = await request(app).post("/api/auth/register").send({
      name: "Some Rep",
      email: repEmail,
      password: "Sup3rSecret!123",
      companyId: admin.companyId,
      role: "REP",
    });
    createdUserIds.push(repRes.body.data.user.id);

    const res = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${repRes.body.data.accessToken}`)
      .send({ name: "Should Not Be Created" });

    expect(res.status).toBe(403);
  });

  test("DELETE /api/teams/:id removes the team and unassigns members", async () => {
    const res = await request(app)
      .delete(`/api/teams/${teamId}`)
      .set("Authorization", `Bearer ${admin.accessToken}`);

    expect(res.status).toBe(200);

    const followUp = await request(app)
      .get(`/api/teams/${teamId}`)
      .set("Authorization", `Bearer ${admin.accessToken}`);
    expect(followUp.status).toBe(404);
  });
});

describe("User API — role and team assignment", () => {
  let admin;
  let repUserId;
  let repAccessToken;

  beforeAll(async () => {
    admin = await registerAdmin("user-suite");

    const repEmail = uniqueEmail("user-suite-rep");
    const repRes = await request(app).post("/api/auth/register").send({
      name: "Assignable Rep",
      email: repEmail,
      password: "Sup3rSecret!123",
      companyId: admin.companyId,
      role: "REP",
    });
    repUserId = repRes.body.data.user.id;
    repAccessToken = repRes.body.data.accessToken;
    createdUserIds.push(repUserId);
  });

  test("GET /api/users lists company users (Admin only)", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${admin.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((u) => u.id === repUserId)).toBe(true);
  });

  test("a REP cannot list company users (RBAC enforced)", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${repAccessToken}`);

    expect(res.status).toBe(403);
  });

  test("PATCH /api/users/:id/role promotes a REP to MANAGER", async () => {
    const res = await request(app)
      .patch(`/api/users/${repUserId}/role`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ role: "MANAGER" });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("MANAGER");
  });

  test("cannot demote the last remaining Admin", async () => {
    const res = await request(app)
      .patch(`/api/users/${admin.userId}/role`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ role: "REP" });

    expect(res.status).toBe(400);
  });
});

describe("Invitation API", () => {
  let admin;

  beforeAll(async () => {
    admin = await registerAdmin("invite-suite");
  });

  const inviteEmail = uniqueEmail("invitee");

  test("POST /api/invitations creates a pending invitation", async () => {
    const res = await request(app)
      .post("/api/invitations")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ email: inviteEmail, role: "REP" });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.email).toBe(inviteEmail);
  });

  test("a duplicate pending invitation for the same email is rejected", async () => {
    const res = await request(app)
      .post("/api/invitations")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ email: inviteEmail, role: "REP" });

    expect(res.status).toBe(409);
  });

  test("GET /api/invitations/:token is publicly readable (no auth)", async () => {
    const invitation = await prisma.invitation.findFirst({ where: { email: inviteEmail } });

    const res = await request(app).get(`/api/invitations/${invitation.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(inviteEmail);
  });

  test("POST /api/invitations/:token/accept creates the user and logs them in", async () => {
    const invitation = await prisma.invitation.findFirst({ where: { email: inviteEmail } });

    const res = await request(app)
      .post(`/api/invitations/${invitation.token}/accept`)
      .send({ name: "Invited Person", password: "Sup3rSecret!123" });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(inviteEmail);
    expect(res.body.data.accessToken).toBeDefined();

    createdUserIds.push(res.body.data.user.id);
  });

  test("the same invitation token cannot be accepted twice", async () => {
    const invitation = await prisma.invitation.findFirst({ where: { email: inviteEmail } });

    const res = await request(app)
      .post(`/api/invitations/${invitation.token}/accept`)
      .send({ name: "Someone Else", password: "Sup3rSecret!123" });

    expect(res.status).toBe(400);
  });

  test("an unrelated MANAGER cannot revoke an invitation from a different company", async () => {
    const outsider = await registerAdmin("invite-outsider");

    const invitation = await prisma.invitation.findFirst({ where: { email: inviteEmail } });

    const res = await request(app)
      .delete(`/api/invitations/${invitation.id}`)
      .set("Authorization", `Bearer ${outsider.accessToken}`);

    expect(res.status).toBe(404); // scoped — doesn't exist for this company
  });
});
