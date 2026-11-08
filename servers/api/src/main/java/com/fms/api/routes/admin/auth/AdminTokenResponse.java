package com.fms.api.routes.admin.auth;

record AdminTokenResponse(
        String accessToken, String accessTokenExpiresAt, String refreshToken, String refreshTokenExpiresAt) {}
