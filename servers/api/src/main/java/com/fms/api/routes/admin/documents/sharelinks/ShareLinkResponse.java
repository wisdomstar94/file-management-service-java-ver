package com.fms.api.routes.admin.documents.sharelinks;

import com.fms.api.commons.IdName;
import com.fms.api.domains.sharelink.ShareLinkAvailability;
import com.fms.entities.ShareLinkDefaultVersionMode;

record ShareLinkResponse(
        String id,
        String shareLinkKey,
        IdName accessPolicyGroup,
        boolean hasPassword,
        int downloadCount,
        Integer maxDownloadCount,
        String availableFrom,
        String availableUntil,
        ShareLinkDefaultVersionMode defaultVersionMode,
        VersionSummary fixedVersion,
        /* 이 링크에서 실제로 기본으로 보여질 버전 */
        VersionSummary effectiveDefaultVersion,
        boolean isShowOtherVersions,
        boolean isAllowOtherVersionDownload,
        boolean isShowDownloadStatus,
        ShareLinkAvailability availability,
        String createdAt,
        String updatedAt) {

    record VersionSummary(String id, String versionName) {}
}
