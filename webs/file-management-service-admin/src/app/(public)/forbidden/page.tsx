import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-110 max-w-full flex-col items-center gap-3.5 text-center">
        <div className="rounded-full bg-chip px-2.5 py-1 font-mono text-[13px] font-medium text-sub">
          PERMISSION DENIED
        </div>
        <h1 className="m-0 text-[24px] font-bold">이 화면을 볼 권한이 없습니다</h1>
        <p className="m-0 text-[14px] leading-relaxed text-sub">
          계정에 할당된 권한 그룹에 이 메뉴의 접근 권한이 없습니다. 필요하면 관리자에게 권한을 요청하세요.
        </p>
        <Link
          href="/"
          className="mt-1.5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-[13.5px] font-semibold text-white"
        >
          첫 화면으로
        </Link>
      </div>
    </div>
  );
}
