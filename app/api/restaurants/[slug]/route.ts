import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { slug } = await params;

    const url = new URL(request.url);

    const date = url.searchParams.get("date");
    const time = url.searchParams.get("time");

    // =========================================================
    // CARI RESTORAN
    // =========================================================

    const restaurants = await prisma.restaurant.findMany({
      include: {
        tables: {
          include: {
            bookings: {
              where: {
                status: {
                  in: ["PENDING", "CONFIRMED"],
                },
              },
              select: {
                id: true,
                bookingDate: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const restaurant = restaurants.find(
      (item) =>
        item.name.toLowerCase().replace(/\s+/g, "-") ===
        slug.toLowerCase(),
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

    // =========================================================
    // PARSE WAKTU BOOKING
    // =========================================================

    let selectedDateTime: Date | null = null;

    if (date && time) {
      const dateTimeString = `${date}T${time}:00+07:00`;

      const parsedDateTime = new Date(dateTimeString);

      if (Number.isNaN(parsedDateTime.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal atau waktu tidak valid.",
          },
          { status: 400 },
        );
      }

      selectedDateTime = parsedDateTime;
    }

    // =========================================================
    // CEK KETERSEDIAAN MEJA
    // =========================================================

    const tables = restaurant.tables.map((table) => {
      let available = true;

      if (selectedDateTime) {
        available = !table.bookings.some((booking) => {
          const bookingDate = new Date(booking.bookingDate);

          return (
            bookingDate.getTime() === selectedDateTime!.getTime()
          );
        });
      }

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        available,
      };
    });

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          phone: restaurant.phone,
          image: restaurant.image,
          tables,
        },
      },
      { status: 200 },
    );
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