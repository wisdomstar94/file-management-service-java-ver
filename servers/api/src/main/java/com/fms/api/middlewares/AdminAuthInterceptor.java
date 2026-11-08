package com.fms.api.middlewares;

import com.fms.api.commons.HttpError;
import com.fms.api.config.ApiEnv;
import com.fms.api.domains.adminauth.AdminAccountLoader;
import com.fms.api.domains.adminauth.AdminContext;
import com.fms.api.domains.adminauth.AdminContexts;
import com.fms.jwthandler.AdminShortTimeTokenClaims;
import com.fms.jwthandler.AdminShortTimeTokenTarget;
import com.fms.jwthandler.AdminTokens;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * access token(없으면 그 요청용 short-time token)을 검증하고, 계정 · 권한 그룹 · 접근 정책 그룹을 읽어 요청에 담는다.
 * (원본 admin-auth-middleware)
 */
@Component
@RequiredArgsConstructor
public class AdminAuthInterceptor implements HandlerInterceptor {
    private final ApiEnv apiEnv;
    private final AdminAccountLoader adminAccountLoader;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS preflight(OPTIONS) 에는 토큰이 없다. Spring 이 preflight 에도 인터셉터를 실행하므로 건너뛴다.
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        AdminContext context = readAdminAccountId(request)
                .flatMap(id -> parseUuid(id).flatMap(adminAccountLoader::load))
                .orElseThrow(() -> HttpError.unauthorized("로그인이 필요합니다."));
        AdminContexts.write(request, context);
        return true;
    }

    private Optional<String> readAdminAccountId(HttpServletRequest request) {
        String bearerToken = readBearerToken(request);
        Optional<String> adminAccountId = bearerToken == null
                ? Optional.empty()
                : AdminTokens.verifyAdminAccessToken(bearerToken, apiEnv.adminAccessTokenSecret());
        if (adminAccountId.isPresent()) {
            return adminAccountId;
        }
        String shortTimeToken = readShortTimeToken(request);
        if (shortTimeToken == null) {
            return Optional.empty();
        }
        return AdminTokens.verifyAdminShortTimeToken(shortTimeToken, apiEnv.adminShortTimeTokenSecret())
                .filter(claims -> isShortTimeTokenTargetRequest(request, claims.target()))
                .map(AdminShortTimeTokenClaims::adminAccountId);
    }

    static String readBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null) {
            return null;
        }
        String[] parts = authorization.split(" ", -1);
        return parts.length >= 2 && parts[0].equals("Bearer") && !parts[1].isEmpty() ? parts[1] : null;
    }

    /** 다운로드는 링크로 열리므로 short-time token 을 {@code shortTimeToken} 쿼리로도 받는다. */
    private static String readShortTimeToken(HttpServletRequest request) {
        String queryToken = "GET".equals(request.getMethod()) ? request.getParameter("shortTimeToken") : null;
        return queryToken != null && !queryToken.isEmpty() ? queryToken : readBearerToken(request);
    }

    /** short-time token 은 발급받을 때 지정한 동작 · 대상 요청에만 쓸 수 있다. */
    private static boolean isShortTimeTokenTargetRequest(HttpServletRequest request, AdminShortTimeTokenTarget target) {
        String path = request.getRequestURI().replaceAll("/+$", "");
        String method = request.getMethod();
        return switch (target.purpose()) {
            case AdminShortTimeTokenTarget.UPLOAD_DOCUMENT ->
                method.equals("POST") && path.equals("/api/admin/documents");
            case AdminShortTimeTokenTarget.UPLOAD_DOCUMENT_VERSION ->
                method.equals("POST") && path.equals("/api/admin/documents/" + target.documentId() + "/versions");
            case AdminShortTimeTokenTarget.DOWNLOAD_DOCUMENT_VERSION ->
                method.equals("GET")
                        && path.equals("/api/admin/documents/" + target.documentId() + "/versions/" + target.versionId()
                                + "/download");
            default -> false;
        };
    }

    private static Optional<UUID> parseUuid(String value) {
        try {
            return Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
