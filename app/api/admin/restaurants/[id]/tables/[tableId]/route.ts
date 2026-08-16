import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { id, tableId } = await params;

    const restaurantId = Number(id);
    const tableIdNumber = Number(tableId);

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0 ||
      !Number.isInteger(tableIdNumber) ||
      tableIdNumber <= 0
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
        id: tableIdNumber,
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

    if (tableNumber !== undefined && !tableNumber?.trim()) {
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
      (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Kapasitas meja harus berupa angka lebih dari 0.",
        },
        { status: 400 },
      );
    }

    if (tableNumber !== undefined) {
      const duplicateTable = await prisma.restaurantTable.findFirst({
        where: {
          restaurantId,
          tableNumber: tableNumber.trim(),
          NOT: {
            id: tableIdNumber,
          },
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
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: {
        id: tableIdNumber,
      },
      data: {
        ...(tableNumber !== undefined && {
          tableNumber: tableNumber.trim(),
        }),
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
    console.error("Admin table PATCH error:", error);

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

    const { id, tableId } = await params;

    const restaurantId = Number(id);
    const tableIdNumber = Number(tableId);

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0 ||
      !Number.isInteger(tableIdNumber) ||
      tableIdNumber <= 0
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
        id: tableIdNumber,
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
          message: "Meja tidak ditemukan.",
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
        id: tableIdNumber,
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
    console.error("Admin table DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus meja.",
      },
      { status: 500 },
    );
  }
}
