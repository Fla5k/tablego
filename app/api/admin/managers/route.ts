import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk ADMIN.",
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
    console.error("Admin managers GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data Manager.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk ADMIN.",
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
      typeof phone === "string" && phone.trim() ? phone.trim() : null;

    const parsedRestaurantId = Number(restaurantId);

    if (
      !cleanName ||
      !normalizedEmail ||
      !password ||
      !Number.isInteger(parsedRestaurantId) ||
      parsedRestaurantId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, email, password, dan restoran wajib diisi.",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await prisma.user.create({
      data: {
        name: cleanName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: "MANAGER",
        restaurantId: parsedRestaurantId,
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Akun Manager berhasil dibuat.",
        manager,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin managers POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat akun Manager.",
      },
      { status: 500 },
    );
  }
}