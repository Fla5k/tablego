import { NextResponse } from "next/server";

import { getCurrentOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatuses = [
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
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
          message: "Status booking tidak valid.",
        },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (
      booking.status !== "PENDING" &&
      booking.status !== "CONFIRMED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ini sudah tidak dapat diproses.",
        },
        { status: 400 },
      );
    }

    if (
      booking.status === "PENDING" &&
      status === "COMPLETED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking yang masih menunggu konfirmasi tidak dapat langsung diselesaikan.",
        },
        { status: 400 },
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
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

    return NextResponse.json({
      success: true,
      message: "Status booking berhasil diperbarui.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("OWNER UPDATE BOOKING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui status booking.",
      },
      { status: 500 },
    );
  }
}