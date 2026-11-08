/** `2026-10-03` 같은 날짜 입력값을 한국 시간 하루의 시작 · 끝 시각(ISO)으로 바꾼다. 빈 값이면 `null` */
export function toKstDateBoundary(date: string, boundary: "start" | "end"): string | null {
  if (!date) {
    return null;
  }
  return boundary === "start" ? `${date}T00:00:00+09:00` : `${date}T23:59:59+09:00`;
}
