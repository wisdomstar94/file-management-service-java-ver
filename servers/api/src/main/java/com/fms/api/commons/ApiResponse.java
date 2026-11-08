package com.fms.api.commons;

/** 성공 응답 본문 공통 규격 {@code { data }} */
public record ApiResponse<T>(T data) {
    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data);
    }
}
