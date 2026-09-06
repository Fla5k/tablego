import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            tables: true,
            bookings: true,
          },
        },
        operatingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    const formattedRestaurants = restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
      description:
        restaurant.description ||
        "Restoran yang tersedia di TableGo.",
      address: restaurant.address,
      phone: restaurant.phone,
      image: restaurant.image,
      tableCount: restaurant._count.tables,
      bookingCount: restaurant._count.bookings,
      operatingHours: restaurant.operatingHours.map((hour) => ({
        id: hour.id,
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        restaurants: formattedRestaurants,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Public restaurants GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data restoran.",
      },
      { status: 500 },
    );
  }
}