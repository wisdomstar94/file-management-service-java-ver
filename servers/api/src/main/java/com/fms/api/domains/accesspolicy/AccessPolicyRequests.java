package com.fms.api.domains.accesspolicy;

import com.fms.serverutils.accesspolicies.AccessPolicyRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class AccessPolicyRequests {
    private AccessPolicyRequests() {}

    /** 접근 정책 평가에 쓸 요청 IP({@code API_TRUST_PROXY} 반영)와 헤더(이름 소문자) */
    public static AccessPolicyRequest read(HttpServletRequest request) {
        Map<String, List<String>> headers = new LinkedHashMap<>();
        for (String name : Collections.list(request.getHeaderNames())) {
            headers.computeIfAbsent(name.toLowerCase(Locale.ROOT), key -> new java.util.ArrayList<>())
                    .addAll(Collections.list(request.getHeaders(name)));
        }
        return new AccessPolicyRequest(request.getRemoteAddr(), headers);
    }
}
