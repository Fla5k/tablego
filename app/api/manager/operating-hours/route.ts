import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  validateOperatingHours,
  type OperatingHourInput,
} from "@/lib/restaurant-hours";
import { getCurrentManager } from "@/lib/auth";

export async function GET() {
  try {
    const manager = await getCurrentManager();

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk MANAGER.",
        },
        { status: 403 },
      );
    }

    const restaurantId = manager.restaurantId;

    if (restaurantId === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager belum memiliki cabang.",
        },
        { status: 403 },
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        operatingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Cabang restaurant tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        restaurant,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manager operating hours GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil jam operasional.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const manager = await getCurrentManager();

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk MANAGER.",
        },
        { status: 403 },
      );
    }

    const restaurantId = manager.restaurantId;

    if (restaurantId === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager belum memiliki cabang.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid.",
        },
        { status: 400 },
      );
    }

    const operatingHours = body.operatingHours;

    if (!Array.isArray(operatingHours)) {
      return NextResponse.json(
        {
          success: false,
          message: "Data jam operasional harus berupa array.",
        },
        { status: 400 },
      );
    }

    const normalizedHours: OperatingHourInput[] = operatingHours.map(
      (item) => ({
        dayOfWeek: Number(item?.dayOfWeek),
        openTime: typeof item?.openTime === "string" ? item.openTime : "",
        closeTime:
          typeof item?.closeTime === "string" ? item.closeTime : "",
        isClosed: Boolean(item?.isClosed),
      }),
    );

    const validationError = validateOperatingHours(normalizedHours);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError,
        },
        { status: 400 },
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
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
          message: "Cabang restaurant tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.restaurantOperatingHour.deleteMany({
        where: {
          restaurantId,
        },
      });

      await tx.restaurantOperatingHour.createMany({
        data: normalizedHours.map((hour) => ({
          restaurantId,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
        })),
      });
    });

    const updatedRestaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        operatingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Jam operasional berhasil diperbarui.",
        restaurant: updatedRestaurant,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manager operating hours PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui jam operasional.",
      },
      { status: 500 },
    );
  }
}