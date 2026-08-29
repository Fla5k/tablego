import { NextResponse } from "next/server";
import { getCurrentManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const manager = await getCurrentManager();

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk MANAGER.",
        },
        { status: 403 },
      );
    }

    const restaurantId = manager.restaurantId;

    if (restaurantId === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager belum memiliki cabang.",
        },
        { status: 403 },
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
          id: manager.restaurant?.id,
          name: manager.restaurant?.name,
          address: manager.restaurant?.address,
        },
        tables,
        totalTables: tables.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manager tables GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data meja.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const manager = await getCurrentManager();

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk MANAGER.",
        },
        { status: 403 },
      );
    }

    const restaurantId = manager.restaurantId;

    if (restaurantId === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager belum memiliki cabang.",
        },
        { status: 403 },
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

    const existingTable =
      await prisma.restaurantTable.findUnique({
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
          message: `Meja ${cleanTableNumber} sudah ada di cabang ini.`,
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
    console.error("Manager tables POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan meja.",
      },
      { status: 500 },
    );
  }
}
