import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Falta la vinculación Cloudflare D1 `DB`. Configura la base en wrangler.jsonc y vuelve a compilar y desplegar."
    );
  }

  return drizzle(env.DB, { schema });
}
