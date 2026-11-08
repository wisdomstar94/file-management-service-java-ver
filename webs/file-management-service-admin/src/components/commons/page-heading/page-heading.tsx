import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeading(props: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  const { title, description, back, actions } = props;
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-60 flex-1">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-[13px] text-muted">
            <i className="ti ti-arrow-left text-[15px]" aria-hidden />
            {back.label}
          </Link>
        )}
        <h1 className="m-0 text-[22px] font-bold tracking-[-0.01em]">{title}</h1>
        {description && <p className="mt-1.5 mb-0 text-[13.5px] text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
