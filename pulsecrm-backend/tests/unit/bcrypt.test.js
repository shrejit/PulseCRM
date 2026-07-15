const { hashPassword, comparePassword } = require("../../src/utils/bcrypt");

describe("utils/bcrypt", () => {
  test("hashPassword returns a hash different from the plaintext", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toBe("Sup3rSecret!");
    expect(hash.length).toBeGreaterThan(20);
  });

  test("comparePassword returns true for the correct password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(comparePassword("Sup3rSecret!", hash)).resolves.toBe(true);
  });

  test("comparePassword returns false for an incorrect password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(comparePassword("wrong-password", hash)).resolves.toBe(false);
  });

  test("hashing the same password twice yields different hashes (salted)", async () => {
    const hashA = await hashPassword("Sup3rSecret!");
    const hashB = await hashPassword("Sup3rSecret!");
    expect(hashA).not.toBe(hashB);
  });
});
