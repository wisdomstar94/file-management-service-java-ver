package com.fms.api.routes.admin.auth;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

record AdminLoginRequest(
        @NotNull(message = "아이디를 입력하세요.") @Size(min = 1, message = "아이디를 입력하세요.")
        String loginId,

        @NotNull(message = "비밀번호를 입력하세요.") @Size(min = 1, message = "비밀번호를 입력하세요.")
        String password) {
    AdminLoginRequest {
        loginId = loginId == null ? null : loginId.strip();
    }
}
