package com.fms.api.commons;

import java.nio.charset.StandardCharsets;

public final class ContentDispositions {
    private static final String UNRESERVED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()";

    private ContentDispositions() {}

    /** 원래 파일명으로 내려받게 한다. ASCII 가 아닌 글자는 {@code filename*} (RFC 5987) 로 넘긴다. */
    public static String attachment(String fileName) {
        StringBuilder asciiFallback = new StringBuilder();
        fileName.codePoints().forEach(c -> asciiFallback.append(c >= 0x20 && c <= 0x7e && c != '"' ? (char) c : '_'));
        return "attachment; filename=\"" + asciiFallback + "\"; filename*=UTF-8''" + encodeUriComponent(fileName);
    }

    /** JavaScript {@code encodeURIComponent} 와 같은 인코딩 */
    public static String encodeUriComponent(String value) {
        StringBuilder encoded = new StringBuilder();
        for (byte b : value.getBytes(StandardCharsets.UTF_8)) {
            char c = (char) (b & 0xff);
            if (c < 0x80 && UNRESERVED.indexOf(c) >= 0) {
                encoded.append(c);
            } else {
                encoded.append('%').append(String.format("%02X", b & 0xff));
            }
        }
        return encoded.toString();
    }
}
