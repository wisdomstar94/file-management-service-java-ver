import { randomUUID } from "node:crypto";

export function uniqueName(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}
