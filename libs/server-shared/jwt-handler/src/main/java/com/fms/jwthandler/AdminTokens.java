package com.fms.jwthandler;

import com.fms.consts.JwtAudiences;
import java.util.Map;
import java.util.Optional;

/** 관리자 access token · short-time token 발급과 검증 */
public final class AdminTokens {
    /** 관리자 access token 유효 시간(초) */
    public static final long ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 15;
    /** 업로드 · 다운로드용 short-time token 유효 시간(초) */
    public static final long ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS = 10;

    private static final String ADMIN_SHORT_TIME_TOKEN_AUDIENCE = "fms-admin-short-time";

    private AdminTokens() {}

    public static String signAdminAccessToken(String adminAccountId, String secret) {
        return JwtHandler.signJwt(
                Map.of(),
                adminAccountId,
                JwtAudiences.ADMIN_ACCESS_TOKEN_AUDIENCE,
                secret,
                ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS);
    }

    /** 유효하면 관리자 계정 식별키를, 아니면 빈 값을 반환한다. */
    public static Optional<String> verifyAdminAccessToken(String token, String secret) {
        return JwtHandler.verifyJwt(token, JwtAudiences.ADMIN_ACCESS_TOKEN_AUDIENCE, secret)
                .map(claims -> claims.getSubject());
    }

    public static String signAdminShortTimeToken(
            String adminAccountId, AdminShortTimeTokenTarget target, String secret) {
        return JwtHandler.signJwt(
                Map.of("target", target.toClaim()),
                adminAccountId,
                ADMIN_SHORT_TIME_TOKEN_AUDIENCE,
                secret,
                ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS);
    }

    /** 유효하면 관리자 계정 식별키와 허용 대상을, 아니면 빈 값을 반환한다. */
    public static Optional<AdminShortTimeTokenClaims> verifyAdminShortTimeToken(String token, String secret) {
        return JwtHandler.verifyJwt(token, ADMIN_SHORT_TIME_TOKEN_AUDIENCE, secret)
                .flatMap(claims -> {
                    AdminShortTimeTokenTarget target = AdminShortTimeTokenTarget.fromClaim(claims.getClaim("target"));
                    return target == null
                            ? Optional.empty()
                            : Optional.of(new AdminShortTimeTokenClaims(claims.getSubject(), target));
                });
    }
}
