package com.fms.api.commons;

import com.fms.consts.ApiErrorCode;
import java.util.UUID;
import java.util.regex.Pattern;

public final class UuidParams {
    /** zod {@code z.uuid()} 와 같은 판정 (RFC 9562 버전 1~8 · nil · max). Bean Validation {@code @Pattern} 에도 쓴다. */
    public static final String REGEX =
            "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}"
                    + "|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$";

    private static final Pattern UUID_PATTERN = Pattern.compile(REGEX);

    private UuidParams() {}

    public static boolean isUuid(String value) {
        return value != null && UUID_PATTERN.matcher(value).matches();
    }

    /** 경로의 식별키가 uuid 가 아니면 DB 를 조회하지 않고 404 로 응답한다. */
    public static UUID read(String value) {
        if (!isUuid(value)) {
            throw new HttpError(404, ApiErrorCode.NOT_FOUND, "대상을 찾을 수 없습니다.");
        }
        return UUID.fromString(value);
    }
}
