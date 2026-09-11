import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

export async function GET() {
  try {
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk OWNER.",
        },
        { status: 403 },
      );
    }

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Owner admins GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data Admin.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk OWNER.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { name, email, password, phone } = body;

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
    const cleanPhone =
      typeof phone === "string" && phone.trim()
        ? phone.trim()
        : null;

    if (!cleanName || !normalizedEmail || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, email, dan password wajib diisi.",
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

    const passwordError = validatePassword(password);

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
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email tersebut sudah terdaftar.",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    const verificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const admin = await prisma.user.create({
      data: {
        name: cleanName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: "ADMIN",
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    try {
      await sendVerificationEmail(
        admin.email,
        admin.name,
        verificationToken,
      );
    } catch (emailError) {
      console.error(
        "Owner admin verification email error:",
        emailError,
      );

      await prisma.user.delete({
        where: {
          id: admin.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Admin tidak dapat dibuat karena email verifikasi gagal dikirim.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Admin berhasil dibuat. Email verifikasi telah dikirim.",
        admin,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Owner admins POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat Admin.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk OWNER.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const adminId = Number(body?.adminId);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Admin tidak valid.",
        },
        { status: 400 },
      );
    }

    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const data: {
      name?: string;
      phone?: string | null;
      password?: string;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Nama Admin tidak valid.",
          },
          { status: 400 },
        );
      }

      data.name = body.name.trim();
    }

    if (body.phone !== undefined) {
      if (
        body.phone !== null &&
        typeof body.phone !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Nomor telepon tidak valid.",
          },
          { status: 400 },
        );
      }

      data.phone =
        typeof body.phone === "string" && body.phone.trim()
          ? body.phone.trim()
          : null;
    }

    if (body.password !== undefined) {
      if (typeof body.password !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Password tidak valid.",
          },
          { status: 400 },
        );
      }

      const passwordError = validatePassword(body.password);

      if (passwordError) {
        return NextResponse.json(
          {
            success: false,
            message: passwordError,
          },
          { status: 400 },
        );
      }

      data.password = await bcrypt.hash(body.password, 12);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data yang diubah.",
        },
        { status: 400 },
      );
    }

    const updatedAdmin = await prisma.user.update({
      where: {
        id: admin.id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data Admin berhasil diperbarui.",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Owner admins PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui Admin.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk OWNER.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const adminId = Number(body?.adminId);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Admin tidak valid.",
        },
        { status: 400 },
      );
    }

    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: {
        id: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Admin ${admin.name} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Owner admins DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Admin tidak dapat dihapus. Pastikan tidak ada data yang masih terhubung.",
      },
      { status: 500 },
    );
  }
}
