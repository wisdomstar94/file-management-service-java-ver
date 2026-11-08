package com.fms.api.domains.documentversion;

import com.fms.entities.DocumentVersionEntity;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public final class DocumentVersions {
    private DocumentVersions() {}

    /** 등록 순서(seq)가 가장 큰 버전. 자료는 버전을 1개 이상 가진다. */
    public static DocumentVersionEntity findLatest(List<DocumentVersionEntity> versions) {
        return versions.stream()
                .max(Comparator.comparingInt(DocumentVersionEntity::getSeq))
                .orElseThrow();
    }

    /** 고정된 기본 버전이 있으면 그 버전, 없거나 지워졌으면 최신 버전 */
    public static DocumentVersionEntity resolveDefault(List<DocumentVersionEntity> versions, UUID fixedVersionId) {
        return versions.stream()
                .filter(version -> version.getId().equals(fixedVersionId))
                .findFirst()
                .orElseGet(() -> findLatest(versions));
    }
}
