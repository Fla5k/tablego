import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const restaurants = await prisma.restaurant.findMany({
      include: {
        tables: true,
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

    return NextResponse.json({
      success: true,
      restaurant,
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