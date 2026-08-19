import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tablego_session";

export async function POST(request: Request) {
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
    // BACA REQUEST
    // =========================================================

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

    // =========================================================
    // PARSE BOOKING DATE
    // =========================================================

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

    // =========================================================
    // CEK BOOKING DI DALAM TRANSACTION
    // =========================================================

    const booking = await prisma.$transaction(
      async (tx) => {
        // -----------------------------------------------------
        // USER
        // -----------------------------------------------------

        const user = await tx.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            role: true,
          },
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        if (user.role !== "CUSTOMER") {
          throw new Error("ADMIN_BOOKING_NOT_ALLOWED");
        }

        // -----------------------------------------------------
        // RESTAURANT
        // -----------------------------------------------------

        const restaurant = await tx.restaurant.findUnique({
          where: {
            id: restaurantId,
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (!restaurant) {
          throw new Error("RESTAURANT_NOT_FOUND");
        }

        // -----------------------------------------------------
        // TABLE
        // -----------------------------------------------------

        const table = await tx.restaurantTable.findFirst({
          where: {
            id: tableId,
            restaurantId,
          },
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
          },
        });

        if (!table) {
          throw new Error("TABLE_NOT_FOUND");
        }

        // -----------------------------------------------------
        // KAPASITAS
        // -----------------------------------------------------

        if (guestCount > table.capacity) {
          throw new Error("TABLE_CAPACITY_EXCEEDED");
        }

        // -----------------------------------------------------
        // CEK BOOKING YANG BENTROK
        // -----------------------------------------------------

        const existingBooking = await tx.booking.findFirst({
          where: {
            restaurantId,
            tableId,
            bookingDate: parsedBookingDate,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            id: true,
            bookingDate: true,
            status: true,
          },
        });

        if (existingBooking) {
          throw new Error("BOOKING_CONFLICT");
        }

        // -----------------------------------------------------
        // CREATE BOOKING
        // -----------------------------------------------------

        return tx.booking.create({
          data: {
            userId: user.id,
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
      },
      {
        isolationLevel: "Serializable",
      },
    );

    // =========================================================
    // SUCCESS
    // =========================================================

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

    // =========================================================
    // CUSTOM ERRORS
    // =========================================================

    if (error instanceof Error) {
      switch (error.message) {
        case "USER_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "User tidak ditemukan.",
            },
            { status: 401 },
          );

        case "ADMIN_BOOKING_NOT_ALLOWED":
          return NextResponse.json(
            {
              success: false,
              message: "Akun admin tidak dapat melakukan booking.",
            },
            { status: 403 },
          );

        case "RESTAURANT_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Restoran tidak ditemukan.",
            },
            { status: 404 },
          );

        case "TABLE_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Meja tidak ditemukan di restoran tersebut.",
            },
            { status: 404 },
          );

        case "TABLE_CAPACITY_EXCEEDED":
          return NextResponse.json(
            {
              success: false,
              message: "Jumlah tamu melebihi kapasitas meja.",
            },
            { status: 400 },
          );

        case "BOOKING_CONFLICT":
          return NextResponse.json(
            {
              success: false,
              message:
                "Meja tersebut sudah dibooking pada waktu tersebut.",
            },
            { status: 409 },
          );
      }
    }

    // =========================================================
    // PRISMA SERIALIZATION CONFLICT
    // =========================================================

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Meja baru saja dibooking customer lain. Silakan pilih meja atau waktu lain.",
        },
        { status: 409 },
      );
    }

    // =========================================================
    // GENERAL ERROR
    // =========================================================

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat booking.",
      },
      { status: 500 },
    );
  }
}