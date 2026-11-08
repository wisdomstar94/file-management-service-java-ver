export const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
