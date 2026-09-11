import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

const rl = readline.createInterface({
  input,
  output,
});

async function ask(question: string): Promise<string> {
  const answer = await rl.question(question);
  return answer.trim();
}

async function main() {
  console.log("");
  console.log("👑 TABLEGO - CREATE OWNER");
  console.log("==========================");
  console.log("");

  const existingOwner = await prisma.user.findFirst({
    where: {
      role: "OWNER",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (existingOwner) {
    console.log("❌ OWNER sudah ada.");
    console.log(`   Nama  : ${existingOwner.name}`);
    console.log(`   Email : ${existingOwner.email}`);
    console.log(`   ID    : ${existingOwner.id}`);
    console.log("");
    console.log("Tidak ada perubahan pada database.");
    return;
  }

  const name = await ask("Nama Owner    : ");
  const email = (await ask("Email Owner   : ")).toLowerCase();
  const password = await ask("Password      : ");

  if (!name || !email || !password) {
    throw new Error("Nama, email, dan password wajib diisi.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Format email tidak valid.");
  }

  if (password.length < 12) {
    throw new Error("Password Owner minimal 12 karakter.");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (existingUser) {
    throw new Error(
      `Email ${email} sudah digunakan oleh user dengan role ${existingUser.role}.`,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const owner = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "OWNER",
      emailVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("");
  console.log("🎉 OWNER berhasil dibuat!");
  console.log(`   ID    : ${owner.id}`);
  console.log(`   Nama  : ${owner.name}`);
  console.log(`   Email : ${owner.email}`);
  console.log(`   Role  : ${owner.role}`);
  console.log("");
  console.log("➡️  Sekarang login melalui /login");
  console.log("➡️  Setelah login akan diarahkan ke /owner");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Gagal membuat OWNER:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
