"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import { ToastContext } from "./_contexts/toast-context";
import type { Toast } from "./_types/toast";

export function ToastProvider(props: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast({ message, tone });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setToast(null), tone === "error" ? 3200 : 1800);
  }, []);

  return (
    <ToastContext value={showToast}>
      {props.children}
      {toast && (
        <div
          role="status"
          className="fixed top-6 left-1/2 z-60 flex -translate-x-1/2 items-center gap-2 rounded-[9px] bg-ink px-4 py-2.5 text-[13.5px] text-white shadow-[0_8px_24px_rgba(0,0,0,.18)]"
        >
          <i
            className={`ti ${toast.tone === "error" ? "ti-alert-circle text-[#ff8a8a]" : "ti-circle-check text-[#5fd3a0]"} text-[17px]`}
            aria-hidden
          />
          {toast.message}
        </div>
      )}
    </ToastContext>
  );
}
