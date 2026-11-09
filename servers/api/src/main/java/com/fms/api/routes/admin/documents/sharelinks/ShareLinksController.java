package com.fms.api.routes.admin.documents.sharelinks;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.IdName;
import com.fms.api.commons.IsoTimes;
import com.fms.api.commons.RequestBodies;
import com.fms.api.commons.UuidParams;
import com.fms.api.commons.ValidationErrors;
import com.fms.api.domains.adminauth.RequirePermission;
import com.fms.api.domains.document.DocumentFinder;
import com.fms.api.domains.document.DocumentWithVersions;
import com.fms.api.domains.documentversion.DocumentVersions;
import com.fms.api.domains.sharelink.ShareLinkAvailability;
import com.fms.api.domains.sharelink.ShareLinkQueryRepository;
import com.fms.consts.PermissionCode;
import com.fms.entities.AccessPolicyGroupRepository;
import com.fms.entities.DocumentVersionEntity;
import com.fms.entities.ShareLinkDefaultVersionMode;
import com.fms.entities.ShareLinkEntity;
import com.fms.passwordhandler.PasswordHandler;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

/** /api/admin/documents/{documentId}/share-links/** */
@RestController
@RequestMapping("/api/admin/documents/{documentId}/share-links")
@RequiredArgsConstructor
public class ShareLinksController {
    private static final List<String> FIELDS = List.of(
            "accessPolicyGroupId",
            "password",
            "maxDownloadCount",
            "availableFrom",
            "availableUntil",
            "defaultVersionMode",
            "fixedVersionId",
            "isShowOtherVersions",
            "isAllowOtherVersionDownload",
            "isShowDownloadStatus");
    /** null 이 될 수 없는 필드 */
    private static final String[] NON_NULL_FIELDS = {
        "defaultVersionMode", "isShowOtherVersions", "isAllowOtherVersionDownload", "isShowDownloadStatus"
    };

    private static final SecureRandom RANDOM = new SecureRandom();

    private final DocumentFinder documentFinder;
    private final ShareLinkQueryRepository shareLinkRepository;
    private final AccessPolicyGroupRepository accessPolicyGroupRepository;
    private final RequestBodies requestBodies;

    @GetMapping
    @RequirePermission(PermissionCode.FILE_DETAIL_ACCESS)
    ApiResponse<List<ShareLinkResponse>> list(@PathVariable String documentId) {
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        return ApiResponse.of(
                shareLinkRepository
                        .findByDocumentIdOrderByCreatedAtDesc(
                                document.document().getId())
                        .stream()
                        .map(link -> toResponse(link, document))
                        .toList());
    }

    /** 링크 생성 · 수정 모달의 접근 정책 그룹 선택지 */
    @GetMapping("/assignable-access-policy-groups")
    @RequirePermission({PermissionCode.FILE_DETAIL_LINK_CREATE, PermissionCode.FILE_DETAIL_LINK_UPDATE})
    ApiResponse<List<IdName>> assignableAccessPolicyGroups() {
        return ApiResponse.of(accessPolicyGroupRepository.findAll(Sort.by(Sort.Direction.ASC, "createdAt")).stream()
                .map(group -> new IdName(group.getId().toString(), group.getName()))
                .toList());
    }

