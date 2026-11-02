ALTER TABLE "reservations" ADD COLUMN "reservedForId" TEXT;

UPDATE "reservations" SET "reservedForId" = "creatorId";

ALTER TABLE "reservations" ALTER COLUMN "reservedForId" SET NOT NULL;

ALTER TABLE "reservations"
ADD CONSTRAINT "reservations_reservedForId_fkey"
FOREIGN KEY ("reservedForId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "reservations_reservedForId_idx" ON "reservations"("reservedForId");
