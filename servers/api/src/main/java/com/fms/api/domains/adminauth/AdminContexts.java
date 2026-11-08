package com.fms.api.domains.adminauth;

import com.fms.api.commons.HttpError;
import jakarta.servlet.http.HttpServletRequest;

public final class AdminContexts {
    private static final String ATTRIBUTE = AdminContext.class.getName();

    private AdminContexts() {}

    public static void write(HttpServletRequest request, AdminContext context) {
        request.setAttribute(ATTRIBUTE, context);
    }

    /** {@code AdminAuthInterceptor} 를 거친 요청의 관리자 정보. 거치지 않았으면 401. */
    public static AdminContext read(HttpServletRequest request) {
        if (request.getAttribute(ATTRIBUTE) instanceof AdminContext context) {
            return context;
        }
        throw HttpError.unauthorized("로그인이 필요합니다.");
    }
}
