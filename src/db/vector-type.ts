// src/db/vector-type.ts

import { customType } from "drizzle-orm/pg-core";

export const vector = customType<{
  data: number[];
  driverData: string;
}>({
  dataType() {
    return "vector";
  },

  toDriver(value) {
    return `[${value.join(",")}]`;
  },

  fromDriver(value) {
    return value.slice(1, -1).split(",").map(Number);
  },
});
