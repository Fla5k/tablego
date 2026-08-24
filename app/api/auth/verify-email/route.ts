import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token verifikasi tidak ditemukan.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Token verifikasi tidak valid atau sudah tidak tersedia.",
        },
        { status: 400 },
      );
    }

    // Kalau request kedua masuk setelah request pertama berhasil,
    // jangan dianggap sebagai error.
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Email sudah diverifikasi sebelumnya.",
      });
    }

    // Cek masa berlaku token
    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Token verifikasi sudah kedaluwarsa. Silakan minta email verifikasi baru.",
        },
        { status: 400 },
      );
    }

    // Tandai email sebagai terverifikasi.
    // Token TIDAK langsung dihapus agar request kedua
    // dari React Strict Mode tidak menghasilkan error.
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyVerified: false,
      message: "Email berhasil diverifikasi.",
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat verifikasi email.",
      },
      { status: 500 },
    );
  }
}
