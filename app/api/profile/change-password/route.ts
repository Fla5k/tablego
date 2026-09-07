import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Belum login.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua field password wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru minimal 8 karakter.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru maksimal 100 karakter.",
        },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Konfirmasi password baru tidak cocok.",
        },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru harus berbeda dari password lama.",
        },
        { status: 400 },
      );
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      await getStoredPassword(user.id),
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Password lama salah.",
        },
        { status: 401 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password berhasil diubah.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Change password API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengubah password.",
      },
      { status: 500 },
    );
  }
}

async function getStoredPassword(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("User tidak ditemukan.");
  }

  return user.password;
}