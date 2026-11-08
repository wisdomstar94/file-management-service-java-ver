export function readPageNumbers(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const middle = [page - 1, page, page + 1].filter((n) => n > 1 && n < totalPages);
  const numbers: (number | "…")[] = [1];
  if (middle[0] > 2) {
    numbers.push("…");
  }
  numbers.push(...middle);
  if (middle[middle.length - 1] < totalPages - 1) {
    numbers.push("…");
  }
  numbers.push(totalPages);
  return numbers;
}
