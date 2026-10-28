import dotenv from "dotenv";

// Injected process variables take precedence. Load the local Clerk development
// key first, then root app settings; dotenv does not override existing values.
dotenv.config({ path: "../web/.env.local" });
dotenv.config({ path: "../../.env" });
