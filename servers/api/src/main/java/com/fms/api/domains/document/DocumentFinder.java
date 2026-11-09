package com.fms.api.domains.document;

import com.fms.api.commons.HttpError;
import com.fms.entities.DocumentEntity;
import com.fms.entities.DocumentRepository;
import com.fms.entities.DocumentVersionEntity;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DocumentFinder {
    private final DocumentRepository documentRepository;
    private final DocumentVersionQueryRepository versionRepository;

    /** 자료와 버전 전체(최신순)를 읽는다. 없거나 버전이 없으면 404. */
    @Transactional(readOnly = true)
    public DocumentWithVersions findOrThrow(UUID id) {
        DocumentEntity document = documentRepository.findById(id).orElseThrow(() -> HttpError.notFound("자료"));
        List<DocumentVersionEntity> versions = versionRepository.findByDocumentIdOrderBySeqDesc(id);
        if (versions.isEmpty()) {
            throw HttpError.notFound("자료");
        }
        return new DocumentWithVersions(document, versions);
    }

    /** 읽어 둔 자료의 버전 하나. 그 자료의 버전이 아니면 404. */
    public DocumentVersionEntity findVersionOrThrow(DocumentWithVersions document, UUID versionId) {
        return document.versions().stream()
                .filter(version -> version.getId().equals(versionId))
                .findFirst()
                .orElseThrow(() -> HttpError.notFound("버전"));
    }
}
