package com.fms.api.middlewares;

import com.fms.api.config.ApiEnv;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 요청 IP 를 {@code API_TRUST_PROXY} 기준으로 정해 {@link HttpServletRequest#getRemoteAddr()} 로 돌려준다.
 * 신뢰하지 않는 곳(브라우저가 api 를 직접 호출하는 경우 등)에서 보낸 {@code X-Forwarded-For} 는 무시된다.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TrustedProxyFilter extends OncePerRequestFilter {
    private final TrustProxySetting setting;

    public TrustedProxyFilter(ApiEnv apiEnv) {
        this.setting = TrustProxySetting.parse(apiEnv.trustProxy());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String clientIp = setting.resolveClientIp(request.getRemoteAddr(), request.getHeader("X-Forwarded-For"));
        chain.doFilter(
                new HttpServletRequestWrapper(request) {
                    @Override
                    public String getRemoteAddr() {
                        return clientIp;
                    }
                },
                response);
    }
}
