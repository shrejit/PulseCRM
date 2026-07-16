/**
 * Seeds a demo Company, Team, and one user per role (Admin, Manager, Rep)
 * so the app is usable immediately after a fresh migration.
 *
 * Run with: npm run seed
 * (or `npx prisma db seed`, since this file is registered in package.json)
 *
 * Safe to re-run: it upserts by email, so it won't create duplicates.
 */
const { PrismaClient } = require("../generated/prisma");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = process.env.SEED_PASSWORD || "ChangeMe123!";

async function main() {
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  const company = await prisma.company.upsert({
    where: { id: "seed-company-pulsecrm" },
    update: {},
    create: {
      id: "seed-company-pulsecrm",
      name: "PulseCRM Demo Inc.",
      industry: "Software",
    },
  });

  const team = await prisma.team.upsert({
    where: { id: "seed-team-founding" },
    update: {},
    create: {
      id: "seed-team-founding",
      name: "Founding Team",
      companyId: company.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@pulsecrm.dev" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@pulsecrm.dev",
      password: hashedPassword,
      role: "ADMIN",
      companyId: company.id,
      teamId: team.id,
      isActive: true,
      emailVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@pulsecrm.dev" },
    update: {},
    create: {
      name: "Sales Manager",
      email: "manager@pulsecrm.dev",
      password: hashedPassword,
      role: "MANAGER",
      companyId: company.id,
      teamId: team.id,
      isActive: true,
      emailVerified: true,
    },
  });

  const rep = await prisma.user.upsert({
    where: { email: "rep@pulsecrm.dev" },
    update: {},
    create: {
      name: "Sales Representative",
      email: "rep@pulsecrm.dev",
      password: hashedPassword,
      role: "REP",
      companyId: company.id,
      teamId: team.id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("✅ Seed complete:");
  console.log(`   Company: ${company.name} (${company.id})`);
  console.log(`   Team:    ${team.name} (${team.id})`);
  console.log(`   Admin:   ${admin.email} / ${SEED_PASSWORD}`);
  console.log(`   Manager: ${manager.email} / ${SEED_PASSWORD}`);
  console.log(`   Rep:     ${rep.email} / ${SEED_PASSWORD}`);
  console.log("\n⚠️  Change these passwords before using this in anything but local dev.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
