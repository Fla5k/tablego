ALTER TABLE "restaurants"
ADD COLUMN "parentId" INTEGER;

CREATE INDEX "restaurants_parentId_idx"
ON "restaurants"("parentId");

ALTER TABLE "restaurants"
ADD CONSTRAINT "restaurants_parentId_fkey"
FOREIGN KEY ("parentId")
REFERENCES "restaurants"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
