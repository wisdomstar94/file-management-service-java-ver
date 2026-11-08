package com.fms.api.commons;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ContentDispositionsTest {
    @Test
    void encodesLikeOriginal() {
        // 원본: `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
        assertThat(ContentDispositions.attachment("보고서 (최종)'.pdf"))
                .isEqualTo(
                        "attachment; filename=\"___ (__)'.pdf\"; filename*=UTF-8''%EB%B3%B4%EA%B3%A0%EC%84%9C%20(%EC%B5%9C%EC%A2%85)'.pdf");
        assertThat(ContentDispositions.attachment("a\"b.txt"))
                .isEqualTo("attachment; filename=\"a_b.txt\"; filename*=UTF-8''a%22b.txt");
    }
}
