import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import { AccessDeniedActions } from "./_components/access-denied-actions";
import { readDeniedDetails } from "./_utils/read-denied-details";

export default async function AccessDeniedPage() {
  const details = await readDeniedDetails();
  const rows = details
    ? [
        ["계정", `${details.accountLoginId ?? "-"} (${details.accountNickname ?? "-"})`],
        ["접근 정책 그룹", details.accessPolicyGroupName],
        ["실패한 규칙", details.failedReasons.join(", ")],
        ["요청 IP", details.requestIp],
        ["요청 시각", formatDateTime(details.requestedAt, true)],
      ]
    : [];

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-120 max-w-full flex-col items-center gap-3.5 text-center">
        <div className="rounded-full bg-danger-soft px-2.5 py-1 font-mono text-[13px] font-medium text-danger">
          403 FORBIDDEN
        </div>
        <h1 className="m-0 text-[26px] font-bold">접근 정책에 의해 차단되었습니다</h1>
        <p className="m-0 text-[14px] leading-relaxed text-sub">
          로그인된 계정에 할당된 접근 정책 그룹의 규칙을 통과하지 못했습니다. 허용된 네트워크에서 다시 시도하거나
          관리자에게 문의하세요.
        </p>
        {rows.length > 0 && (
          <dl className="mt-2 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 rounded-xl border border-line bg-white px-5 py-4 text-left text-[13px]">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-faint">{label}</dt>
                <dd className={`m-0 ${label === "요청 IP" ? "font-mono" : ""}`}>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <AccessDeniedActions />
      </div>
    </div>
  );
}
