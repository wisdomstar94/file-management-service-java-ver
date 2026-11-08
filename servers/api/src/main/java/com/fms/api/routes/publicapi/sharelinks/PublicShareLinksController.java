package com.fms.api.routes.publicapi.sharelinks;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.ContentDispositions;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.IsoTimes;
import com.fms.api.commons.UuidParams;
import com.fms.api.config.ApiEnv;
import com.fms.api.domains.documentversion.VersionFileResponses;
import com.fms.api.domains.sharelink.ShareLinkAvailability;
import com.fms.consts.ApiErrorCode;
import com.fms.entities.DocumentVersionEntity;
import com.fms.entities.ShareLinkEntity;
import com.fms.passwordhandler.PasswordHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/** /api/public/share-links/** */
@RestController
@RequestMapping("/api/public/share-links")
@RequiredArgsConstructor
public class PublicShareLinksController {
    private final ApiEnv apiEnv;
    private final ShareLinkGate shareLinkGate;
    private final DownloadConsumer downloadConsumer;
    private final VersionFileResponses versionFileResponses;

    @GetMapping("/{shareLinkKey}")
    ApiResponse<Map<String, String>> gate(@PathVariable String shareLinkKey, HttpServletRequest request) {
        ShareLinkEntity link = shareLinkGate.openOrThrow(request, shareLinkKey).link();
        return ApiResponse.of(Map.of("state", link.getPasswordHash() == null ? "OPEN" : "PASSWORD_REQUIRED"));
    }

    /** 잠금 해제 토큰은 그 링크 경로 한정 httpOnly 쿠키로 심고 본문에는 담지 않는다. */
    @PostMapping("/{shareLinkKey}/unlock")
    ApiResponse<Map<String, String>> unlock(
            @PathVariable String shareLinkKey,
            @Valid @RequestBody UnlockShareLinkRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        ShareLinkEntity link = shareLinkGate.openOrThrow(request, shareLinkKey).link();
        boolean isValid = link.getPasswordHash() != null
                && PasswordHandler.verifyPassword(link.getPasswordHash(), body.password());
        if (!isValid) {
            throw new HttpError(401, ApiErrorCode.INVALID_CREDENTIALS, "비밀번호가 올바르지 않습니다.");
        }
        Instant expiresAt = Instant.now().plusSeconds(apiEnv.shareLinkUnlockExpiresInSeconds());
        ResponseCookie cookie = ResponseCookie.from(
                        ShareLinkGate.unlockCookieName(link.getShareLinkKey()), shareLinkGate.signUnlockToken(link))
                .httpOnly(true)
                .sameSite("Lax")
                .secure(apiEnv.secureCookie())
                // 쿠키 경로를 그 링크의 api 로 한정해 다른 링크에 섞이지 않게 한다.
                .path("/api/public/share-links/" + ContentDispositions.encodeUriComponent(link.getShareLinkKey()))
                .maxAge(apiEnv.shareLinkUnlockExpiresInSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ApiResponse.of(Map.of("expiresAt", IsoTimes.format(expiresAt)));
    }

    @GetMapping("/{shareLinkKey}/detail")
    ApiResponse<PublicShareLinkDetailResponse> detail(@PathVariable String shareLinkKey, HttpServletRequest request) {
        OpenedShareLink opened = shareLinkGate.unlockOrThrow(request, shareLinkKey);
        ShareLinkEntity link = opened.link();
        return ApiResponse.of(new PublicShareLinkDetailResponse(
                opened.document().getName(),
                PublicShareLinkVersion.of(opened.defaultVersion()),
                link.isShowOtherVersions()
                        ? opened.versions().stream()
                                .filter(version -> !version.getId()
                                        .equals(opened.defaultVersion().getId()))
                                .map(PublicShareLinkVersion::of)
                                .toList()
                        : null,
                link.isShowOtherVersions() && link.isAllowOtherVersionDownload(),
                link.isShowDownloadStatus()
                        ? new PublicShareLinkDetailResponse.DownloadStatus(
                                link.getDownloadCount(), link.getMaxDownloadCount())
                        : null,
                IsoTimes.format(link.getAvailableFrom()),
                IsoTimes.format(link.getAvailableUntil()),
                ShareLinkAvailability.of(link)));
    }

    /** 브라우저가 이동해 오는 주소라, 받을 수 없으면 JSON 대신 공개 링크 화면으로 돌려보낸다. */
    @GetMapping("/{shareLinkKey}/versions/{versionId}/download")
    ResponseEntity<StreamingResponseBody> download(
            @PathVariable String shareLinkKey, @PathVariable String versionId, HttpServletRequest request) {
        try {
            OpenedShareLink opened = shareLinkGate.unlockOrThrow(request, shareLinkKey);
            UUID id = UuidParams.read(versionId);
            DocumentVersionEntity version = opened.versions().stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst()
                    .orElse(null);
            ShareLinkEntity link = opened.link();
            boolean isAllowedVersion = version != null
                    && (version.getId().equals(opened.defaultVersion().getId())
                            || (link.isShowOtherVersions() && link.isAllowOtherVersionDownload()));
            if (!isAllowedVersion) {
                throw HttpError.notFound("버전");
            }
            downloadConsumer.consume(link.getId(), version.getId(), request.getRemoteAddr());
            return versionFileResponses.send(version);
        } catch (HttpError error) {
            return redirectToShareLinkPage(shareLinkKey, error);
        }
    }

    /** 잠금 해제가 만료된 것이면 화면이 비밀번호 입력을 띄우면 충분하고, 그 외에는 실패 사유와 시각을 쿼리로 넘긴다. */
    private ResponseEntity<StreamingResponseBody> redirectToShareLinkPage(String shareLinkKey, HttpError error) {
        String origin = apiEnv.userWebOrigin().replaceAll("/+$", "");
        StringBuilder url =
                new StringBuilder(origin).append("/s/").append(ContentDispositions.encodeUriComponent(shareLinkKey));
        if (error.getCode() != ApiErrorCode.UNAUTHORIZED) {
            url.append("?downloadError=")
                    .append(error.getCode().name())
                    .append("&timestamp=")
                    .append(System.currentTimeMillis());
        }
        return ResponseEntity.status(HttpStatus.SEE_OTHER)
                .header(HttpHeaders.LOCATION, url.toString())
                .build();
    }
}
