package com.fms.api.routes.admin.documents;

import com.fms.api.commons.UuidParams;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 생략한 필드는 바꾸지 않는다. {@code defaultVersionId} 가 {@code null} 이면 최신 버전을 따른다. */
record UpdateDocumentRequest(
        @Size(min = 1, message = "자료명을 입력하세요.") @Size(max = 300, message = "300자 이하로 입력하세요.")
        String name,

        @Pattern(regexp = UuidParams.REGEX, message = "식별키 형식이 올바르지 않습니다.")
        String defaultVersionId) {
    UpdateDocumentRequest {
        name = name == null ? null : name.strip();
    }
}
