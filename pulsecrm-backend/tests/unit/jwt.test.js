const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} = require("../../src/utils/jwt");

describe("utils/jwt", () => {
  const payload = { id: "user_123", email: "jane@example.com", role: "ADMIN" };

  test("generateAccessToken produces a token verifiable with verifyAccessToken", () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  test("generateRefreshToken produces a token verifiable with verifyRefreshToken", () => {
    const token = generateRefreshToken({ id: payload.id, family: "fam_1" });
    const decoded = verifyRefreshToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.family).toBe("fam_1");
  });

  test("an access token cannot be verified as a refresh token", () => {
    const accessToken = generateAccessToken(payload);
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  test("hashToken is deterministic for the same input", () => {
    const token = "some-raw-refresh-token-value";
    expect(hashToken(token)).toBe(hashToken(token));
  });

  test("hashToken never returns the raw token (no plaintext storage)", () => {
    const token = "some-raw-refresh-token-value";
    const hash = hashToken(token);

    expect(hash).not.toBe(token);
    expect(hash).toMatch(/^[a-f0-9]{64}$/); // sha256 hex digest
  });

  test("hashToken produces different hashes for different tokens", () => {
    expect(hashToken("token-a")).not.toBe(hashToken("token-b"));
  });
});
