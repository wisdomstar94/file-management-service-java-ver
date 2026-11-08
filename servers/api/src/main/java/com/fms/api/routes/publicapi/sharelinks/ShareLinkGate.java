package com.fms.api.routes.publicapi.sharelinks;

import com.fms.api.commons.Cookies;
import com.fms.api.commons.HttpError;
import com.fms.api.config.ApiEnv;
import com.fms.api.domains.accesspolicy.AccessPolicyGuard;
import com.fms.api.domains.document.DocumentVersionQueryRepository;
import com.fms.api.domains.documentversion.DocumentVersions;
import com.fms.api.domains.sharelink.ShareLinkQueryRepository;
import com.fms.entities.DocumentVersionEntity;
import com.fms.entities.ShareLinkDefaultVersionMode;
import com.fms.entities.ShareLinkEntity;
import com.fms.jwthandler.JwtHandler;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 공개 링크를 열 때 거치는 순서 : 링크 확인 → 접근 정책 → 비밀번호(잠금 해제 토큰) */
@Component
@RequiredArgsConstructor
class ShareLinkGate {
    static final String UNLOCK_TOKEN_AUDIENCE = "fms-share-link-unlock";

    private final ApiEnv apiEnv;
    private final ShareLinkQueryRepository shareLinkRepository;
    private final DocumentVersionQueryRepository versionRepository;

    /** 공유 링크 키로 링크 · 자료 · 버전(최신순)을 읽고, 링크에 접근 정책이 있으면 통과해야 한다. */
    @Transactional(readOnly = true)
    OpenedShareLink openOrThrow(HttpServletRequest request, String shareLinkKey) {
        ShareLinkEntity link = shareLinkRepository
                .findWithDocumentByShareLinkKey(shareLinkKey)
                .filter(found -> found.getDocument() != null)
                .orElseThrow(() -> HttpError.notFound("링크"));
        if (link.getAccessPolicyGroup() != null) {
            AccessPolicyGuard.assertAccessPolicy(request, link.getAccessPolicyGroup(), null);
        }
        List<DocumentVersionEntity> versions = versionRepository.findByDocumentIdOrderBySeqDesc(link.getDocumentId());
        return new OpenedShareLink(link, link.getDocument(), versions, null);
    }

    /** 접근 정책 → 비밀번호 순서로 통과해야 자료 정보를 연다. */
    OpenedShareLink unlockOrThrow(HttpServletRequest request, String shareLinkKey) {
        OpenedShareLink opened = openOrThrow(request, shareLinkKey);
        String token = Cookies.read(request, unlockCookieName(opened.link().getShareLinkKey()));
        if (!isUnlocked(opened.link(), token)) {
            throw HttpError.unauthorized("비밀번호가 필요합니다.");
        }
        ShareLinkEntity link = opened.link();
        DocumentVersionEntity fixed = link.getDefaultVersionMode() == ShareLinkDefaultVersionMode.FIXED
                ? opened.versions().stream()
                        .filter(version -> version.getId().equals(link.getFixedVersionId()))
                        .findFirst()
                        .orElse(null)
                : null;
        DocumentVersionEntity defaultVersion = fixed != null
                ? fixed
                : DocumentVersions.resolveDefault(
                        opened.versions(), opened.document().getDefaultVersionId());
        return new OpenedShareLink(link, opened.document(), opened.versions(), defaultVersion);
    }

    String signUnlockToken(ShareLinkEntity link) {
        return JwtHandler.signJwt(
                Map.of("pwf", readPasswordFingerprint(link)),
                link.getId().toString(),
                UNLOCK_TOKEN_AUDIENCE,
                apiEnv.shareLinkUnlockTokenSecret(),
                apiEnv.shareLinkUnlockExpiresInSeconds());
    }

    private boolean isUnlocked(ShareLinkEntity link, String token) {
        if (link.getPasswordHash() == null) {
            return true;
        }
        if (token == null || token.isEmpty()) {
            return false;
        }
        return JwtHandler.verifyJwt(token, UNLOCK_TOKEN_AUDIENCE, apiEnv.shareLinkUnlockTokenSecret())
                .filter(claims -> link.getId().toString().equals(claims.getSubject()))
                .filter(claims -> readPasswordFingerprint(link).equals(claims.getClaim("pwf")))
                .isPresent();
    }

    /** 링크마다 잠금 해제 토큰을 따로 둔다. */
    static String unlockCookieName(String shareLinkKey) {
        return "fms_share_unlock_" + shareLinkKey;
    }

    /** 비밀번호를 바꾸면 이전에 발급한 잠금 해제 토큰이 무효가 되도록 해시의 지문을 담는다. */
    private static String readPasswordFingerprint(ShareLinkEntity link) {
        try {
            String hash = link.getPasswordHash() == null ? "" : link.getPasswordHash();
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(hash.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
