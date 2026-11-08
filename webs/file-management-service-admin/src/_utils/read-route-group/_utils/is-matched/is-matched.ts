/** `pathname` 이 `paths` 중 하나와 같거나 그 하위 경로인지 */
export const isMatched = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
