import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email wajib diisi.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun dengan email tersebut tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email kamu sudah terverifikasi. Silakan login.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
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
      console.error("Resend verification email error:", emailError);

      return NextResponse.json(
        {
          success: false,
          message: "Email verifikasi gagal dikirim. Silakan coba lagi.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Email verifikasi berhasil dikirim ulang. Silakan cek inbox atau folder spam.",
    });
  } catch (error) {
    console.error("Resend verification API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengirim ulang email verifikasi.",
      },
      { status: 500 },
    );
  }
}
