package com.fms.api.commons;

import com.fms.consts.ApiErrorCode;
import java.util.List;
import java.util.Map;

/** 원본 {@code parseRequest} 와 같은 400 규격 : {@code details.issues[{ path, message }]} */
public final class ValidationErrors {
    private ValidationErrors() {}

    public static HttpError of(List<ValidationIssue> issues) {
        return new HttpError(400, ApiErrorCode.VALIDATION_FAILED, "요청 값이 올바르지 않습니다.", Map.of("issues", issues));
    }

    public static HttpError of(String path, String message) {
        return of(List.of(new ValidationIssue(path, message)));
    }

    /** Spring 의 {@code children[0].cidrs[1]} 경로를 원본(zod) 형식 {@code children.0.cidrs.1} 로 바꾼다. */
    public static String toZodPath(String springPath) {
        return springPath.replaceAll("\\[(\\d+)]", ".$1").replaceAll("^\\.", "");
    }
}
