import Link from "next/link";
import { readPageNumbers } from "./_utils/read-page-numbers";

/** `?page=N` 링크로 이동한다. 다른 쿼리(검색어 등)는 `buildHref` 가 유지한다. */
export function Pagination(props: { page: number; size: number; total: number; buildHref: (page: number) => string }) {
  const { page, size, total, buildHref } = props;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(total, page * size);
  const cellClassName = "flex size-8 items-center justify-center rounded-[7px] text-[13px]";

  return (
    <div className="flex items-center justify-between px-4 py-3 text-[13px] text-muted">
      <span>
        총 {total}건 중 {from}–{to}
      </span>
      <div className="flex gap-1">
        <Link
          aria-label="이전 페이지"
          href={buildHref(Math.max(1, page - 1))}
          className={`${cellClassName} border border-line-input text-muted`}
        >
          <i className="ti ti-chevron-left" aria-hidden />
        </Link>
        {readPageNumbers(page, totalPages).map((number, index) =>
          number === "…" ? (
            <span key={index === 1 ? "gap-left" : "gap-right"} className={cellClassName}>
              …
            </span>
          ) : (
            <Link
              key={number}
              href={buildHref(number)}
              aria-current={number === page ? "page" : undefined}
              className={`${cellClassName} ${number === page ? "bg-primary font-semibold text-white" : "text-muted"}`}
            >
              {number}
            </Link>
          ),
        )}
        <Link
          aria-label="다음 페이지"
          href={buildHref(Math.min(totalPages, page + 1))}
          className={`${cellClassName} border border-line-input text-muted`}
        >
          <i className="ti ti-chevron-right" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
