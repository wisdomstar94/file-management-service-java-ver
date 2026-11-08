import type { ReactNode } from "react";

/** 차단 · 없는 링크처럼 자료 정보 없이 안내만 하는 카드 */
export function ShareNoticeCard(props: {
  icon: string;
  tone: "danger" | "neutral";
  title: string;
  children: ReactNode;
}) {
  const { icon, tone, title, children } = props;
  return (
    <div className="flex w-115 max-w-full flex-col items-center gap-3 rounded-2xl border border-line bg-white px-8 py-10 text-center">
      <div
        className={`flex size-13 items-center justify-center rounded-full text-[26px] ${tone === "danger" ? "bg-danger-soft text-danger" : "bg-chip text-sub"}`}
      >
        <i className={`ti ${icon}`} aria-hidden />
      </div>
      <h1 className="mt-1.5 mb-0 text-[20px] font-bold">{title}</h1>
      {children}
    </div>
  );
}
