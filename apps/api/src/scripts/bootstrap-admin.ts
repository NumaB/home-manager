import "../config/load-local-env";
import { createClerkClient } from "@clerk/backend";
import { MemberRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

function readClerkUserId(args: string[]): string {
  const flagIndex = args.indexOf("--clerk-user-id");
  const clerkUserId = flagIndex >= 0 ? args[flagIndex + 1] : undefined;

  if (!clerkUserId || !/^user_[A-Za-z0-9]+$/.test(clerkUserId)) {
    throw new Error(
      "Usage: pnpm --filter @home-manager/api bootstrap:admin -- --clerk-user-id user_...",
    );
  }

  return clerkUserId;
}

async function bootstrapAdmin() {
  const clerkUserId = readClerkUserId(process.argv.slice(2));
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is required to verify the Clerk user");
  }

  const clerk = createClerkClient({ secretKey });
  await clerk.users.getUser(clerkUserId);

  const prisma = new PrismaService();
  try {
    await prisma.$connect();
    const member = await prisma.member.upsert({
      where: { clerkUserId },
      update: { role: MemberRole.ADMIN, isActive: true },
      create: { clerkUserId, role: MemberRole.ADMIN },
    });
    console.log(`Administrator role granted to ${member.clerkUserId}.`);
  } finally {
    await prisma.$disconnect();
  }
}

void bootstrapAdmin().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Admin bootstrap failed",
  );
  process.exitCode = 1;
});
