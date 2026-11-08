package com.fms.api.routes.admin.documents.versions;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 새 버전 등록(multipart 텍스트 필드) · 버전명 수정(JSON) 이 함께 쓴다. */
record VersionNameRequest(
        @NotNull(message = "버전명을 입력하세요.")
        @Size(min = 1, message = "버전명을 입력하세요.")
        @Size(max = 100, message = "100자 이하로 입력하세요.")
        String versionName) {
    VersionNameRequest {
        versionName = versionName == null ? null : versionName.strip();
    }
}
