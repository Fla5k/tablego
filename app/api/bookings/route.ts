import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      restaurantId,
      tableId,
      bookingDate,
      guestCount,
      notes,
    } = body;

    if (
      !userId ||
      !restaurantId ||
      !tableId ||
      !bookingDate ||
      !guestCount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data booking belum lengkap.",
        },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: Number(userId),
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        bookingDate: new Date(bookingDate),
        guestCount: Number(guestCount),
        notes: notes || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking berhasil dibuat.",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat booking.",
      },
      { status: 500 }
    );
  }
}