import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tablego_session";

export async function POST(request: Request) {
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

    const body = await request.json();

    const restaurantId = Number(body.restaurantId);
    const tableId = Number(body.tableId);
    const guestCount = Number(body.guestCount);
    const bookingDate = body.bookingDate;

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0 ||
      !Number.isInteger(tableId) ||
      tableId <= 0 ||
      !Number.isInteger(guestCount) ||
      guestCount <= 0 ||
      !bookingDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data booking tidak lengkap atau tidak valid.",
        },
        { status: 400 },
      );
    }

    const parsedBookingDate = new Date(bookingDate);

    if (Number.isNaN(parsedBookingDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal booking tidak valid.",
        },
        { status: 400 },
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restoran tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        id: tableId,
        restaurantId,
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tidak ditemukan di restoran tersebut.",
        },
        { status: 404 },
      );
    }

    if (guestCount > table.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `Meja ${table.tableNumber} hanya memiliki kapasitas ${table.capacity} orang.`,
        },
        { status: 400 },
      );
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        tableId,
        bookingDate: parsedBookingDate,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tersebut sudah dibooking pada waktu tersebut.",
        },
        { status: 409 },
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        restaurantId,
        tableId,
        bookingDate: parsedBookingDate,
        guestCount,
        status: "PENDING",
      },
      include: {
        restaurant: true,
        table: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking berhasil dibuat.",
        booking,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat booking.",
      },
      { status: 500 },
    );
  }
}