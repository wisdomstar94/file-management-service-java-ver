package com.fms.api.domains.sharelink;

import com.fms.entities.ShareLinkDefaultVersionMode;
import com.fms.entities.ShareLinkEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ShareLinkQueryRepository extends JpaRepository<ShareLinkEntity, UUID> {
    @EntityGraph(attributePaths = {"accessPolicyGroup"})
    List<ShareLinkEntity> findByDocumentIdOrderByCreatedAtDesc(UUID documentId);

    @EntityGraph(attributePaths = {"accessPolicyGroup"})
    Optional<ShareLinkEntity> findWithAccessPolicyGroupByIdAndDocumentId(UUID id, UUID documentId);

    @EntityGraph(attributePaths = {"accessPolicyGroup"})
    Optional<ShareLinkEntity> findWithAccessPolicyGroupById(UUID id);

    @EntityGraph(attributePaths = {"document", "accessPolicyGroup"})
    Optional<ShareLinkEntity> findWithDocumentByShareLinkKey(String shareLinkKey);

    /** 지운 버전을 기본으로 지정한 링크는 「자료 설정 따름」 으로 되돌린다. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(
            "update ShareLinkEntity l set l.fixedVersionId = null, l.defaultVersionMode = :mode, l.updatedAt = CURRENT_TIMESTAMP"
                    + " where l.fixedVersionId = :versionId")
    void resetFixedVersion(UUID versionId, ShareLinkDefaultVersionMode mode);
}
