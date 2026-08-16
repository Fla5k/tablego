import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // =========================
    // CEK SESSION
    // =========================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu belum login.",
        },
        { status: 401 },
      );
    }

    // =========================
    // CEK ROLE ADMIN
    // =========================

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk admin.",
        },
        { status: 403 },
      );
    }

    // =========================
    // VALIDASI ID
    // =========================

    const { id } = await params;
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

    // =========================
    // VALIDASI STATUS
    // =========================

    const body = await request.json();
    const { status } = body;

    const allowedStatuses = ["CONFIRMED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status booking tidak valid.",
        },
        { status: 400 },
      );
    }

    // =========================
    // CARI BOOKING
    // =========================

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
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

    // =========================
    // HANYA PENDING YANG BISA
    // DIUBAH ADMIN
    // =========================

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ini sudah diproses.",
        },
        { status: 400 },
      );
    }

    // =========================
    // UPDATE STATUS
    // =========================

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

    return NextResponse.json(
      {
        success: true,
        message:
          status === "CONFIRMED"
            ? "Booking berhasil dikonfirmasi."
            : "Booking berhasil dibatalkan.",
        booking: updatedBooking,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin update booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui booking.",
      },
      { status: 500 },
    );
  }
}