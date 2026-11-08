package com.fms.api.commons;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fms.consts.ApiErrorCode;

/** 실패 응답 본문 공통 규격 {@code { error: { code, message, requestKey?, details? } }} */
public record ApiFailBody(ApiErrorBody error) {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ApiErrorBody(ApiErrorCode code, String message, String requestKey, Object details) {}

    public static ApiFailBody of(ApiErrorCode code, String message, Object details) {
        return new ApiFailBody(new ApiErrorBody(code, message, null, details));
    }
}
