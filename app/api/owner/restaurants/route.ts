import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/auth";
import { validateOperatingHours } from "@/lib/restaurant-hours";

export async function GET() {
  try {
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk OWNER." },
        { status: 403 },
      );
    }

    const restaurants = await prisma.restaurant.findMany({
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
            name: "asc",
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
      orderBy: {
        name: "asc",
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
    console.error("Owner restaurants GET error:", error);

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
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Akses hanya untuk OWNER." },
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
      !name.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama restoran dan alamat wajib diisi.",
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

    const normalizedOperatingHours = operatingHours.map((hour) => ({
      dayOfWeek: Number(hour.dayOfWeek),
      openTime:
        typeof hour.openTime === "string" ? hour.openTime : "",
      closeTime:
        typeof hour.closeTime === "string" ? hour.closeTime : "",
      isClosed: Boolean(hour.isClosed),
    }));

    const operatingHoursError = validateOperatingHours(
      normalizedOperatingHours,
    );

    if (operatingHoursError) {
      return NextResponse.json(
        {
          success: false,
          message: operatingHoursError,
        },
        { status: 400 },
      );
    }

    let normalizedParentId: number | null = null;

    if (
      parentId !== undefined &&
      parentId !== null &&
      parentId !== ""
    ) {
      const parsedParentId = Number(parentId);

      if (!Number.isInteger(parsedParentId) || parsedParentId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent restoran tidak valid.",
          },
          { status: 400 },
        );
      }

      const parentRestaurant = await prisma.restaurant.findUnique({
        where: {
          id: parsedParentId,
        },
        select: {
          id: true,
          parentId: true,
        },
      });

      if (!parentRestaurant) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent restoran tidak ditemukan.",
          },
          { status: 404 },
        );
      }

      if (parentRestaurant.parentId !== null) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cabang tidak dapat dijadikan parent restoran lain.",
          },
          { status: 400 },
        );
      }

      normalizedParentId = parsedParentId;
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
        parentId: normalizedParentId,
        operatingHours: {
          create: normalizedOperatingHours,
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
            name: "asc",
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
        message: "Restoran berhasil ditambahkan.",
        restaurant,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Owner restaurants POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan restoran.",
      },
      { status: 500 },
    );
  }
}