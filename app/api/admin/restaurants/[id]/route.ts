import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
      include: {
        tables: {
          orderBy: {
            tableNumber: "asc",
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
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

    return NextResponse.json(
      {
        success: true,
        restaurant,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin restaurant GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail restoran.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restoran tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      address,
      phone,
      image,
    } = body;

    if (name !== undefined && !name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama restoran tidak boleh kosong.",
        },
        { status: 400 },
      );
    }

    if (address !== undefined && !address?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Alamat restoran tidak boleh kosong.",
        },
        { status: 400 },
      );
    }

    const restaurant = await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        ...(name !== undefined && {
          name: name.trim(),
        }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(address !== undefined && {
          address: address.trim(),
        }),
        ...(phone !== undefined && {
          phone: phone?.trim() || null,
        }),
        ...(image !== undefined && {
          image: image?.trim() || null,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restoran berhasil diperbarui.",
        restaurant,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin restaurant PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui restoran.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
      include: {
        _count: {
          select: {
            bookings: true,
            tables: true,
          },
        },
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

    if (restaurant._count.bookings > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restoran tidak dapat dihapus karena sudah memiliki riwayat booking.",
        },
        { status: 400 },
      );
    }

    if (restaurant._count.tables > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restoran tidak dapat dihapus karena masih memiliki meja.",
        },
        { status: 400 },
      );
    }

    await prisma.restaurant.delete({
      where: {
        id: restaurantId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restoran berhasil dihapus.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin restaurant DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus restoran.",
      },
      { status: 500 },
    );
  }
}