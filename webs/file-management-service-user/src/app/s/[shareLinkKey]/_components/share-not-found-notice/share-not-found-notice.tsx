import { ShareNoticeCard } from "@/components/domains/share-links/share-notice-card";

export function ShareNotFoundNotice() {
  return (
    <ShareNoticeCard icon="ti-link-off" tone="neutral" title="찾을 수 없는 링크입니다">
      <p className="m-0 text-[14px] leading-relaxed text-sub">링크가 삭제되었거나 주소가 올바르지 않습니다.</p>
    </ShareNoticeCard>
  );
}
