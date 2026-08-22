import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tablego_session";

export async function GET() {
  try {
    // =========================================================
    // CEK SESSION
    // =========================================================

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

    // =========================================================
    // UPDATE BOOKING YANG SUDAH EXPIRED
    // =========================================================
    //
    // Hanya booking PENDING yang akan menjadi EXPIRED.
    // Booking CONFIRMED tidak akan berubah.
    //
    // Jika waktu booking sudah lewat dari waktu sekarang,
    // maka booking dianggap kadaluarsa.
    // =========================================================

    const now = new Date();

    await prisma.booking.updateMany({
      where: {
        userId,
        status: "PENDING",
        bookingDate: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // =========================================================
    // AMBIL DATA BOOKING USER
    // =========================================================

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },
      orderBy: {
        bookingDate: "desc",
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
    });

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        bookings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data booking.",
      },
      { status: 500 },
    );
  }
}