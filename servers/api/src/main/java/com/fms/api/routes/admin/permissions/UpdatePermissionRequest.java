package com.fms.api.routes.admin.permissions;

import jakarta.validation.constraints.Size;

/** 생략한 필드는 바꾸지 않는다. */
record UpdatePermissionRequest(
        @Size(min = 1, message = "분류를 입력하세요.") @Size(max = 100, message = "100자 이하로 입력하세요.")
        String category,

        @Size(min = 1, message = "권한명을 입력하세요.") @Size(max = 200, message = "200자 이하로 입력하세요.")
        String name,

        @Size(max = 2000, message = "2000자 이하로 입력하세요.") String description) {
    UpdatePermissionRequest {
        category = category == null ? null : category.strip();
        name = name == null ? null : name.strip();
    }
}
