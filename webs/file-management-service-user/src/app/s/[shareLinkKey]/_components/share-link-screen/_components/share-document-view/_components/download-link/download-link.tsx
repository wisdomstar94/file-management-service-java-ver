"use client";

import type { ReactNode } from "react";

/** 파일을 받는 동안 페이지는 그대로 두고, 잠시 뒤 `onDownload` 로 다운로드 현황을 다시 불러온다. */
export function DownloadLink(props: {
  href: string;
  className: string;
  isDisabled: boolean;
  onDownload: () => void;
  children: ReactNode;
}) {
  const { href, className, isDisabled, onDownload, children } = props;
  if (isDisabled) {
    return (
      <span
        aria-disabled="true"
        className={`${className} cursor-not-allowed border-line-table! bg-disabled-bg! text-disabled!`}
      >
        {children}
      </span>
    );
  }
  return (
    <a href={href} className={className} onClick={() => setTimeout(onDownload, 1000)}>
      {children}
    </a>
  );
}
