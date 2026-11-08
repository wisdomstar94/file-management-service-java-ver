/** `?page=` 값을 1 이상의 정수로 읽는다. 잘못된 값이면 1 */
export function readPageParam(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}
