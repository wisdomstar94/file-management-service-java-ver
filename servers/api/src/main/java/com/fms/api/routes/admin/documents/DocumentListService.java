package com.fms.api.routes.admin.documents;

import com.fms.api.commons.IsoTimes;
import com.fms.api.domains.document.DocumentVersionQueryRepository;
import com.fms.api.domains.documentversion.DocumentVersions;
import com.fms.entities.DocumentEntity;
import com.fms.entities.DocumentVersionEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
class DocumentListService {
    private final EntityManager entityManager;
    private final DocumentVersionQueryRepository versionRepository;

    /** 등록일 최신순. 자료명 검색은 대소문자 구분 없이 부분 일치(ILIKE) 이다. */
    @Transactional(readOnly = true)
    DocumentListResponse list(DocumentListQuery query) {
        StringBuilder where = new StringBuilder(" where 1 = 1");
        boolean hasKeyword = query.keyword() != null && !query.keyword().isEmpty();
        if (hasKeyword) {
            where.append(" and lower(d.name) like lower(:keyword) escape '\\'");
        }
        if (query.createdWithinDays() != null) {
            where.append(" and d.createdAt >= :since");
        }

        TypedQuery<DocumentEntity> pageQuery = entityManager.createQuery(
                "select d from DocumentEntity d" + where + " order by d.createdAt desc, d.id desc",
                DocumentEntity.class);
        TypedQuery<Long> countQuery =
                entityManager.createQuery("select count(d) from DocumentEntity d" + where, Long.class);
        if (hasKeyword) {
            String keyword = "%" + query.keyword().replaceAll("[%_\\\\]", "\\\\$0") + "%";
            pageQuery.setParameter("keyword", keyword);
            countQuery.setParameter("keyword", keyword);
        }
        if (query.createdWithinDays() != null) {
            Instant since = Instant.now().minus(Duration.ofDays(query.createdWithinDays()));
            pageQuery.setParameter("since", since);
            countQuery.setParameter("since", since);
        }

        List<DocumentEntity> documents = pageQuery
                .setFirstResult((query.page() - 1) * query.size())
                .setMaxResults(query.size())
                .getResultList();
        Map<UUID, List<DocumentVersionEntity>> versionsByDocument =
                versionRepository
                        .findByDocumentIdInOrderBySeqDesc(
                                documents.stream().map(DocumentEntity::getId).toList())
                        .stream()
                        .collect(Collectors.groupingBy(DocumentVersionEntity::getDocumentId));

        List<DocumentSummaryResponse> items = documents.stream()
                .filter(document -> versionsByDocument.containsKey(document.getId()))
                .map(document -> toSummary(document, versionsByDocument.get(document.getId())))
                .toList();
        return new DocumentListResponse(items, countQuery.getSingleResult(), query.page(), query.size());
    }

    private static DocumentSummaryResponse toSummary(DocumentEntity document, List<DocumentVersionEntity> versions) {
        DocumentVersionEntity latest = DocumentVersions.findLatest(versions);
        DocumentSummaryResponse.VersionSummary fixed = versions.stream()
                .filter(version -> version.getId().equals(document.getDefaultVersionId()))
                .findFirst()
                .map(DocumentListService::toVersionSummary)
                .orElse(null);
        return new DocumentSummaryResponse(
                document.getId().toString(),
                document.getName(),
                versions.size(),
                toVersionSummary(latest),
                latest.getFileName(),
                fixed,
                IsoTimes.format(document.getCreatedAt()),
                IsoTimes.format(latest.getCreatedAt()));
    }

    private static DocumentSummaryResponse.VersionSummary toVersionSummary(DocumentVersionEntity version) {
        return new DocumentSummaryResponse.VersionSummary(version.getId().toString(), version.getVersionName());
    }
}
