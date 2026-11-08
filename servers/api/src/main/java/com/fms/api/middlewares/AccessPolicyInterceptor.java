package com.fms.api.middlewares;

import com.fms.api.domains.accesspolicy.AccessPolicyGuard;
import com.fms.api.domains.adminauth.AdminContext;
import com.fms.api.domains.adminauth.AdminContexts;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/** 이미 로그인된 요청도 매번 계정의 접근 정책을 다시 평가한다. (원본 access-policy-middleware) */
@Component
public class AccessPolicyInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS preflight(OPTIONS) 에는 토큰이 없다. Spring 이 preflight 에도 인터셉터를 실행하므로 건너뛴다.
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        AdminContext admin = AdminContexts.read(request);
        AccessPolicyGuard.assertAccessPolicy(request, admin.accessPolicyGroup(), admin.account());
        return true;
    }
}
