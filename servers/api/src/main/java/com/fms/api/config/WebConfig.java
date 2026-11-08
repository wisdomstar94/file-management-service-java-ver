package com.fms.api.config;

import com.fms.api.middlewares.AccessPolicyInterceptor;
import com.fms.api.middlewares.AdminAuthInterceptor;
import com.fms.api.middlewares.PermissionInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    /** 로그인 전에 부르는 인증 api. 나머지 /api/admin/** 는 로그인 + 접근 정책 통과가 필요하다. */
    private static final String[] PUBLIC_ADMIN_AUTH_PATHS = {
        "/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/logout"
    };

    private final ApiEnv apiEnv;
    private final AdminAuthInterceptor adminAuthInterceptor;
    private final AccessPolicyInterceptor accessPolicyInterceptor;
    private final PermissionInterceptor permissionInterceptor;

    /**
     * 원본(Express)처럼 요청의 Accept 헤더와 상관없이 JSON 으로 응답한다. 관리자 웹 서버는 서버 액션 요청 헤더
     * (Accept: text/x-component 등)를 그대로 넘기므로, 내용 협상을 하면 406 으로 거부하게 된다.
     */
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.ignoreAcceptHeader(true).defaultContentType(MediaType.APPLICATION_JSON);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(apiEnv.corsOriginList().toArray(String[]::new))
                .allowedMethods("GET", "HEAD", "PUT", "PATCH", "POST", "DELETE")
                .allowedHeaders("*")
                // 로그인 · 공개 링크 잠금 해제 쿠키를 브라우저가 직접 주고받는다.
                .allowCredentials(true)
                .exposedHeaders("Content-Disposition");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns(PUBLIC_ADMIN_AUTH_PATHS);
        registry.addInterceptor(accessPolicyInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns(PUBLIC_ADMIN_AUTH_PATHS);
        registry.addInterceptor(permissionInterceptor).addPathPatterns("/api/admin/**");
    }
}
