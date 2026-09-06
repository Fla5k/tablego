import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateOperatingHours } from "@/lib/restaurant-hours";

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
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        operatingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
        _count: {
          select: {
            tables: true,
            bookings: true,
            branches: true,
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
      parentId,
      operatingHours,
    } = body;

    if (
      typeof name !== "string" ||
      typeof address !== "string" ||
      !name.trim() ||
      !address.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama dan alamat restoran wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(operatingHours)) {
      return NextResponse.json(
        {
          success: false,
          message: "Jam operasional wajib diisi untuk 7 hari.",
        },
        { status: 400 },
      );
    }

    const operatingHoursError = validateOperatingHours(operatingHours);

    if (operatingHoursError) {
      return NextResponse.json(
        {
          success: false,
          message: operatingHoursError,
        },
        { status: 400 },
      );
    }

    let parsedParentId: number | null = null;

    if (
      parentId !== null &&
      parentId !== undefined &&
      parentId !== ""
    ) {
      parsedParentId = Number(parentId);

      if (
        !Number.isInteger(parsedParentId) ||
        parsedParentId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Restoran induk tidak valid.",
          },
          { status: 400 },
        );
      }

      const parentRestaurant =
        await prisma.restaurant.findUnique({
          where: {
            id: parsedParentId,
          },
          select: {
            id: true,
            name: true,
            parentId: true,
          },
        });

      if (!parentRestaurant) {
        return NextResponse.json(
          {
            success: false,
            message: "Restoran induk tidak ditemukan.",
          },
          { status: 404 },
        );
      }

      // Restoran induk harus merupakan restoran utama.
      if (parentRestaurant.parentId !== null) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Restoran induk yang dipilih sudah merupakan cabang. Pilih restoran utama.",
          },
          { status: 400 },
        );
      }
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),

        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,

        address: address.trim(),

        phone:
          typeof phone === "string" && phone.trim()
            ? phone.trim()
            : null,

        image:
          typeof image === "string" && image.trim()
            ? image.trim()
            : null,

        parentId: parsedParentId,

        operatingHours: {
          create: operatingHours.map(
            (hour: {
              dayOfWeek: number;
              openTime: string;
              closeTime: string;
              isClosed: boolean;
            }) => ({
              dayOfWeek: hour.dayOfWeek,
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              isClosed: hour.isClosed,
            }),
          ),
        },
      },

      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },

        branches: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },

        operatingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },

        _count: {
          select: {
            tables: true,
            bookings: true,
            branches: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: parsedParentId
          ? "Cabang restoran berhasil ditambahkan."
          : "Restoran utama berhasil ditambahkan.",
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