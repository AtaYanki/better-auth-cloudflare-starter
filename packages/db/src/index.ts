import { env } from "cloudflare:workers";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

neonConfig.poolQueryViaFetch = true;

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL environment variable is required");
}
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
