import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

function validatePassword(password: string) {
  if (password.length < 12) {
    return "Password minimal 12 karakter.";
  }

  if (password.length > 128) {
    return "Password maksimal 128 karakter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password harus memiliki minimal 1 huruf kecil.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password harus memiliki minimal 1 huruf besar.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password harus memiliki minimal 1 angka.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password harus memiliki minimal 1 karakter khusus.";
  }

  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, email, dan password wajib diisi.",
        },
        { status: 400 },
      );
    }

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format email tidak valid.",
        },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(String(password));

    if (passwordError) {
      return NextResponse.json(
        {
          success: false,
          message: passwordError,
        },
        { status: 400 },
      );
    }

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

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    /*
     * SECURITY:
     * User tidak boleh menentukan role dari request.
     * Semua registrasi publik selalu menjadi CUSTOMER.
     */
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        role: "CUSTOMER",
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
    });

    try {
      await sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Registrasi gagal karena email verifikasi tidak dapat dikirim.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Registrasi berhasil. Silakan cek email untuk melakukan verifikasi.",
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