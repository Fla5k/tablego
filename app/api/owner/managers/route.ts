import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/auth";
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

function parseRestaurantId(value: unknown) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

/**
 * GET
 * Mengambil seluruh Manager untuk Owner.
 */
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

    const managers = await prisma.user.findMany({
      where: {
        role: "MANAGER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        restaurantId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        managers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Owner managers GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data Manager.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST
 * Owner membuat Manager baru.
 */
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

    const { name, email, password, phone, restaurantId } = body;

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

    const parsedRestaurantId = parseRestaurantId(restaurantId);

    if (
      !cleanName ||
      !normalizedEmail ||
      !password ||
      !parsedRestaurantId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama, email, password, dan restoran wajib diisi.",
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

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: parsedRestaurantId,
      },
      select: {
        id: true,
        name: true,
        address: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restoran yang dipilih tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    const verificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const manager = await prisma.user.create({
      data: {
        name: cleanName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: "MANAGER",
        restaurantId: parsedRestaurantId,
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
        restaurantId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    try {
      await sendVerificationEmail(
        manager.email,
        manager.name,
        verificationToken,
      );
    } catch (emailError) {
      console.error(
        "Owner manager verification email error:",
        emailError,
      );

      await prisma.user.delete({
        where: {
          id: manager.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Akun Manager tidak dapat dibuat karena email verifikasi gagal dikirim.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Akun Manager berhasil dibuat. Email verifikasi telah dikirim.",
        manager,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Owner managers POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat akun Manager.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH
 * Owner dapat mengubah nama, telepon, password,
 * dan cabang Manager.
 *
 * Email sengaja tidak dapat diubah.
 */
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

    const managerId = Number(body?.managerId);

    if (!Number.isInteger(managerId) || managerId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Manager tidak valid.",
        },
        { status: 400 },
      );
    }

    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "MANAGER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        restaurantId: true,
      },
    });

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const updateData: {
      name?: string;
      phone?: string | null;
      password?: string;
      restaurantId?: number;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Nama Manager tidak valid.",
          },
          { status: 400 },
        );
      }

      const cleanName = body.name.trim();

      if (!cleanName) {
        return NextResponse.json(
          {
            success: false,
            message: "Nama Manager wajib diisi.",
          },
          { status: 400 },
        );
      }

      updateData.name = cleanName;
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

      updateData.phone =
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

      updateData.password = await bcrypt.hash(
        body.password,
        12,
      );
    }

    if (body.restaurantId !== undefined) {
      const parsedRestaurantId = parseRestaurantId(
        body.restaurantId,
      );

      if (!parsedRestaurantId) {
        return NextResponse.json(
          {
            success: false,
            message: "Restoran tidak valid.",
          },
          { status: 400 },
        );
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: {
          id: parsedRestaurantId,
        },
        select: {
          id: true,
        },
      });

      if (!restaurant) {
        return NextResponse.json(
          {
            success: false,
            message: "Restoran tidak ditemukan.",
          },
          { status: 404 },
        );
      }

      updateData.restaurantId = parsedRestaurantId;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data yang diubah.",
        },
        { status: 400 },
      );
    }

    const updatedManager = await prisma.user.update({
      where: {
        id: manager.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        restaurantId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Data Manager berhasil diperbarui.",
        manager: updatedManager,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Owner managers PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui Manager.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE
 * Owner menghapus Manager.
 */
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

    const managerId = Number(body?.managerId);

    if (!Number.isInteger(managerId) || managerId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Manager tidak valid.",
        },
        { status: 400 },
      );
    }

    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "MANAGER",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: {
        id: manager.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Manager ${manager.name} berhasil dihapus.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Owner managers DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Manager tidak dapat dihapus. Pastikan Manager tidak memiliki data yang masih terhubung.",
      },
      { status: 500 },
    );
  }
}