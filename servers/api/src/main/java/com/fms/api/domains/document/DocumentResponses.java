package com.fms.api.domains.document;

import com.fms.api.commons.IsoTimes;
import com.fms.api.domains.documentversion.DocumentVersions;
import com.fms.entities.DocumentEntity;
import com.fms.entities.DocumentVersionEntity;
import java.util.UUID;

public final class DocumentResponses {
    private DocumentResponses() {}

    public static DocumentDetailResponse toDetail(DocumentWithVersions documentWithVersions) {
        DocumentEntity document = documentWithVersions.document();
        DocumentVersionEntity latest = DocumentVersions.findLatest(documentWithVersions.versions());
        UUID defaultVersionId = DocumentVersions.resolveDefault(
                        documentWithVersions.versions(), document.getDefaultVersionId())
                .getId();
        return new DocumentDetailResponse(
                document.getId().toString(),
                document.getName(),
                document.getDefaultVersionId() == null
                        ? null
                        : document.getDefaultVersionId().toString(),
                toVersion(latest, latest.getId(), defaultVersionId),
                documentWithVersions.versions().stream()
                        .map(version -> toVersion(version, latest.getId(), defaultVersionId))
                        .toList(),
                IsoTimes.format(document.getCreatedAt()),
                IsoTimes.format(document.getUpdatedAt()));
    }

    private static DocumentDetailResponse.DocumentVersionResponse toVersion(
            DocumentVersionEntity version, UUID latestVersionId, UUID defaultVersionId) {
        return new DocumentDetailResponse.DocumentVersionResponse(
                version.getId().toString(),
                version.getSeq(),
                version.getVersionName(),
                version.getFileName(),
                version.getFileSize(),
                version.getMimeType(),
                version.getId().equals(latestVersionId),
                version.getId().equals(defaultVersionId),
                IsoTimes.format(version.getCreatedAt()),
                IsoTimes.format(version.getUpdatedAt()));
    }
}
