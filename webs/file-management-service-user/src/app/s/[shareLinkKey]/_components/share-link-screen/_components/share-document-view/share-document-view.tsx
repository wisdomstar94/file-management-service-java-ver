import type { PUBLIC_SHARE_LINK_DETAIL_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { readFileIcon } from "@fms/web-utils/files/read-file-icon";
import { formatFileSize } from "@fms/web-utils/formats/format-file-size";
import { DownloadLink } from "./_components/download-link";
import { DownloadStatus } from "./_components/download-status";
import { DOWNLOAD_ERROR_MESSAGES } from "./_consts/download-error-messages";
import { UNAVAILABLE_MESSAGES } from "./_consts/unavailable-messages";
import { readPeriod } from "./_utils/read-period";

export function ShareDocumentView(props: {
  detail: ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API>["data"];
  downloadError?: string;
  /** 브라우저가 바로 이동할 api 다운로드 주소 */
  downloadHref: (versionId: string) => string;
  /** 다운로드를 시작하면 호출한다. 다운로드 현황을 다시 불러오는 데 쓴다. */
  onDownload: () => void;
}) {
  const { detail, downloadError, downloadHref, onDownload } = props;
  const isAvailable = detail.availability === "ACTIVE";
  const fileIcon = readFileIcon(detail.defaultVersion.fileName);
  const period = readPeriod(detail);
  const isShowDownloadStatus = (() => {
    if (detail.downloadStatus) {
      return true;
    }
    if (period) {
      return true;
    }
    return false;
  })();
  const notice =
    (downloadError && (DOWNLOAD_ERROR_MESSAGES[downloadError] ?? "다운로드하지 못했습니다.")) ||
    (detail.availability !== "ACTIVE" ? UNAVAILABLE_MESSAGES[detail.availability] : null);

  return (
    <div className="flex w-160 max-w-full flex-col gap-4">
      <section className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-7">
        <div>
          <div className="mb-1.5 text-[12.5px] text-faint">공유된 자료</div>
          <h1 className="m-0 text-[24px] font-bold tracking-[-0.01em]">{detail.documentName}</h1>
        </div>
        {isShowDownloadStatus && <DownloadStatus downloadStatus={detail.downloadStatus} period={period} />}
        {notice && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg bg-danger-soft px-3.5 py-3 text-[13px] text-danger"
          >
            <i className="ti ti-alert-circle text-[16px]" aria-hidden />
            {notice}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3.5 rounded-xl border border-line-table bg-surface-sub p-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-[10px] text-[22px]"
            style={{ color: fileIcon.color, background: `${fileIcon.color}14` }}
          >
            <i className={`ti ${fileIcon.icon}`} aria-hidden />
          </div>
          <div className="min-w-45 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[13px] font-semibold">{detail.defaultVersion.versionName}</span>
              <span className="rounded-full bg-success-soft px-1.75 py-0.5 text-[11px] font-semibold text-success">
                기본 버전
              </span>
            </div>
            <div className="mt-0.75 text-[13.5px] text-sub">
              {detail.defaultVersion.fileName} · {formatFileSize(detail.defaultVersion.fileSize)}
            </div>
          </div>
          <DownloadLink
            href={downloadHref(detail.defaultVersion.id)}
            isDisabled={!isAvailable}
            onDownload={onDownload}
            className="inline-flex h-11 items-center gap-1.75 rounded-[9px] border border-transparent bg-primary px-4.5 text-[14px] font-semibold text-white"
          >
            <i className="ti ti-download text-[17px]" aria-hidden />
            {detail.defaultVersion.versionName} 다운로드
          </DownloadLink>
        </div>
      </section>
      {detail.otherVersions && detail.otherVersions.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-line bg-white">
          <h2 className="m-0 border-b border-line-soft px-5.5 py-4 text-[15px] font-bold">버전 목록</h2>
          {detail.otherVersions.map((version) => (
            <div
              key={version.id}
              className="flex items-center gap-3.5 border-b border-line-row px-5.5 py-3.25 last:border-b-0"
            >
              <span className="w-14 font-mono text-[13px] font-semibold">{version.versionName}</span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-sub">{version.fileName}</span>
              <span className="shrink-0 text-[12.5px] text-faint">{formatFileSize(version.fileSize)}</span>
              {detail.isAllowOtherVersionDownload && (
                <DownloadLink
                  href={downloadHref(version.id)}
                  isDisabled={!isAvailable}
                  onDownload={onDownload}
                  className="inline-flex h-8 items-center gap-1.25 rounded-[7px] border border-line-input bg-white px-3 text-[12.5px] font-medium text-ink-2"
                >
                  <i className="ti ti-download text-[15px]" aria-hidden />
                  다운로드
                </DownloadLink>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
