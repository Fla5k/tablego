import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            tables: true,
            bookings: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        restaurants,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin restaurants GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data restoran.",
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

    const {
      name,
      description,
      address,
      phone,
      image,
    } = body;

    if (!name || !address) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama dan alamat restoran wajib diisi.",
        },
        { status: 400 },
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        address: address.trim(),
        phone: phone?.trim() || null,
        image: image?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restoran berhasil ditambahkan.",
        restaurant,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin restaurants POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan restoran.",
      },
      { status: 500 },
    );
  }
}