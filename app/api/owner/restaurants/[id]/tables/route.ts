import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk OWNER.",
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
      select: {
        id: true,
        name: true,
        address: true,
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
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        tableNumber: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        restaurant,
        tables,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Owner restaurant tables GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data meja.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk OWNER.",
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
      select: {
        id: true,
        name: true,
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

    if (
      typeof tableNumber !== "string" ||
      !tableNumber.trim()
    ) {
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

    const normalizedTableNumber = tableNumber.trim();

    const existingTable =
      await prisma.restaurantTable.findUnique({
        where: {
          restaurantId_tableNumber: {
            restaurantId,
            tableNumber: normalizedTableNumber,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingTable) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor meja tersebut sudah digunakan.",
        },
        { status: 409 },
      );
    }

    const table = await prisma.restaurantTable.create({
      data: {
        restaurantId,
        tableNumber: normalizedTableNumber,
        capacity: parsedCapacity,
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
        message: "Meja berhasil ditambahkan.",
        table,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Owner restaurant tables POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan meja.",
      },
      { status: 500 },
    );
  }
}