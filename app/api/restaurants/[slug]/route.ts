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

    const tables = restaurant.tables.map((table) => {
      let available = true;

      if (date && time) {
        const selectedDateTime = new Date(`${date}T${time}:00+07:00`);

        available = !table.bookings.some((booking) => {
          const bookingTime = new Date(booking.bookingDate);

          return bookingTime.getTime() === selectedDateTime.getTime();
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