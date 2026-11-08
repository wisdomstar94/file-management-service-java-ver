import { ROUTES } from "./_consts/breadcrumb-routes";
import type { Breadcrumb } from "./_types/breadcrumb";

export function readBreadcrumbs(pathname: string): Breadcrumb[] {
  return ROUTES.find((route) => route.pattern.test(pathname))?.crumbs ?? [];
}
