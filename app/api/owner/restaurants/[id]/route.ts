import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/auth";
import { validateOperatingHours } from "@/lib/restaurant-hours";

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
            name: "asc",
          },
        },
        operatingHours: {
          orderBy: {
            dayOfWeek: "asc",
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
    console.error("Owner restaurant GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data restoran.",
      },
      { status: 500 },
    );
  }
}

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

    const existingRestaurant =
      await prisma.restaurant.findUnique({
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
      operatingHours,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama restoran dan alamat wajib diisi.",
        },
        { status: 400 },
      );
    }

    let normalizedParentId: number | null =
      existingRestaurant.parentId;

    if (parentId !== undefined) {
      if (parentId === null || parentId === "") {
        normalizedParentId = null;
      } else {
        const parsedParentId = Number(parentId);

        if (
          !Number.isInteger(parsedParentId) ||
          parsedParentId <= 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Parent restoran tidak valid.",
            },
            { status: 400 },
          );
        }

        if (parsedParentId === restaurantId) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Restoran tidak dapat menjadi parent untuk dirinya sendiri.",
            },
            { status: 400 },
          );
        }

        const parentRestaurant =
          await prisma.restaurant.findUnique({
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
              message: "Parent restoran tidak ditemukan.",
            },
            { status: 404 },
          );
        }

        if (parentRestaurant.parentId !== null) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Cabang tidak dapat dijadikan parent restoran lain.",
            },
            { status: 400 },
          );
        }

        normalizedParentId = parsedParentId;
      }
    }

    let normalizedOperatingHours:
      | {
          dayOfWeek: number;
          openTime: string;
          closeTime: string;
          isClosed: boolean;
        }[]
      | undefined;

    if (operatingHours !== undefined) {
      if (!Array.isArray(operatingHours)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Jam operasional harus berupa array.",
          },
          { status: 400 },
        );
      }

      normalizedOperatingHours = operatingHours.map(
        (hour) => ({
          dayOfWeek: Number(hour.dayOfWeek),
          openTime:
            typeof hour.openTime === "string"
              ? hour.openTime
              : "",
          closeTime:
            typeof hour.closeTime === "string"
              ? hour.closeTime
              : "",
          isClosed: Boolean(hour.isClosed),
        }),
      );

      const operatingHoursError =
        validateOperatingHours(
          normalizedOperatingHours,
        );

      if (operatingHoursError) {
        return NextResponse.json(
          {
            success: false,
            message: operatingHoursError,
          },
          { status: 400 },
        );
      }
    }

    const restaurant = await prisma.$transaction(
      async (tx) => {
        await tx.restaurant.update({
          where: {
            id: restaurantId,
          },
          data: {
            name: name.trim(),
            description:
              typeof description === "string" &&
              description.trim()
                ? description.trim()
                : null,
            address: address.trim(),
            phone:
              typeof phone === "string" &&
              phone.trim()
                ? phone.trim()
                : null,
            image:
              typeof image === "string" &&
              image.trim()
                ? image.trim()
                : null,
            parentId: normalizedParentId,
          },
        });

        if (normalizedOperatingHours) {
          await tx.restaurantOperatingHour.deleteMany({
            where: {
              restaurantId,
            },
          });

          await tx.restaurantOperatingHour.createMany({
            data: normalizedOperatingHours.map(
              (hour) => ({
                restaurantId,
                dayOfWeek: hour.dayOfWeek,
                openTime: hour.openTime,
                closeTime: hour.closeTime,
                isClosed: hour.isClosed,
              }),
            ),
          });
        }

        return tx.restaurant.findUnique({
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
                name: "asc",
              },
            },
            operatingHours: {
              orderBy: {
                dayOfWeek: "asc",
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
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Restoran berhasil diperbarui.",
        restaurant,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Owner restaurant PATCH error:", error);

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
            "Restoran tidak dapat dihapus karena masih memiliki cabang.",
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
    console.error("Owner restaurant DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus restoran.",
      },
      { status: 500 },
    );
  }
}