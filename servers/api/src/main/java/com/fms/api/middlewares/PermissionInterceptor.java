package com.fms.api.middlewares;

import com.fms.api.commons.HttpError;
import com.fms.api.domains.adminauth.AdminContexts;
import com.fms.api.domains.adminauth.RequirePermission;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/** 컨트롤러 메서드의 {@link RequirePermission} 를 검사한다. 넘긴 코드 중 하나도 없으면 403. */
@Component
public class PermissionInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS preflight(OPTIONS) 에는 토큰이 없다. Spring 이 preflight 에도 인터셉터를 실행하므로 건너뛴다.
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        RequirePermission required = handlerMethod.getMethodAnnotation(RequirePermission.class);
        if (required == null) {
            return true;
        }
        Set<String> permissionCodes = AdminContexts.read(request).permissionCodes();
        boolean isAllowed = Arrays.stream(required.value()).anyMatch(code -> permissionCodes.contains(code.code()));
        if (!isAllowed) {
            throw HttpError.permissionDenied();
        }
        return true;
    }
}
