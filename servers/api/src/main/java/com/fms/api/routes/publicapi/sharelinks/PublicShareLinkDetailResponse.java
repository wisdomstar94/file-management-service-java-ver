package com.fms.api.routes.publicapi.sharelinks;

import com.fms.api.domains.sharelink.ShareLinkAvailability;
import java.util.List;

/**
 * @param otherVersions 「기본 버전 외 다른 버전 표시」 가 꺼져 있으면 {@code null}
 * @param downloadStatus 「다운로드 현황 표시」 가 꺼져 있으면 {@code null}
 */
record PublicShareLinkDetailResponse(
        String documentName,
        PublicShareLinkVersion defaultVersion,
        List<PublicShareLinkVersion> otherVersions,
        boolean isAllowOtherVersionDownload,
        DownloadStatus downloadStatus,
        String availableFrom,
        String availableUntil,
        ShareLinkAvailability availability) {

    record DownloadStatus(int downloadCount, Integer maxDownloadCount) {}
}
