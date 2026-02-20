import { env } from "cloudflare:workers";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

neonConfig.poolQueryViaFetch = true;

// Initialize database connection - use a placeholder during deployment validation
const databaseUrl =
	env.DATABASE_URL ||
	"postgresql://placeholder:placeholder@localhost:5432/placeholder";
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
