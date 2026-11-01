ALTER TABLE "members"
ADD COLUMN "displayNameInitialized" BOOLEAN NOT NULL DEFAULT false;

-- Names already synchronized from Clerk (or manually set) should not be
-- replaced by the first-login initializer.
UPDATE "members"
SET "displayNameInitialized" = true
WHERE "displayName" <> 'Membre';
