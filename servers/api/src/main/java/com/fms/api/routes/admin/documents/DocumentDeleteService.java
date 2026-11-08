package com.fms.api.routes.admin.documents;

import com.fms.api.domains.document.DocumentQueryRepository;
import com.fms.api.domains.document.DocumentVersionQueryRepository;
import com.fms.api.domains.filestorage.StorageDriver;
import com.fms.entities.DocumentVersionEntity;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
class DocumentDeleteService {
    private final DocumentQueryRepository documentRepository;
    private final DocumentVersionQueryRepository versionRepository;
    private final StorageDriver storageDriver;
    private final TransactionTemplate transactionTemplate;

    /** 자료를 지우면 버전 · 공개 링크는 DB 에서 함께 지워지고(cascade), 파일은 커밋 후 지운다. */
    int delete(List<UUID> ids) {
        record Deleted(List<String> storageKeys, int affected) {}
        Deleted deleted = transactionTemplate.execute(status -> {
            List<String> keys = versionRepository.findByDocumentIdInOrderBySeqDesc(ids).stream()
                    .map(DocumentVersionEntity::getStorageKey)
                    .toList();
            documentRepository.clearDefaultVersionByIds(ids);
            return new Deleted(keys, documentRepository.deleteByIds(ids));
        });
        deleted.storageKeys().forEach(storageDriver::delete);
        return deleted.affected();
    }
}
