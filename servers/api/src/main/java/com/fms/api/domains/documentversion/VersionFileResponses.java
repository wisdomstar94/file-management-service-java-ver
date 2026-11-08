package com.fms.api.domains.documentversion;

import com.fms.api.commons.ContentDispositions;
import com.fms.api.domains.filestorage.StorageDriver;
import com.fms.entities.DocumentVersionEntity;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/** 버전 파일을 원래 파일명으로 내려준다. */
@Component
@RequiredArgsConstructor
public class VersionFileResponses {
    private final StorageDriver storageDriver;

    public ResponseEntity<StreamingResponseBody> send(DocumentVersionEntity version) {
        String storageKey = version.getStorageKey();
        StreamingResponseBody body = output -> {
            try (InputStream input = storageDriver.openRead(storageKey)) {
                input.transferTo(output);
            }
        };
        String mimeType = version.getMimeType() == null || version.getMimeType().isEmpty()
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : version.getMimeType();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, mimeType)
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(version.getFileSize()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDispositions.attachment(version.getFileName()))
                .body(body);
    }
}
