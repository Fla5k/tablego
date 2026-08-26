import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentManager } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatuses = [
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
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

    const { id } = await context.params;
    const bookingId = Number(id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID booking tidak valid.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const status = body?.status;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status tidak valid. Manager hanya dapat menggunakan CONFIRMED, COMPLETED, atau CANCELLED.",
        },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        restaurantId,
      },
      select: {
        id: true,
        status: true,
        restaurantId: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking tidak ditemukan atau booking bukan milik cabang Manager.",
        },
        { status: 404 },
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status,
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
        message: "Status booking berhasil diperbarui.",
        booking: updatedBooking,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manager booking PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui status booking.",
      },
      { status: 500 },
    );
  }
}