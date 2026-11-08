package com.fms.api.routes.admin.documents;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** multipart 의 텍스트 필드. 파일은 {@code file} 필드로 함께 받는다. */
record CreateDocumentForm(
        @NotNull(message = "자료명을 입력하세요.")
        @Size(min = 1, message = "자료명을 입력하세요.")
        @Size(max = 300, message = "300자 이하로 입력하세요.")
        String name,

        @NotNull(message = "버전명을 입력하세요.")
        @Size(min = 1, message = "버전명을 입력하세요.")
        @Size(max = 100, message = "100자 이하로 입력하세요.")
        String versionName) {
    CreateDocumentForm {
        name = name == null ? null : name.strip();
        versionName = versionName == null ? null : versionName.strip();
    }
}
