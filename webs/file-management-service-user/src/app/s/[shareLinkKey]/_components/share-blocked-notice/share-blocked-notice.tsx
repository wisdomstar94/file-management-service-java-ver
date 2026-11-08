import type { AccessPolicyDeniedDetails } from "@fms/types/errors/access-policy-denied-details";
import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import { ShareNoticeCard } from "@/components/domains/share-links/share-notice-card";

export function ShareBlockedNotice(props: { details: AccessPolicyDeniedDetails }) {
  const { details } = props;
  return (
    <ShareNoticeCard icon="ti-ban" tone="danger" title="접근이 차단된 링크입니다">
      <p className="m-0 text-[14px] leading-relaxed text-sub">
        이 링크에 설정된 접근 정책에 의해 현재 네트워크에서는 자료를 열 수 없습니다. 링크를 공유한 담당자에게
        문의하세요.
      </p>
      <div className="mt-1.5 font-mono text-[12px] text-faint">
        요청 IP {details.requestIp} · {formatDateTime(details.requestedAt)}
      </div>
    </ShareNoticeCard>
  );
}
