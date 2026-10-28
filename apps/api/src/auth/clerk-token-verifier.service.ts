import { Injectable } from "@nestjs/common";
import { verifyToken } from "@clerk/backend";

@Injectable()
export class ClerkTokenVerifier {
  private readonly secretKey: string;
  private readonly authorizedParties: string[];

  constructor() {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY must be configured to start the API");
    }

    const configuredParties =
      process.env.CLERK_AUTHORIZED_PARTIES ??
      process.env.WEB_ORIGINS ??
      "http://localhost:3000";
    this.authorizedParties = configuredParties
      .split(",")
      .map((party) => party.trim())
      .filter(Boolean);

    if (
      this.authorizedParties.length === 0 ||
      (process.env.NODE_ENV === "production" &&
        !process.env.CLERK_AUTHORIZED_PARTIES)
    ) {
      throw new Error(
        "Set CLERK_AUTHORIZED_PARTIES to the allowed web origins in production",
      );
    }

    this.secretKey = secretKey;
  }

  async verifySessionToken(token: string): Promise<string> {
    const result = await verifyToken(token, {
      secretKey: this.secretKey,
      authorizedParties: this.authorizedParties,
    });

    if (result.errors || !result.data?.sub) {
      throw new Error("The Clerk session token is invalid");
    }

    return result.data.sub;
  }
}