    @PostMapping
    @RequirePermission(PermissionCode.FILE_DETAIL_LINK_CREATE)
    ResponseEntity<ApiResponse<ShareLinkResponse>> create(
            @PathVariable String documentId, @RequestBody(required = false) JsonNode rawBody) {
        ShareLinkRequest body = requestBodies.parse(rawBody, ShareLinkRequest.class);
        Set<String> present = requestBodies.presentKeys(rawBody);
        FIELDS.stream().filter(field -> !present.contains(field)).findFirst().ifPresent(field -> {
            throw ValidationErrors.of(field, "값을 입력하세요.");
        });
        requestBodies.rejectNulls(rawBody, NON_NULL_FIELDS);
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));

        ShareLinkEntity link = new ShareLinkEntity();
        link.setDocumentId(document.document().getId());
        link.setShareLinkKey(createShareLinkKey());
        applyColumns(link, document, body, present);
        ShareLinkEntity saved = shareLinkRepository.saveAndFlush(link);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(toResponse(reload(saved.getId()), document)));
    }

    @PatchMapping("/{linkId}")
    @RequirePermission(PermissionCode.FILE_DETAIL_LINK_UPDATE)
    ApiResponse<ShareLinkResponse> update(
            @PathVariable String documentId,
            @PathVariable String linkId,
            @RequestBody(required = false) JsonNode rawBody) {
        ShareLinkRequest body = requestBodies.parse(rawBody, ShareLinkRequest.class);
        requestBodies.rejectNulls(rawBody, NON_NULL_FIELDS);
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        ShareLinkEntity link = findOrThrow(document, linkId);
        applyColumns(link, document, body, requestBodies.presentKeys(rawBody));
        shareLinkRepository.saveAndFlush(link);
        return ApiResponse.of(toResponse(reload(link.getId()), document));
    }

    @DeleteMapping("/{linkId}")
    @RequirePermission(PermissionCode.FILE_DETAIL_LINK_DELETE)
    ResponseEntity<Void> delete(@PathVariable String documentId, @PathVariable String linkId) {
        DocumentWithVersions document = documentFinder.findOrThrow(UuidParams.read(documentId));
        shareLinkRepository.deleteById(findOrThrow(document, linkId).getId());
        return ResponseEntity.noContent().build();
    }

    private ShareLinkEntity findOrThrow(DocumentWithVersions document, String linkId) {
        return shareLinkRepository
                .findWithAccessPolicyGroupByIdAndDocumentId(
                        UuidParams.read(linkId), document.document().getId())
                .orElseThrow(() -> HttpError.notFound("외부 공개 링크"));
    }

    private ShareLinkEntity reload(UUID id) {
        return shareLinkRepository.findWithAccessPolicyGroupById(id).orElseThrow();
    }

    /** 요청 값을 share_link 컬럼 값으로 바꾼다. 비밀번호는 해시하고, 참조하는 버전 · 접근 정책 그룹이 유효한지 확인한다. */
    private void applyColumns(
            ShareLinkEntity link, DocumentWithVersions document, ShareLinkRequest body, Set<String> present) {
        UUID fixedVersionId = body.fixedVersionId() == null ? null : UUID.fromString(body.fixedVersionId());
        UUID accessPolicyGroupId =
                body.accessPolicyGroupId() == null ? null : UUID.fromString(body.accessPolicyGroupId());
        boolean isForeignVersion = fixedVersionId != null
                && document.versions().stream()
                        .noneMatch(version -> version.getId().equals(fixedVersionId));
        boolean isMissingPolicy =
                accessPolicyGroupId != null && !accessPolicyGroupRepository.existsById(accessPolicyGroupId);
        if (isForeignVersion || isMissingPolicy) {
            throw HttpError.validation("존재하지 않는 버전 또는 접근 정책 그룹입니다.");
        }

        if (present.contains("accessPolicyGroupId")) {
            link.setAccessPolicyGroupId(accessPolicyGroupId);
        }
        if (present.contains("password")) {
            link.setPasswordHash(body.password() == null ? null : PasswordHandler.hashPassword(body.password()));
        }
        if (present.contains("maxDownloadCount")) {
            link.setMaxDownloadCount(body.maxDownloadCount());
        }
        if (present.contains("availableFrom")) {
            link.setAvailableFrom(
                    body.availableFrom() == null ? null : ShareLinkRequest.toInstant(body.availableFrom()));
        }
        if (present.contains("availableUntil")) {
            link.setAvailableUntil(
                    body.availableUntil() == null ? null : ShareLinkRequest.toInstant(body.availableUntil()));
        }
        if (present.contains("fixedVersionId")) {
            link.setFixedVersionId(fixedVersionId);
        }
        if (body.defaultVersionMode() != null) {
            link.setDefaultVersionMode(ShareLinkDefaultVersionMode.valueOf(body.defaultVersionMode()));
            if (link.getDefaultVersionMode() == ShareLinkDefaultVersionMode.FOLLOW_DOCUMENT) {
                link.setFixedVersionId(null);
            }
        }
        if (body.isShowOtherVersions() != null) {
            link.setShowOtherVersions(body.isShowOtherVersions());
        }
        if (body.isAllowOtherVersionDownload() != null) {
            link.setAllowOtherVersionDownload(body.isAllowOtherVersionDownload());
        }
        if (body.isShowDownloadStatus() != null) {
            link.setShowDownloadStatus(body.isShowDownloadStatus());
        }
    }

    private static String createShareLinkKey() {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static ShareLinkResponse toResponse(ShareLinkEntity link, DocumentWithVersions document) {
        DocumentVersionEntity fixedVersion = document.versions().stream()
                .filter(version -> version.getId().equals(link.getFixedVersionId()))
                .findFirst()
                .orElse(null);
        DocumentVersionEntity effective =
                link.getDefaultVersionMode() == ShareLinkDefaultVersionMode.FIXED && fixedVersion != null
                        ? fixedVersion
                        : DocumentVersions.resolveDefault(
                                document.versions(), document.document().getDefaultVersionId());
        return new ShareLinkResponse(
                link.getId().toString(),
                link.getShareLinkKey(),
                link.getAccessPolicyGroup() == null
                        ? null
                        : new IdName(
                                link.getAccessPolicyGroup().getId().toString(),
                                link.getAccessPolicyGroup().getName()),
                link.getPasswordHash() != null,
                link.getDownloadCount(),
                link.getMaxDownloadCount(),
                IsoTimes.format(link.getAvailableFrom()),
                IsoTimes.format(link.getAvailableUntil()),
                link.getDefaultVersionMode(),
                fixedVersion == null ? null : toVersionSummary(fixedVersion),
                toVersionSummary(effective),
                link.isShowOtherVersions(),
                link.isAllowOtherVersionDownload(),
                link.isShowDownloadStatus(),
                ShareLinkAvailability.of(link),
                IsoTimes.format(link.getCreatedAt()),
                IsoTimes.format(link.getUpdatedAt()));
    }

    private static ShareLinkResponse.VersionSummary toVersionSummary(DocumentVersionEntity version) {
        return new ShareLinkResponse.VersionSummary(version.getId().toString(), version.getVersionName());
    }
}
