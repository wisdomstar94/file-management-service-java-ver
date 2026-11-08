import type { Breadcrumb } from "../../_types/breadcrumb";

export const ROUTES: { pattern: RegExp; crumbs: Breadcrumb[] }[] = [
  { pattern: /^\/documents\/[^/]+$/, crumbs: [{ label: "자료 관리", href: "/documents" }, { label: "자료 상세" }] },
  { pattern: /^\/documents$/, crumbs: [{ label: "자료 관리" }] },
  { pattern: /^\/accounts$/, crumbs: [{ label: "관리자 계정 관리" }] },
  {
    pattern: /^\/access-policy-groups\/new$/,
    crumbs: [{ label: "접근 정책 그룹 관리", href: "/access-policy-groups" }, { label: "새 접근 정책 그룹" }],
  },
  {
    pattern: /^\/access-policy-groups\/[^/]+$/,
    crumbs: [{ label: "접근 정책 그룹 관리", href: "/access-policy-groups" }, { label: "상세" }],
  },
  { pattern: /^\/access-policy-groups$/, crumbs: [{ label: "접근 정책 그룹 관리" }] },
  {
    pattern: /^\/permissions\/groups\/new$/,
    crumbs: [{ label: "권한 그룹 관리", href: "/permissions/groups" }, { label: "새 권한 그룹" }],
  },
  {
    pattern: /^\/permissions\/groups\/[^/]+$/,
    crumbs: [{ label: "권한 그룹 관리", href: "/permissions/groups" }, { label: "상세" }],
  },
  {
    pattern: /^\/permissions\/groups$/,
    crumbs: [{ label: "권한 관리", href: "/permissions/groups" }, { label: "권한 그룹 관리" }],
  },
  {
    pattern: /^\/permissions\/items$/,
    crumbs: [{ label: "권한 관리", href: "/permissions/groups" }, { label: "권한 관리" }],
  },
];
