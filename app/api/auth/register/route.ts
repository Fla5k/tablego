import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["CUSTOMER", "ADMIN"] as const;

type UserRole = (typeof VALID_ROLES)[number];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password, phone, role } = body;

    if (!name || !email || !password) {
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

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email wajib diisi.",
        },
        { status: 400 },
      );
    }

    const normalizedName = name.trim();

    if (!normalizedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 },
      );
    }

    const selectedRole: UserRole = VALID_ROLES.includes(role)
      ? role
      : "CUSTOMER";

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar.",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        role: selectedRole,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat registrasi.",
      },
      { status: 500 },
    );
  }
}