ALTER TABLE "members"
ADD COLUMN "displayName" TEXT NOT NULL DEFAULT 'Membre';

CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED');
CREATE TYPE "ReservationVoteChoice" AS ENUM ('APPROVE', 'REJECT');

CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reservation_voters" (
    "reservation_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "choice" "ReservationVoteChoice",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_voters_pkey" PRIMARY KEY ("reservation_id", "member_id")
);

CREATE TABLE "booking_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "approval_enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "booking_settings" ("id", "approval_enabled", "updated_at")
VALUES ('global', false, CURRENT_TIMESTAMP);

CREATE INDEX "reservations_startDate_endDate_idx" ON "reservations"("startDate", "endDate");
CREATE INDEX "reservations_status_idx" ON "reservations"("status");
CREATE INDEX "reservation_voters_member_id_idx" ON "reservation_voters"("member_id");

ALTER TABLE "reservations"
ADD CONSTRAINT "reservations_creatorId_fkey"
FOREIGN KEY ("creatorId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reservation_voters"
ADD CONSTRAINT "reservation_voters_reservation_id_fkey"
FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reservation_voters"
ADD CONSTRAINT "reservation_voters_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
