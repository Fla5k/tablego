import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
    tableId: string;
  }>;
};

export async function PATCH(
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

    const { id, tableId } = await params;

    const restaurantId = Number(id);
    const parsedTableId = Number(tableId);

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0 ||
      !Number.isInteger(parsedTableId) ||
      parsedTableId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID restoran atau meja tidak valid.",
        },
        { status: 400 },
      );
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        id: parsedTableId,
        restaurantId,
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tidak ditemukan.",
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

    const duplicateTable =
      await prisma.restaurantTable.findFirst({
        where: {
          restaurantId,
          tableNumber: normalizedTableNumber,
          id: {
            not: parsedTableId,
          },
        },
        select: {
          id: true,
        },
      });

    if (duplicateTable) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor meja tersebut sudah digunakan.",
        },
        { status: 409 },
      );
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: {
        id: parsedTableId,
      },
      data: {
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
        message: "Meja berhasil diperbarui.",
        table: updatedTable,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Owner restaurant table PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui meja.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const { id, tableId } = await params;

    const restaurantId = Number(id);
    const parsedTableId = Number(tableId);

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0 ||
      !Number.isInteger(parsedTableId) ||
      parsedTableId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID restoran atau meja tidak valid.",
        },
        { status: 400 },
      );
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        id: parsedTableId,
        restaurantId,
      },
      select: {
        id: true,
        tableNumber: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const bookingCount = await prisma.booking.count({
      where: {
        tableId: parsedTableId,
      },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Meja tidak dapat dihapus karena sudah memiliki riwayat booking.",
        },
        { status: 409 },
      );
    }

    await prisma.restaurantTable.delete({
      where: {
        id: parsedTableId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Meja berhasil dihapus.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Owner restaurant table DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus meja.",
      },
      { status: 500 },
    );
  }
}