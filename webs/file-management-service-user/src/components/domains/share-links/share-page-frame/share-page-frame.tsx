import type { ReactNode } from "react";

export function SharePageFrame(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-7 bg-canvas px-5 pt-14 pb-30">
      <div className="flex items-center gap-2 text-[13.5px] font-semibold text-sub">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-[14px] text-white">
          <i className="ti ti-folders" aria-hidden />
        </div>
        파일 공유
      </div>
      {props.children}
    </div>
  );
}
