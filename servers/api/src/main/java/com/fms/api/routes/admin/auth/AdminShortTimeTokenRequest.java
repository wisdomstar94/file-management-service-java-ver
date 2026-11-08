package com.fms.api.routes.admin.auth;

import com.fms.api.commons.UuidParams;
import com.fms.jwthandler.AdminShortTimeTokenTarget;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** {@code purpose} 로 필요한 대상 식별키가 정해진다. */
record AdminShortTimeTokenRequest(
        @NotNull(message = "용도를 지정하세요.")
        @Pattern(
                regexp = "UPLOAD_DOCUMENT|UPLOAD_DOCUMENT_VERSION|DOWNLOAD_DOCUMENT_VERSION",
                message = "알 수 없는 용도입니다.")
        String purpose,

        String documentId,
        String versionId) {

    @AssertTrue(message = "자료 식별키가 올바르지 않습니다.")
    boolean isDocumentIdValid() {
        return AdminShortTimeTokenTarget.UPLOAD_DOCUMENT.equals(purpose)
                || purpose == null
                || UuidParams.isUuid(documentId);
    }

    @AssertTrue(message = "버전 식별키가 올바르지 않습니다.")
    boolean isVersionIdValid() {
        return !AdminShortTimeTokenTarget.DOWNLOAD_DOCUMENT_VERSION.equals(purpose) || UuidParams.isUuid(versionId);
    }

    AdminShortTimeTokenTarget toTarget() {
        return switch (purpose) {
            case AdminShortTimeTokenTarget.UPLOAD_DOCUMENT -> AdminShortTimeTokenTarget.uploadDocument();
            case AdminShortTimeTokenTarget.UPLOAD_DOCUMENT_VERSION ->
                AdminShortTimeTokenTarget.uploadDocumentVersion(documentId);
            default -> AdminShortTimeTokenTarget.downloadDocumentVersion(documentId, versionId);
        };
    }
}
