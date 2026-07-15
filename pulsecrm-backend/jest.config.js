module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup.js"],
  verbose: true,
  // Integration tests hit a real (test) database sequentially via
  // `--runInBand` (see package.json) to avoid cross-test data races.
  testTimeout: 15000,
};
