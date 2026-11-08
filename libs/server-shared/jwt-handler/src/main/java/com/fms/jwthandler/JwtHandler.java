package com.fms.jwthandler;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

/** HS256 JWT. {@code audience} 로 토큰 용도를 구분해 다른 용도의 토큰을 재사용하지 못하게 한다. */
public final class JwtHandler {
    private JwtHandler() {}

    public static String signJwt(
            Map<String, Object> payload, String subject, String audience, String secret, long expiresInSeconds) {
        long nowSeconds = Instant.now().getEpochSecond();
        JWTClaimsSet.Builder claims = new JWTClaimsSet.Builder();
        payload.forEach(claims::claim);
        claims.subject(subject)
                .audience(audience)
                .issueTime(Date.from(Instant.ofEpochSecond(nowSeconds)))
                .expirationTime(Date.from(Instant.ofEpochSecond(nowSeconds + expiresInSeconds)));
        try {
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims.build());
            jwt.sign(new MACSigner(secret.getBytes(StandardCharsets.UTF_8)));
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("JWT 서명에 실패했습니다.", e);
        }
    }

    /** 서명 · 만료 · 용도({@code audience}) · {@code sub} 를 검증한다. 하나라도 맞지 않으면 빈 값이다. */
    public static Optional<JWTClaimsSet> verifyJwt(String token, String audience, String secret) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            if (!JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm())
                    || !jwt.verify(new MACVerifier(secret.getBytes(StandardCharsets.UTF_8)))) {
                return Optional.empty();
            }
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            Instant now = Instant.now();
            // 원본(jose) 처럼 시계 오차 허용 없이 판정한다.
            if (claims.getExpirationTime() != null
                    && !now.isBefore(claims.getExpirationTime().toInstant())) {
                return Optional.empty();
            }
            if (claims.getNotBeforeTime() != null
                    && now.isBefore(claims.getNotBeforeTime().toInstant())) {
                return Optional.empty();
            }
            if (claims.getAudience() == null || !claims.getAudience().contains(audience)) {
                return Optional.empty();
            }
            if (claims.getSubject() == null) {
                return Optional.empty();
            }
            return Optional.of(claims);
        } catch (ParseException | JOSEException | RuntimeException e) {
            return Optional.empty();
        }
    }
}
