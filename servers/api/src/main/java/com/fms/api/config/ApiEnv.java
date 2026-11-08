package com.fms.api.config;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * api 가 쓰는 환경변수. 기동 시 한 번 읽어 빠진 값이 있으면 바로 실패하게 한다. (application.yml 의 {@code fms.api})
 *
 * @param adminAccessTokenSecret 용도마다 다른 JWT 서명 키. 하나가 새도 다른 용도의 토큰은 위조할 수 없다.
 * @param trustProxy Express {@code trust proxy} 와 같은 값. 비어 있으면 프록시를 신뢰하지 않고 직접 연결된 IP 를 쓴다.
 * @param adminRefreshTokenReuseGraceSeconds 갱신에 쓴 refresh token 을 다시 받아 주는 시간(초)
 * @param shareLinkUnlockExpiresInSeconds 공개 링크 비밀번호를 한 번 맞히면 다시 묻지 않는 시간(초)
 * @param cookieDomain 토큰 쿠키를 함께 쓸 상위 도메인. 비우면 api 호스트 한정이다.
 * @param userWebOrigin 공개 링크 다운로드에 실패하면 돌려보낼 공개 링크 화면의 origin
 */
@ConfigurationProperties(prefix = "fms.api")
public record ApiEnv(
        String adminAccessTokenSecret,
        String adminShortTimeTokenSecret,
        String shareLinkUnlockTokenSecret,
        String corsOrigins,
        String trustProxy,
        long refreshTokenDays,
        long adminRefreshTokenReuseGraceSeconds,
        long shareLinkUnlockExpiresInSeconds,
        String cookieDomain,
        boolean secureCookie,
        String userWebOrigin,
        String storageDir) {

    public List<String> corsOriginList() {
        return corsOrigins == null
                ? List.of()
                : Arrays.stream(corsOrigins.split(","))
                        .filter(s -> !s.isEmpty())
                        .toList();
    }

    /** 비어 있으면 {@code null} (호스트 한정 쿠키) */
    public String cookieDomainOrNull() {
        return cookieDomain == null || cookieDomain.isEmpty() ? null : cookieDomain;
    }

    public Path storageRootDir() {
        return Path.of(storageDir).toAbsolutePath().normalize();
    }
}
