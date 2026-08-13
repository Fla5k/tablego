import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Mulai seed database...");

  // =========================
  // USER
  // =========================

  let user = await prisma.user.findFirst({
    where: {
      email: "test@tablego.com",
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@tablego.com",
        password: "password123",
      },
    });

    console.log(`✅ User dibuat: ${user.name} (ID: ${user.id})`);
  } else {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: "Test User",
        password: "password123",
      },
    });

    console.log(`✅ User tersedia: ${user.name} (ID: ${user.id})`);
  }

  // =========================
  // RESTORAN
  // =========================

  const restaurants = [
    {
      name: "Kopi Senja",
      description:
        "Cafe nyaman dengan pilihan kopi, makanan ringan, dan suasana santai.",
      address: "Bandung, Jawa Barat",
      phone: "081234567890",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    },
    {
      name: "Dapur Nusantara",
      description:
        "Nikmati berbagai hidangan khas Indonesia dengan cita rasa autentik.",
      address: "Bandung, Jawa Barat",
      phone: "081234567891",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    },
    {
      name: "Sakura Ramen",
      description:
        "Ramen Jepang dengan kuah khas dan berbagai pilihan topping.",
      address: "Bandung, Jawa Barat",
      phone: "081234567892",
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
    },
    {
      name: "Urban Grill",
      description:
        "Tempat makan modern dengan berbagai pilihan grilled food.",
      address: "Bandung, Jawa Barat",
      phone: "081234567893",
      image:
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
    },
  ];

  // =========================
  // RESTORAN + MEJA
  // =========================

  for (const restaurantData of restaurants) {
    let restaurant = await prisma.restaurant.findFirst({
      where: {
        name: restaurantData.name,
      },
    });

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: restaurantData,
      });

      console.log(`✅ Restoran dibuat: ${restaurant.name}`);
    } else {
      restaurant = await prisma.restaurant.update({
        where: {
          id: restaurant.id,
        },
        data: restaurantData,
      });

      console.log(`♻️ Restoran sudah ada: ${restaurant.name}`);
    }

    // =========================
    // MEJA
    // =========================

    const tables = [
      { tableNumber: "T1", capacity: 2 },
      { tableNumber: "T2", capacity: 2 },
      { tableNumber: "T3", capacity: 4 },
      { tableNumber: "T4", capacity: 4 },
      { tableNumber: "T5", capacity: 6 },
    ];

    for (const tableData of tables) {
      const existingTable = await prisma.restaurantTable.findFirst({
        where: {
          restaurantId: restaurant.id,
          tableNumber: tableData.tableNumber,
        },
      });

      if (!existingTable) {
        await prisma.restaurantTable.create({
          data: {
            restaurantId: restaurant.id,
            tableNumber: tableData.tableNumber,
            capacity: tableData.capacity,
          },
        });
      }
    }

    console.log(`   🪑 5 meja tersedia untuk ${restaurant.name}`);
  }

  console.log("🎉 Seed database selesai!");
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });