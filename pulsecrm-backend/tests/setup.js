const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Prefer a dedicated .env.test (a separate test database) if present,
// so integration tests never touch a real development database.
const testEnvPath = path.resolve(__dirname, "../.env.test");

if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
} else {
  dotenv.config();
  // eslint-disable-next-line no-console
  console.warn(
    "\n⚠️  No .env.test found — integration tests are running against the DATABASE_URL in .env.\n" +
      "   Create pulsecrm-backend/.env.test pointing at a disposable test database to avoid this.\n"
  );
}

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-access-secret";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
