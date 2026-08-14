import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // =========================
    // CEK SESSION USER
    // =========================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu harus login terlebih dahulu.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const {
      restaurantId,
      tableId,
      bookingDate,
      guestCount,
      notes,
    } = body;

    // =========================
    // VALIDASI DATA
    // =========================

    if (
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
        { status: 400 },
      );
    }

    const restaurantIdNumber = Number(restaurantId);
    const tableIdNumber = Number(tableId);
    const guestCountNumber = Number(guestCount);
    const selectedBookingDate = new Date(bookingDate);

    if (
      Number.isNaN(restaurantIdNumber) ||
      Number.isNaN(tableIdNumber) ||
      Number.isNaN(guestCountNumber) ||
      Number.isNaN(selectedBookingDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data booking tidak valid.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CEK RESTORAN
    // =========================

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantIdNumber,
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

    // =========================
    // CEK MEJA
    // =========================

    const table = await prisma.restaurantTable.findUnique({
      where: {
        id: tableIdNumber,
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    // Pastikan meja memang milik restoran yang dipilih
    if (table.restaurantId !== restaurantIdNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tidak tersedia di restoran tersebut.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CEK KAPASITAS MEJA
    // =========================

    if (guestCountNumber > table.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `Meja ${table.tableNumber} hanya memiliki kapasitas ${table.capacity} orang.`,
        },
        { status: 400 },
      );
    }

    // =========================
    // CEK DOUBLE BOOKING
    // =========================

    const existingBooking = await prisma.booking.findFirst({
      where: {
        restaurantId: restaurantIdNumber,
        tableId: tableIdNumber,
        bookingDate: selectedBookingDate,
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: `Meja ${table.tableNumber} sudah dibooking pada tanggal dan waktu tersebut.`,
        },
        { status: 409 },
      );
    }

    // =========================
    // BUAT BOOKING
    // =========================

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        restaurantId: restaurantIdNumber,
        tableId: tableIdNumber,
        bookingDate: selectedBookingDate,
        guestCount: guestCountNumber,
        notes: notes || null,
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
    console.error("Booking API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat booking.",
      },
      { status: 500 },
    );
  }
}