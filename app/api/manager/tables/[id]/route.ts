import { NextResponse } from "next/server";
import { getCurrentManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
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

    const { id } = await params;
    const tableId = Number(id);

    if (!Number.isInteger(tableId) || tableId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID meja tidak valid.",
        },
        { status: 400 },
      );
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        id: tableId,
        restaurantId,
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tidak ditemukan di cabang kamu.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const { tableNumber, capacity } = body;

    if (
      tableNumber !== undefined &&
      (!String(tableNumber).trim() || tableNumber === null)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor meja tidak boleh kosong.",
        },
        { status: 400 },
      );
    }

    if (
      capacity !== undefined &&
      (!Number.isInteger(Number(capacity)) ||
        Number(capacity) <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Kapasitas meja harus berupa angka lebih dari 0.",
        },
        { status: 400 },
      );
    }

    const cleanTableNumber =
      tableNumber !== undefined
        ? String(tableNumber).trim()
        : table.tableNumber;

    if (tableNumber !== undefined) {
      const duplicateTable =
        await prisma.restaurantTable.findFirst({
          where: {
            restaurantId,
            tableNumber: cleanTableNumber,
            NOT: {
              id: tableId,
            },
          },
        });

      if (duplicateTable) {
        return NextResponse.json(
          {
            success: false,
            message: `Meja ${cleanTableNumber} sudah digunakan.`,
          },
          { status: 409 },
        );
      }
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: {
        id: tableId,
      },
      data: {
        tableNumber: cleanTableNumber,

        ...(capacity !== undefined && {
          capacity: Number(capacity),
        }),
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
    console.error("Manager table PATCH error:", error);

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
  request: Request,
  { params }: RouteContext,
) {
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

    const { id } = await params;
    const tableId = Number(id);

    if (!Number.isInteger(tableId) || tableId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID meja tidak valid.",
        },
        { status: 400 },
      );
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        id: tableId,
        restaurantId,
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Meja tidak ditemukan di cabang kamu.",
        },
        { status: 404 },
      );
    }

    if (table._count.bookings > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Meja tidak dapat dihapus karena sudah memiliki riwayat booking.",
        },
        { status: 400 },
      );
    }

    await prisma.restaurantTable.delete({
      where: {
        id: tableId,
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
    console.error("Manager table DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus meja.",
      },
      { status: 500 },
    );
  }
}
