package com.fms.api.commons;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public final class Cookies {
    private Cookies() {}

    /** 요청 Cookie 헤더에서 쿠키 하나를 읽는다. 값은 URI 디코딩하고, 실패하면 원래 값을 쓴다. */
    public static String read(HttpServletRequest request, String name) {
        String header = request.getHeader("Cookie");
        if (header == null) {
            return null;
        }
        for (String pair : header.split(";")) {
            int separatorIndex = pair.indexOf('=');
            if (separatorIndex != -1 && pair.substring(0, separatorIndex).trim().equals(name)) {
                String value = pair.substring(separatorIndex + 1).trim();
                try {
                    return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
                } catch (IllegalArgumentException e) {
                    return value;
                }
            }
        }
        return null;
    }
}
