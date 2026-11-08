package com.fms.api.routes.admin.auth;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.Cookies;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.IsoTimes;
import com.fms.api.config.ApiEnv;
import com.fms.api.domains.adminauth.AdminContext;
import com.fms.api.domains.adminauth.AdminContexts;
import com.fms.consts.AdminAuthCookieNames;
import com.fms.consts.PermissionCode;
import com.fms.jwthandler.AdminShortTimeTokenTarget;
import com.fms.jwthandler.AdminTokens;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/admin/auth/** */
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AuthController {
    /** short-time token 으로 할 동작에 필요한 권한. 실제 업로드 · 다운로드 요청에서도 다시 확인한다. */
    private static final Map<String, PermissionCode> SHORT_TIME_TOKEN_PERMISSION_CODES = Map.of(
            AdminShortTimeTokenTarget.UPLOAD_DOCUMENT, PermissionCode.FILE_LIST_CREATE,
            AdminShortTimeTokenTarget.UPLOAD_DOCUMENT_VERSION, PermissionCode.FILE_DETAIL_VERSION_CREATE,
            AdminShortTimeTokenTarget.DOWNLOAD_DOCUMENT_VERSION, PermissionCode.FILE_DETAIL_ACCESS);

    private final ApiEnv apiEnv;
    private final AdminAuthService adminAuthService;
    private final AdminTokenCookies adminTokenCookies;

    /** 토큰은 httpOnly 쿠키로만 내려주고 브라우저 스크립트에는 돌려주지 않는다. */
    @PostMapping("/login")
    ApiResponse<Map<String, Boolean>> login(
            @Valid @RequestBody AdminLoginRequest body, HttpServletRequest request, HttpServletResponse response) {
        adminTokenCookies.write(response, adminAuthService.login(request, body.loginId(), body.password()));
        return ApiResponse.of(Map.of("isLoggedIn", true));
    }

    /** 관리자 웹 서버가 토큰을 갱신할 때 호출한다. 서버 간 호출이라 토큰을 본문으로 주고받는다. */
    @PostMapping("/refresh")
    ApiResponse<AdminTokenResponse> refresh(
            @Valid @RequestBody AdminRefreshTokenRequest body, HttpServletRequest request) {
        return ApiResponse.of(adminAuthService.refresh(request, body.refreshToken()));
    }

    /** 쿠키에 refresh token 이 없어도 쿠키는 지운다. */
    @PostMapping("/logout")
    ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = Cookies.read(request, AdminAuthCookieNames.ADMIN_REFRESH_TOKEN_COOKIE);
        if (refreshToken != null) {
            adminAuthService.revoke(refreshToken);
        }
        adminTokenCookies.clear(response);
        return ResponseEntity.noContent().build();
    }

    /** 관리자 웹이 로그인 후 페이지에 들어올 때와 차단 화면을 그릴 때 호출한다. 차단이면 인터셉터가 403 과 차단 화면용 정보를 돌려준다. */
    @GetMapping("/access-check")
    ApiResponse<Map<String, Boolean>> accessCheck() {
        return ApiResponse.of(Map.of("isAllowed", true));
    }

    @GetMapping("/me")
    ApiResponse<AdminMeResponse> me(HttpServletRequest request) {
        AdminContext admin = AdminContexts.read(request);
        return ApiResponse.of(new AdminMeResponse(
                admin.account().getId().toString(),
                admin.account().getLoginId(),
                admin.account().getNickname(),
                admin.permissionGroup().getName(),
                admin.accessPolicyGroup().getName(),
                List.copyOf(admin.permissionCodes())));
    }

    /** 브라우저가 api 를 직접 호출하는 업로드 · 다운로드용 단기 토큰. 지정한 동작 · 대상에만 쓸 수 있다. */
    @PostMapping("/short-time-token")
    ApiResponse<ShortTimeTokenResponse> shortTimeToken(
            @Valid @RequestBody AdminShortTimeTokenRequest body, HttpServletRequest request) {
        AdminShortTimeTokenTarget target = body.toTarget();
        AdminContext admin = AdminContexts.read(request);
        if (!admin.permissionCodes()
                .contains(
                        SHORT_TIME_TOKEN_PERMISSION_CODES.get(target.purpose()).code())) {
            throw HttpError.permissionDenied();
        }
        String token = AdminTokens.signAdminShortTimeToken(
                admin.account().getId().toString(), target, apiEnv.adminShortTimeTokenSecret());
        Instant expiresAt = Instant.now().plusSeconds(AdminTokens.ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS);
        return ApiResponse.of(new ShortTimeTokenResponse(token, IsoTimes.format(expiresAt)));
    }
}
