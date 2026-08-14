import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tablego_session";

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);

    if (!session?.value) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu belum login.",
        },
        { status: 401 },
      );
    }

    const userId = Number(session.value);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Session tidak valid.",
        },
        { status: 401 },
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

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
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

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ini tidak dapat dibatalkan.",
        },
        { status: 400 },
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking berhasil dibatalkan.",
        booking: updatedBooking,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cancel booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membatalkan booking.",
      },
      { status: 500 },
    );
  }
}