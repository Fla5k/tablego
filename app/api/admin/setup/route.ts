import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // =========================================================
    // CEK APAKAH SUDAH ADA ADMIN
    // =========================================================

    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    // =========================================================
    // JIKA SUDAH ADA ADMIN, SETUP DITUTUP
    // =========================================================

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akun ADMIN sudah tersedia. Endpoint setup tidak dapat digunakan lagi.",
        },
        { status: 403 },
      );
    }

    // =========================================================
    // BACA REQUEST
    // =========================================================

    const body = await request.json();

    const { name, email, password } = body;

    // =========================================================
    // VALIDASI INPUT
    // =========================================================

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, email, dan password wajib diisi.",
        },
        { status: 400 },
      );
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!cleanName || !normalizedEmail || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, email, dan password wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 6 karakter.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // CEK EMAIL
    // =========================================================

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        role: true,
      },
    });

    // =========================================================
    // USER SUDAH ADA
    // =========================================================

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email tersebut sudah terdaftar. Silakan gunakan email lain.",
        },
        { status: 409 },
      );
    }

    // =========================================================
    // HASH PASSWORD
    // =========================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================================================
    // BUAT ADMIN PERTAMA
    // =========================================================

    const admin = await prisma.user.create({
      data: {
        name: cleanName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        message: "Akun ADMIN berhasil dibuat.",
        user: admin,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat akun ADMIN.",
      },
      { status: 500 },
    );
  }
}