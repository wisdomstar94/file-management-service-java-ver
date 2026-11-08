import { ShareNoticeCard } from "@/components/domains/share-links/share-notice-card";
import { SharePageFrame } from "@/components/domains/share-links/share-page-frame";

export default function NotFound() {
  return (
    <SharePageFrame>
      <ShareNoticeCard icon="ti-link-off" tone="neutral" title="찾을 수 없는 페이지입니다">
        <p className="m-0 text-[14px] leading-relaxed text-sub">공유받은 링크 주소를 다시 확인하세요.</p>
      </ShareNoticeCard>
    </SharePageFrame>
  );
}
