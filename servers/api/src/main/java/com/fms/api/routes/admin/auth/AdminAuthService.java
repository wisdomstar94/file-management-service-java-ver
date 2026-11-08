package com.fms.api.routes.admin.auth;

import com.fms.api.commons.HttpError;
import com.fms.api.commons.IsoTimes;
import com.fms.api.config.ApiEnv;
import com.fms.api.domains.accesspolicy.AccessPolicyGuard;
import com.fms.api.domains.adminauth.AdminAccountQueryRepository;
import com.fms.consts.ApiErrorCode;
import com.fms.entities.AdminAccountEntity;
import com.fms.entities.AdminRefreshTokenEntity;
import com.fms.jwthandler.AdminTokens;
import com.fms.passwordhandler.PasswordHandler;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
class AdminAuthService {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ApiEnv apiEnv;
    private final AdminAccountQueryRepository adminAccountRepository;
    private final AdminRefreshTokenQueryRepository refreshTokenRepository;
    private final TransactionTemplate transactionTemplate;

    AdminTokenResponse login(HttpServletRequest request, String loginId, String password) {
        Optional<AdminAccountEntity> found = adminAccountRepository.findWithAccessPolicyGroupByLoginId(loginId);
        boolean isValidPassword =
                found.isPresent() && PasswordHandler.verifyPassword(found.get().getPasswordHash(), password);
        if (found.isEmpty() || found.get().getAccessPolicyGroup() == null || !isValidPassword) {
            throw new HttpError(401, ApiErrorCode.INVALID_CREDENTIALS, "아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        AdminAccountEntity account = found.get();
        AccessPolicyGuard.assertAccessPolicy(request, account.getAccessPolicyGroup(), account);
        return transactionTemplate.execute(status -> issueTokens(account.getId(), UUID.randomUUID()));
    }

    /**
     * 쓴 refresh token 도 유예 시간 동안은 받아 줘서, 동시에 들어온 갱신 요청이 모두 새 토큰을 받게 한다.
     * 유예 시간이 지난 뒤 다시 쓰이면 탈취로 보고 그 계열을 폐기한다.
     */
    AdminTokenResponse refresh(HttpServletRequest request, String refreshToken) {
        // 401 을 트랜잭션 안에서 던지면 계열 폐기까지 롤백되므로, 커밋한 뒤에 던진다.
        AdminTokenResponse issued = transactionTemplate.execute(status -> {
            Optional<AdminRefreshTokenEntity> found =
                    refreshTokenRepository.findByTokenHash(hashRefreshToken(refreshToken));
            Instant now = Instant.now();
            if (found.isEmpty() || !found.get().getExpiresAt().isAfter(now)) {
                return null;
            }
            AdminRefreshTokenEntity stored = found.get();
            Optional<AdminAccountEntity> account =
                    adminAccountRepository.findWithGroupsById(stored.getAdminAccountId());
            if (account.isEmpty() || account.get().getAccessPolicyGroup() == null) {
                return null;
            }
            Duration grace = Duration.ofSeconds(apiEnv.adminRefreshTokenReuseGraceSeconds());
            if (stored.getUsedAt() != null && !stored.getUsedAt().plus(grace).isAfter(now)) {
                refreshTokenRepository.deleteByFamilyId(stored.getFamilyId());
                return null;
            }

            AccessPolicyGuard.assertAccessPolicy(request, account.get().getAccessPolicyGroup(), account.get());
            if (stored.getUsedAt() == null) {
                stored.setUsedAt(now);
                refreshTokenRepository.saveAndFlush(stored);
            }
            return issueTokens(account.get().getId(), stored.getFamilyId());
        });
        if (issued == null) {
            throw HttpError.unauthorized("로그인이 만료되었습니다.");
        }
        return issued;
    }

    void revoke(String refreshToken) {
        transactionTemplate.executeWithoutResult(
                status -> refreshTokenRepository.deleteByTokenHash(hashRefreshToken(refreshToken)));
    }

    /**
     * access token 과 refresh token 을 새로 발급하고 최근 접속일을 갱신한다. refresh token 은 해시만 저장한다.
     * 쓴 refresh token 은 재사용 감지에 쓰려고 만료 시각까지 남기므로, 발급할 때 그 계정의 만료된 행을 지운다.
     * {@code familyId} 는 로그인이면 새 값, 갱신이면 쓴 refresh token 의 값을 넘긴다.
     */
    private AdminTokenResponse issueTokens(UUID adminAccountId, UUID familyId) {
        Instant now = Instant.now();
        byte[] randomBytes = new byte[32];
        RANDOM.nextBytes(randomBytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        Instant refreshTokenExpiresAt = now.plus(Duration.ofDays(apiEnv.refreshTokenDays()));

        refreshTokenRepository.deleteExpired(adminAccountId, now);
        AdminRefreshTokenEntity entity = new AdminRefreshTokenEntity();
        entity.setAdminAccountId(adminAccountId);
        entity.setFamilyId(familyId);
        entity.setTokenHash(hashRefreshToken(refreshToken));
        entity.setExpiresAt(refreshTokenExpiresAt);
        refreshTokenRepository.save(entity);
        adminAccountRepository.updateLastAccessedAt(adminAccountId, now);

        return new AdminTokenResponse(
                AdminTokens.signAdminAccessToken(adminAccountId.toString(), apiEnv.adminAccessTokenSecret()),
                IsoTimes.format(now.plusSeconds(AdminTokens.ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS)),
                refreshToken,
                IsoTimes.format(refreshTokenExpiresAt));
    }

    static String hashRefreshToken(String refreshToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(refreshToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
