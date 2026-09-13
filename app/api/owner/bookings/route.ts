import { NextResponse } from "next/server";

import { getCurrentOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const bookings = await prisma.booking.findMany({
      orderBy: [
        {
          bookingDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
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
      bookings,
    });
  } catch (error) {
    console.error("OWNER GET BOOKINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data booking.",
      },
      { status: 500 },
    );
  }
}