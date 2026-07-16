/**
 * These are integration tests: they boot the real Express app and hit it
 * with Supertest, and they talk to a real Postgres database through
 * Prisma (see tests/setup.js — point pulsecrm-backend/.env.test at a
 * disposable test database before running `npm test`).
 */
const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/prisma/client");

const uniqueEmail = (label) =>
  `${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.pulsecrm.dev`;

// Track everything we create so we can clean up regardless of pass/fail.
const createdUserIds = [];
const createdCompanyIds = [];

afterAll(async () => {
  if (createdUserIds.length) {
    await prisma.refreshToken.deleteMany({
      where: { userId: { in: createdUserIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });
  }

  if (createdCompanyIds.length) {
    await prisma.company.deleteMany({
      where: { id: { in: createdCompanyIds } },
    });
  }

  await prisma.$disconnect();
});

describe("Auth flow (register → login → me → refresh rotation → logout)", () => {
  const password = "Sup3rSecret!123";
  let email;
  let accessToken;
  let refreshToken;
  let userId;

  test("POST /api/auth/register creates a user and a new company as ADMIN", async () => {
    email = uniqueEmail("register");

    const res = await request(app).post("/api/auth/register").send({
      name: "Test Admin",
      email,
      password,
      companyName: "Test Co " + Date.now(),
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.role).toBe("ADMIN");
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
    userId = res.body.data.user.id;

    createdUserIds.push(userId);
    createdCompanyIds.push(
      (await prisma.user.findUnique({ where: { id: userId } })).companyId
    );
  });

  test("POST /api/auth/register rejects a duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Duplicate",
      email,
      password,
      companyName: "Whatever Inc",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/auth/me returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/auth/me returns the authenticated user's profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.company).toBeDefined();
  });

  test("POST /api/auth/login succeeds with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test("POST /api/auth/login fails with the wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "totally-wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  let rotatedRefreshToken;

  test("POST /api/auth/refresh-token rotates the refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(refreshToken);

    rotatedRefreshToken = res.body.data.refreshToken;
  });

  test("reusing the original (now-rotated) refresh token is rejected", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken }); // the OLD token, already rotated above

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("reuse detection revokes the whole family — the rotated token is now also dead", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: rotatedRefreshToken });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/logout requires authentication", async () => {
    const res = await request(app).post("/api/auth/logout").send({});
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/logout revokes the current session's refresh token", async () => {
    // Fresh login to get a clean, active refresh token to log out with.
    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    const sessionAccessToken = loginRes.body.data.accessToken;
    const sessionRefreshToken = loginRes.body.data.refreshToken;

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${sessionAccessToken}`)
      .send({ refreshToken: sessionRefreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const refreshAfterLogout = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: sessionRefreshToken });

    expect(refreshAfterLogout.status).toBe(401);
  });
});
