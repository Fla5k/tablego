import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET semua meja dalam restoran
export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk ADMIN.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const restaurantId = Number(id);

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID restoran tidak valid.",
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

    const tables = await prisma.restaurantTable.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        tableNumber: "asc",
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
        },
        tables,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin restaurant tables GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data meja.",
      },
      { status: 500 },
    );
  }
}

// POST tambah meja baru
export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk ADMIN.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const restaurantId = Number(id);

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID restoran tidak valid.",
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

    const body = await request.json();

    const { tableNumber, capacity } = body;

    if (!tableNumber || !String(tableNumber).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor meja wajib diisi.",
        },
        { status: 400 },
      );
    }

    const parsedCapacity = Number(capacity);

    if (
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Kapasitas meja harus berupa angka lebih dari 0.",
        },
        { status: 400 },
      );
    }

    const cleanTableNumber = String(tableNumber).trim();

    const existingTable = await prisma.restaurantTable.findUnique({
      where: {
        restaurantId_tableNumber: {
          restaurantId,
          tableNumber: cleanTableNumber,
        },
      },
    });

    if (existingTable) {
      return NextResponse.json(
        {
          success: false,
          message: `Meja ${cleanTableNumber} sudah ada di restoran ini.`,
        },
        { status: 409 },
      );
    }

    const table = await prisma.restaurantTable.create({
      data: {
        restaurantId,
        tableNumber: cleanTableNumber,
        capacity: parsedCapacity,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Meja berhasil ditambahkan.",
        table,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin restaurant tables POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan meja.",
      },
      { status: 500 },
    );
  }
}