import ws from "ws";
import * as schema from "./schema";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

// Initialize database connection - use a placeholder during deployment validation
const databaseUrl = env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
