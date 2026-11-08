package com.fms.api.domains.document;

import java.util.List;

public record DocumentDetailResponse(
        String id,
        String name,
        String defaultVersionId,
        DocumentVersionResponse latestVersion,
        List<DocumentVersionResponse> versions,
        String createdAt,
        String updatedAt) {

    public record DocumentVersionResponse(
            String id,
            int seq,
            String versionName,
            String fileName,
            long fileSize,
            String mimeType,
            boolean isLatest,
            boolean isDefault,
            String createdAt,
            String updatedAt) {}
}
