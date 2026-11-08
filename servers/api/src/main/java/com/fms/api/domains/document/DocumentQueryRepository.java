package com.fms.api.domains.document;

import com.fms.entities.DocumentEntity;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface DocumentQueryRepository extends JpaRepository<DocumentEntity, UUID> {
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update DocumentEntity d set d.defaultVersionId = null, d.updatedAt = CURRENT_TIMESTAMP where d.id in :ids")
    void clearDefaultVersionByIds(Collection<UUID> ids);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(
            "update DocumentEntity d set d.defaultVersionId = null, d.updatedAt = CURRENT_TIMESTAMP where d.defaultVersionId = :versionId")
    void clearDefaultVersion(UUID versionId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from DocumentEntity d where d.id in :ids")
    int deleteByIds(Collection<UUID> ids);
}
