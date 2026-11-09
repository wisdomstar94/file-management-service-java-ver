package com.fms.api.routes.admin.documents.versions;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.RequestBodies;
import com.fms.api.commons.UuidParams;
import com.fms.api.domains.adminauth.RequirePermission;
import com.fms.api.domains.document.DocumentDetailResponse;
import com.fms.api.domains.document.DocumentFinder;
import com.fms.api.domains.document.DocumentQueryRepository;
import com.fms.api.domains.document.DocumentResponses;
import com.fms.api.domains.document.DocumentVersionQueryRepository;
import com.fms.api.domains.document.DocumentWithVersions;
import com.fms.api.domains.document.UploadedVersionSaver;
import com.fms.api.domains.documentversion.VersionFileResponses;
import com.fms.api.domains.filestorage.StorageDriver;
import com.fms.api.domains.sharelink.ShareLinkQueryRepository;
import com.fms.consts.PermissionCode;
import com.fms.entities.DocumentVersionEntity;
import com.fms.entities.ShareLinkDefaultVersionMode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import tools.jackson.databind.JsonNode;

/** /api/admin/documents/{documentId}/versions/** */
@RestController
@RequestMapping("/api/admin/documents/{documentId}/versions")
@RequiredArgsConstructor
public class VersionsController {
    private final DocumentFinder documentFinder;
    private final DocumentQueryRepository documentRepository;
    private final DocumentVersionQueryRepository versionRepository;
    private final ShareLinkQueryRepository shareLinkRepository;
    private final UploadedVersionSaver uploadedVersionSaver;
    private final VersionFileResponses versionFileResponses;
    private final StorageDriver storageDriver;
    private final RequestBodies requestBodies;
    private final TransactionTemplate transactionTemplate;

    @PostMapping(consumes = "multipart/form-data")
    @RequirePermission(PermissionCode.FILE_DETAIL_VERSION_CREATE)
    ResponseEntity<ApiResponse<DocumentDetailResponse>> create(
            @PathVariable String documentId,
            @RequestPart(name = "file", required = false) MultipartFile file,
            @RequestParam(name = "versionName", required = false) String versionName) {
        if (file == null) {
            throw HttpError.validation("파일을 선택하세요.");
        }
        VersionNameRequest body = requestBodies.validate(new VersionNameRequest(versionName));
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        transactionTemplate.executeWithoutResult(
                status -> uploadedVersionSaver.save(document.document().getId(), body.versionName(), file));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(DocumentResponses.toDetail(
                        documentFinder.findOrThrow(document.document().getId()))));
    }

    @PatchMapping("/{versionId}")
    @RequirePermission(PermissionCode.FILE_DETAIL_VERSION_UPDATE)
    ApiResponse<DocumentDetailResponse> update(
            @PathVariable String documentId,
            @PathVariable String versionId,
            @RequestBody(required = false) JsonNode rawBody) {
        VersionNameRequest body = requestBodies.parse(rawBody, VersionNameRequest.class);
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        DocumentVersionEntity version = documentFinder.findVersionOrThrow(document, UuidParams.read(versionId));
        transactionTemplate.executeWithoutResult(status -> {
            DocumentVersionEntity entity =
                    versionRepository.findById(version.getId()).orElseThrow();
            entity.setVersionName(body.versionName());
            versionRepository.save(entity);
        });
        return ApiResponse.of(DocumentResponses.toDetail(
                documentFinder.findOrThrow(document.document().getId())));
    }

    @DeleteMapping("/{versionId}")
    @RequirePermission(PermissionCode.FILE_DETAIL_VERSION_UPDATE)
    ApiResponse<DocumentDetailResponse> delete(@PathVariable String documentId, @PathVariable String versionId) {
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        DocumentVersionEntity version = documentFinder.findVersionOrThrow(document, UuidParams.read(versionId));
        if (document.versions().size() == 1) {
            throw HttpError.conflict("자료에는 버전이 1개 이상 있어야 합니다. 자료를 삭제하세요.");
        }

        // 이 버전을 기본으로 지정한 자료 · 링크는 「자료 설정 / 최신 버전 따름」 으로 되돌린다.
        transactionTemplate.executeWithoutResult(status -> {
            documentRepository.clearDefaultVersion(version.getId());
            shareLinkRepository.resetFixedVersion(version.getId(), ShareLinkDefaultVersionMode.FOLLOW_DOCUMENT);
            versionRepository.deleteById(version.getId());
        });
        storageDriver.delete(version.getStorageKey());
        return ApiResponse.of(DocumentResponses.toDetail(
                documentFinder.findOrThrow(document.document().getId())));
    }

    @GetMapping("/{versionId}/download")
    @RequirePermission(PermissionCode.FILE_DETAIL_ACCESS)
    ResponseEntity<StreamingResponseBody> download(@PathVariable String documentId, @PathVariable String versionId) {
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        return versionFileResponses.send(documentFinder.findVersionOrThrow(document, UuidParams.read(versionId)));
    }
}
