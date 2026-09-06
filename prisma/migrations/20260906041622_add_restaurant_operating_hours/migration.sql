-- CreateTable
CREATE TABLE "restaurant_operating_hours" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "restaurant_operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_operating_hours_restaurantId_idx" ON "restaurant_operating_hours"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_operating_hours_restaurantId_dayOfWeek_key" ON "restaurant_operating_hours"("restaurantId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "restaurant_operating_hours" ADD CONSTRAINT "restaurant_operating_hours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
