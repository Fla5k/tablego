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
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        tables: {
          orderBy: {
            tableNumber: "asc",
          },
        },
        _count: {
          select: {
            bookings: true,
            branches: true,
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
      select: {
        id: true,
        parentId: true,
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
      parentId,
    } = body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Nama restoran tidak boleh kosong.",
          },
          { status: 400 },
        );
      }
    }

    if (address !== undefined) {
      if (typeof address !== "string" || !address.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Alamat restoran tidak boleh kosong.",
          },
          { status: 400 },
        );
      }
    }

    let parsedParentId: number | null | undefined = undefined;

    if (parentId !== undefined) {
      if (parentId === null || parentId === "") {
        parsedParentId = null;
      } else {
        parsedParentId = Number(parentId);

        if (
          !Number.isInteger(parsedParentId) ||
          parsedParentId <= 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Restoran induk tidak valid.",
            },
            { status: 400 },
          );
        }

        if (parsedParentId === restaurantId) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Restoran tidak dapat menjadi induknya sendiri.",
            },
            { status: 400 },
          );
        }

        const parentRestaurant = await prisma.restaurant.findUnique({
          where: {
            id: parsedParentId,
          },
          select: {
            id: true,
            parentId: true,
          },
        });

        if (!parentRestaurant) {
          return NextResponse.json(
            {
              success: false,
              message: "Restoran induk tidak ditemukan.",
            },
            { status: 404 },
          );
        }

        if (parentRestaurant.parentId !== null) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Restoran induk yang dipilih sudah merupakan cabang. Pilih restoran utama.",
            },
            { status: 400 },
          );
        }
      }
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
          description:
            typeof description === "string" && description.trim()
              ? description.trim()
              : null,
        }),

        ...(address !== undefined && {
          address: address.trim(),
        }),

        ...(phone !== undefined && {
          phone:
            typeof phone === "string" && phone.trim()
              ? phone.trim()
              : null,
        }),

        ...(image !== undefined && {
          image:
            typeof image === "string" && image.trim()
              ? image.trim()
              : null,
        }),

        ...(parentId !== undefined && {
          parentId: parsedParentId,
        }),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            tables: true,
            bookings: true,
            branches: true,
          },
        },
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
            branches: true,
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

    if (restaurant._count.branches > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restoran utama tidak dapat dihapus karena masih memiliki cabang. Hapus atau ubah cabangnya terlebih dahulu.",
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