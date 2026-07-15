const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/prisma/client");

const uniqueEmail = (label) =>
  `${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.pulsecrm.dev`;

const createdUserIds = [];
const createdCompanyIds = [];

afterAll(async () => {
  if (createdUserIds.length) {
    await prisma.refreshToken.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }
  if (createdCompanyIds.length) {
    await prisma.company.deleteMany({ where: { id: { in: createdCompanyIds } } });
  }
  await prisma.$disconnect();
});

describe("Email verification (backfill)", () => {
  test("GET /api/auth/verify-email/:token verifies the account", async () => {
    const email = uniqueEmail("verify");
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Verify Me",
      email,
      password: "Sup3rSecret!123",
      companyName: "Verify Co " + Date.now(),
    });

    const userId = registerRes.body.data.user.id;
    createdUserIds.push(userId);
    createdCompanyIds.push(
      (await prisma.user.findUnique({ where: { id: userId } })).companyId
    );

    const userRow = await prisma.user.findUnique({ where: { id: userId } });
    expect(userRow.emailVerified).toBe(false);

    const res = await request(app).get(
      `/api/auth/verify-email/${userRow.emailVerificationToken}`
    );

    expect(res.status).toBe(200);

    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(updatedUser.emailVerified).toBe(true);
    expect(updatedUser.emailVerificationToken).toBeNull();
  });

  test("an invalid verification token is rejected", async () => {
    const res = await request(app).get("/api/auth/verify-email/not-a-real-token");
    expect(res.status).toBe(400);
  });
});

describe("Forgot / Reset password (backfill)", () => {
  const password = "Sup3rSecret!123";
  let email;
  let userId;

  beforeAll(async () => {
    email = uniqueEmail("reset-flow");
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Reset Flow",
      email,
      password,
      companyName: "Reset Co " + Date.now(),
    });

    userId = registerRes.body.data.user.id;
    createdUserIds.push(userId);
    createdCompanyIds.push(
      (await prisma.user.findUnique({ where: { id: userId } })).companyId
    );
  });

  test("POST /api/auth/forgot-password issues a reset token for an existing user", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({ email });
    expect(res.status).toBe(200);

    const userRow = await prisma.user.findUnique({ where: { id: userId } });
    expect(userRow.resetPasswordToken).not.toBeNull();
    expect(userRow.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
  });

  test("POST /api/auth/forgot-password fails for a non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "does-not-exist@test.pulsecrm.dev" });

    expect(res.status).toBe(400);
  });

  test("POST /api/auth/reset-password/:token sets a new password and revokes existing sessions", async () => {
    // Log in first to create an active session/refresh token.
    const loginRes = await request(app).post("/api/auth/login").send({ email, password });
    const oldRefreshToken = loginRes.body.data.refreshToken;

    const userRow = await prisma.user.findUnique({ where: { id: userId } });

    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${userRow.resetPasswordToken}`)
      .send({ password: "BrandNewPassword!456" });

    expect(resetRes.status).toBe(200);

    // Old password no longer works.
    const oldLoginAttempt = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(oldLoginAttempt.status).toBe(401);

    // New password works.
    const newLoginAttempt = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "BrandNewPassword!456" });
    expect(newLoginAttempt.status).toBe(200);

    // The refresh token issued before the reset is now revoked.
    const refreshAttempt = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: oldRefreshToken });
    expect(refreshAttempt.status).toBe(401);
  });

  test("an expired/invalid reset token is rejected", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password/not-a-real-token")
      .send({ password: "Whatever123!" });

    expect(res.status).toBe(400);
  });
});
