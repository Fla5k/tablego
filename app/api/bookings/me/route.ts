import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tablego_session";

function getDateRange(dateString: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  /*
   * TableGo menggunakan waktu Indonesia Barat (UTC+7).
   *
   * Contoh:
   * 2026-08-27 00:00 WIB
   * = 2026-08-26 17:00 UTC
   *
   * Karena database menyimpan DateTime, kita buat batas
   * awal dan akhir hari berdasarkan WIB.
   */

  const startOfDay = new Date(
    Date.UTC(year, month - 1, day, -7, 0, 0, 0),
  );

  const startOfNextDay = new Date(
    Date.UTC(year, month - 1, day + 1, -7, 0, 0, 0),
  );

  return {
    startOfDay,
    startOfNextDay,
  };
}

function getTodayString() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now);
}

export async function GET(request: Request) {
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
    // AMBIL FILTER TANGGAL
    // =========================================================

    const url = new URL(request.url);

    const requestedDate =
      url.searchParams.get("date") || getTodayString();

    const dateRange = getDateRange(requestedDate);

    if (!dateRange) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal tidak valid.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // UPDATE BOOKING YANG SUDAH EXPIRED
    // =========================================================

    /*
     * Hanya booking PENDING yang waktunya sudah lewat
     * yang akan menjadi EXPIRED.
     *
     * Booking CONFIRMED tidak diubah.
     */

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
    // AMBIL BOOKING BERDASARKAN TANGGAL
    // =========================================================

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        bookingDate: {
          gte: dateRange.startOfDay,
          lt: dateRange.startOfNextDay,
        },
      },

      orderBy: {
        bookingDate: "asc",
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
        selectedDate: requestedDate,
        bookings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat mengambil data booking.",
      },
      { status: 500 },
    );
  }
}