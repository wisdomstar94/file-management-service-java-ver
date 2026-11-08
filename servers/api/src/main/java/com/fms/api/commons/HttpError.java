package com.fms.api.commons;

import com.fms.consts.ApiErrorCode;
import lombok.Getter;

/** 컨트롤러 · 서비스에서 던지면 {@link GlobalExceptionHandler} 가 {@code status} 와 {@code { error: { code, message, details } }} 로 응답한다. */
@Getter
public class HttpError extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final int status;
    private final ApiErrorCode code;
    private final transient Object details;

    public HttpError(int status, ApiErrorCode code, String message) {
        this(status, code, message, null);
    }

    public HttpError(int status, ApiErrorCode code, String message, Object details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }

    public static HttpError notFound(String target) {
        return new HttpError(404, ApiErrorCode.NOT_FOUND, target + "을(를) 찾을 수 없습니다.");
    }

    public static HttpError conflict(String message) {
        return new HttpError(409, ApiErrorCode.CONFLICT, message);
    }

    public static HttpError unauthorized(String message) {
        return new HttpError(401, ApiErrorCode.UNAUTHORIZED, message);
    }

    public static HttpError permissionDenied() {
        return new HttpError(403, ApiErrorCode.PERMISSION_DENIED, "이 기능을 사용할 권한이 없습니다.");
    }

    public static HttpError validation(String message) {
        return new HttpError(400, ApiErrorCode.VALIDATION_FAILED, message);
    }
}
