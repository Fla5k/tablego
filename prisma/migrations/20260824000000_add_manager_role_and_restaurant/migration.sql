-- Add MANAGER role
ALTER TYPE "UserRole" ADD VALUE 'MANAGER';

-- Add restaurant assignment for managers
ALTER TABLE "users"
ADD COLUMN "restaurantId" INTEGER;

-- Add index for restaurant assignment
CREATE INDEX "users_restaurantId_idx"
ON "users"("restaurantId");

-- Add relation from users to restaurants
ALTER TABLE "users"
ADD CONSTRAINT "users_restaurantId_fkey"
FOREIGN KEY ("restaurantId")
REFERENCES "restaurants"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;