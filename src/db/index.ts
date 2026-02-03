import { drizzle } from "drizzle-orm/neon-http";
import { customType } from "drizzle-orm/pg-core";

export const db = drizzle(process.env.DATABASE_URL!);


export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

