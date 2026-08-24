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

    const bookings = await prisma.booking.findMany({
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
        bookings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin bookings API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data booking.",
      },
      { status: 500 },
    );
  }
}