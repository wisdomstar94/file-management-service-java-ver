import { readDateTimeParts } from "../../_utils/read-date-time-parts/index.js";

/** `2026-10-03` (한국 시간) */
export function formatDate(iso: string): string {
  const p = readDateTimeParts(iso);
  return `${p.year}-${p.month}-${p.day}`;
}
