package com.fms.api.routes.admin.documents;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.RequestBodies;
import com.fms.api.commons.UuidParams;
import com.fms.api.commons.ValidationErrors;
import com.fms.api.domains.adminauth.RequirePermission;
import com.fms.api.domains.document.DocumentDetailResponse;
import com.fms.api.domains.document.DocumentFinder;
import com.fms.api.domains.document.DocumentResponses;
import com.fms.api.domains.document.DocumentWithVersions;
import com.fms.api.domains.document.UploadedVersionSaver;
import com.fms.consts.PermissionCode;
import com.fms.entities.DocumentEntity;
import com.fms.entities.DocumentRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;

/** /api/admin/documents/** (버전 · 공개 링크는 하위 패키지) */
@RestController
@RequestMapping("/api/admin/documents")
@RequiredArgsConstructor
public class DocumentsController {
    private final DocumentListService documentListService;
    private final DocumentDeleteService documentDeleteService;
    private final DocumentFinder documentFinder;
    private final DocumentRepository documentRepository;
    private final UploadedVersionSaver uploadedVersionSaver;
    private final RequestBodies requestBodies;
    private final TransactionTemplate transactionTemplate;

    @GetMapping
    @RequirePermission(PermissionCode.FILE_LIST_ACCESS)
    ApiResponse<DocumentListResponse> list(@Valid @ModelAttribute DocumentListQuery query) {
        return ApiResponse.of(documentListService.list(query));
    }

    @PostMapping(consumes = "multipart/form-data")
    @RequirePermission(PermissionCode.FILE_LIST_CREATE)
    ResponseEntity<ApiResponse<DocumentDetailResponse>> create(
            @RequestPart(name = "file", required = false) MultipartFile file,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "versionName", required = false) String versionName) {
        if (file == null) {
            throw HttpError.validation("파일을 선택하세요.");
        }
        CreateDocumentForm form = requestBodies.validate(new CreateDocumentForm(name, versionName));
        UUID documentId = transactionTemplate.execute(status -> {
            DocumentEntity document = new DocumentEntity();
            document.setName(form.name());
            documentRepository.save(document);
            uploadedVersionSaver.save(document.getId(), form.versionName(), file);
            return document.getId();
        });
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(DocumentResponses.toDetail(documentFinder.findOrThrow(documentId))));
    }

    @DeleteMapping
    @RequirePermission(PermissionCode.FILE_LIST_DELETE)
    ApiResponse<Map<String, Integer>> bulkDelete(@Valid @RequestBody BulkDeleteDocumentsRequest body) {
        List<UUID> ids = body.ids().stream().map(UUID::fromString).toList();
        return ApiResponse.of(Map.of("deletedCount", documentDeleteService.delete(ids)));
    }

    @GetMapping("/{documentId}")
    @RequirePermission(PermissionCode.FILE_DETAIL_ACCESS)
    ApiResponse<DocumentDetailResponse> detail(@PathVariable String documentId) {
        return ApiResponse.of(DocumentResponses.toDetail(documentFinder.findOrThrow(UuidParams.read(documentId))));
    }

    @PatchMapping("/{documentId}")
    @RequirePermission(PermissionCode.FILE_DETAIL_UPDATE)
    ApiResponse<DocumentDetailResponse> update(
            @PathVariable String documentId, @RequestBody(required = false) JsonNode rawBody) {
        UpdateDocumentRequest body = requestBodies.parse(rawBody, UpdateDocumentRequest.class);
        Set<String> present = requestBodies.presentKeys(rawBody);
        if (present.contains("name") && body.name() == null) {
            throw ValidationErrors.of("name", "자료명을 입력하세요.");
        }
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        UUID defaultVersionId = body.defaultVersionId() == null ? null : UUID.fromString(body.defaultVersionId());
        boolean isForeignVersion = defaultVersionId != null
                && document.versions().stream()
                        .noneMatch(version -> version.getId().equals(defaultVersionId));
        if (isForeignVersion) {
            throw HttpError.validation("이 자료의 버전이 아닙니다.");
        }

        transactionTemplate.executeWithoutResult(status -> {
            DocumentEntity entity =
                    documentRepository.findById(document.document().getId()).orElseThrow();
            if (present.contains("name") && body.name() != null) {
                entity.setName(body.name());
            }
            if (present.contains("defaultVersionId")) {
                entity.setDefaultVersionId(defaultVersionId);
            }
            documentRepository.save(entity);
        });
        return ApiResponse.of(DocumentResponses.toDetail(
                documentFinder.findOrThrow(document.document().getId())));
    }

    @DeleteMapping("/{documentId}")
    @RequirePermission(PermissionCode.FILE_LIST_DELETE)
    ResponseEntity<Void> delete(@PathVariable String documentId) {
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        documentDeleteService.delete(List.of(document.document().getId()));
        return ResponseEntity.noContent().build();
    }
}
