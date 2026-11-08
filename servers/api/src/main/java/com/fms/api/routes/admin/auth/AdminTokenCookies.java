package com.fms.api.routes.admin.auth;

import com.fms.api.config.ApiEnv;
import com.fms.consts.AdminAuthCookieNames;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** 관리자 웹 서버가 같은 쿠키를 읽고 갱신하므로 도메인 · 경로를 그쪽과 똑같이 맞춘다. */
@Component
@RequiredArgsConstructor
class AdminTokenCookies {
    private final ApiEnv apiEnv;

    void write(HttpServletResponse response, AdminTokenResponse tokens) {
        add(
                response,
                AdminAuthCookieNames.ADMIN_ACCESS_TOKEN_COOKIE,
                tokens.accessToken(),
                untilSeconds(tokens.accessTokenExpiresAt()));
        add(
                response,
                AdminAuthCookieNames.ADMIN_REFRESH_TOKEN_COOKIE,
                tokens.refreshToken(),
                untilSeconds(tokens.refreshTokenExpiresAt()));
    }

    void clear(HttpServletResponse response) {
        add(response, AdminAuthCookieNames.ADMIN_ACCESS_TOKEN_COOKIE, "", 0);
        add(response, AdminAuthCookieNames.ADMIN_REFRESH_TOKEN_COOKIE, "", 0);
    }

    private void add(HttpServletResponse response, String name, String value, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .sameSite("Lax")
                .secure(apiEnv.secureCookie())
                .domain(apiEnv.cookieDomainOrNull())
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private static long untilSeconds(String isoTime) {
        return Math.max(
                0, Duration.between(Instant.now(), Instant.parse(isoTime)).toSeconds());
    }
}
