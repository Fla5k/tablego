import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const time = url.searchParams.get("time");

    const restaurants = await prisma.restaurant.findMany({
      include: {
        operatingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
        tables: {
          include: {
            bookings: {
              where: {
                status: {
                  in: ["PENDING", "CONFIRMED"],
                },
              },
            },
          },
        },
      },
    });

    const restaurant = restaurants.find(
      (item) =>
        item.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase(),
    );

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restoran tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if ((date && !time) || (!date && time)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal atau waktu tidak lengkap.",
        },
        { status: 400 },
      );
    }

    let selectedDateTime: Date | null = null;

    if (date && time) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !/^\d{2}:\d{2}$/.test(time)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal atau waktu tidak valid.",
          },
          { status: 400 },
        );
      }

      selectedDateTime = new Date(`${date}T${time}:00+07:00`);

      if (Number.isNaN(selectedDateTime.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal atau waktu tidak valid.",
          },
          { status: 400 },
        );
      }
    }

    const tables = restaurant.tables.map((table) => {
      let available = true;

      if (selectedDateTime) {
        available = !table.bookings.some((booking) => {
          const bookingTime = new Date(booking.bookingDate);

          return bookingTime.getTime() === selectedDateTime!.getTime();
        });
      }

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        available,
      };
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        operatingHours: restaurant.operatingHours.map((hour) => ({
          id: hour.id,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
        })),
        tables,
      },
    });
  } catch (error) {
    console.error("Restaurant API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data restoran.",
      },
      { status: 500 },
    );
  }
}