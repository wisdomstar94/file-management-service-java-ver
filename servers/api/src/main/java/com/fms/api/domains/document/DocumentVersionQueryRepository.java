package com.fms.api.domains.document;

import com.fms.entities.DocumentVersionEntity;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface DocumentVersionQueryRepository extends JpaRepository<DocumentVersionEntity, UUID> {
    List<DocumentVersionEntity> findByDocumentIdOrderBySeqDesc(UUID documentId);

    List<DocumentVersionEntity> findByDocumentIdInOrderBySeqDesc(Collection<UUID> documentIds);

    /** 같은 자료에 동시에 버전을 올려도 seq 가 겹치지 않게 마지막 버전 행을 잠근다. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DocumentVersionEntity> findFirstByDocumentIdOrderBySeqDesc(UUID documentId);
}
