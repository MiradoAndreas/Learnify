import { drizzle } from "drizzle-orm/neon-http";
import { customType } from "drizzle-orm/pg-core";

console.log("Database URL : ", process.env.DATABASE_URL);

export const db = drizzle(process.env.DATABASE_URL!);

export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});
