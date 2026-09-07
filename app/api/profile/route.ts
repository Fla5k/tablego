import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request) {
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

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : body.phone === null
          ? null
          : undefined;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama minimal 2 karakter.",
        },
        { status: 400 },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama maksimal 100 karakter.",
        },
        { status: 400 },
      );
    }

    if (phone !== undefined && phone !== null && phone.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor telepon terlalu panjang.",
        },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        ...(phone !== undefined ? { phone } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil diperbarui.",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile update API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui profil.",
      },
      { status: 500 },
    );
  }
}