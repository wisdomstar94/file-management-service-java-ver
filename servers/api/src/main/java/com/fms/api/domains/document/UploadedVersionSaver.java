package com.fms.api.domains.document;

import com.fms.api.domains.filestorage.StorageDriver;
import com.fms.entities.DocumentVersionEntity;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** 자료 등록 · 새 버전 등록이 함께 쓴다. */
@Component
@RequiredArgsConstructor
public class UploadedVersionSaver {
    private final DocumentVersionQueryRepository versionRepository;
    private final StorageDriver storageDriver;

    /**
     * 업로드된 파일을 저장소로 옮기고 버전 행을 만든다. 등록 순서(seq)는 그 자료의 마지막 값 + 1.
     * 트랜잭션 안에서 부르며, DB 저장이 실패하면 옮긴 파일을 지운다.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public DocumentVersionEntity save(UUID documentId, String versionName, MultipartFile file) {
        int lastSeq = versionRepository
                .findFirstByDocumentIdOrderBySeqDesc(documentId)
                .map(DocumentVersionEntity::getSeq)
                .orElse(0);
        DocumentVersionEntity version = new DocumentVersionEntity();
        version.setDocumentId(documentId);
        version.setSeq(lastSeq + 1);
        version.setVersionName(versionName);
        version.setFileName(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        version.setFileSize(file.getSize());
        version.setMimeType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        // persist 시점에 식별키가 정해지고 INSERT 는 flush 때 나가므로, 저장 키를 채운 뒤 한 번에 저장된다.
        version.setStorageKey("");
        versionRepository.save(version);
        String storageKey = "documents/" + documentId + "/" + version.getId();
        version.setStorageKey(storageKey);
        try {
            storageDriver.saveUploadedFile(file, storageKey);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        try {
            versionRepository.flush();
            return version;
        } catch (RuntimeException e) {
            storageDriver.delete(storageKey);
            throw e;
        }
    }
}
