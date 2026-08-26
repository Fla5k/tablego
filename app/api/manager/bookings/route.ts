import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const bookings = await prisma.booking.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        table: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          restaurantId,
          restaurant: manager.restaurant,
        },
        bookings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manager bookings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data booking.",
      },
      { status: 500 },
    );
  }
}