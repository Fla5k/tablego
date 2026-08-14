import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tablego_session";

export async function GET() {
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

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            image: true,
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
      orderBy: {
        bookingDate: "asc",
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
    console.error("Get my bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data booking.",
      },
      { status: 500 },
    );
  }
}