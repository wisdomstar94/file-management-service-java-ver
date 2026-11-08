package com.fms.api.routes.admin.auth;

import jakarta.validation.constraints.NotEmpty;

record AdminRefreshTokenRequest(
        @NotEmpty(message = "refresh token 이 필요합니다.") String refreshToken) {}
