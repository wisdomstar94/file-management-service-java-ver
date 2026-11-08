package com.fms.api.routes.admin.documents.sharelinks;

import com.fms.api.commons.UuidParams;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.OffsetDateTime;

/**
 * 공개 링크 생성 · 수정. 생성은 모든 필드가 있어야 하고(null 은 허용), 수정은 생략한 필드를 바꾸지 않는다.
 *
 * @param password 문자열이면 그 비밀번호로 설정, {@code null} 이면 비밀번호 해제
 * @param availableFrom offset 을 포함한 ISO 8601 일시
 */
record ShareLinkRequest(
        @Pattern(regexp = UuidParams.REGEX, message = "식별키 형식이 올바르지 않습니다.")
        String accessPolicyGroupId,

        @Size(min = 4, message = "비밀번호는 4자 이상입니다.") @Size(max = 200, message = "200자 이하로 입력하세요.")
        String password,

        @Min(value = 1, message = "1 이상이어야 합니다.") Integer maxDownloadCount,

        @Pattern(regexp = ISO_DATETIME, message = "일시 형식이 올바르지 않습니다.")
        String availableFrom,

        @Pattern(regexp = ISO_DATETIME, message = "일시 형식이 올바르지 않습니다.")
        String availableUntil,

        @Pattern(regexp = "FOLLOW_DOCUMENT|FIXED", message = "FOLLOW_DOCUMENT · FIXED 중 하나여야 합니다.")
        String defaultVersionMode,

        @Pattern(regexp = UuidParams.REGEX, message = "식별키 형식이 올바르지 않습니다.")
        String fixedVersionId,

        Boolean isShowOtherVersions,
        Boolean isAllowOtherVersionDownload,
        Boolean isShowDownloadStatus) {

    /** zod {@code z.iso.datetime({ offset: true })} 대응 */
    static final String ISO_DATETIME = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z|[+-]\\d{2}:\\d{2})$";

    @AssertTrue(message = "종료일은 시작일보다 빠를 수 없습니다.")
    boolean isAvailableUntil() {
        if (availableFrom == null || availableUntil == null) {
            return true;
        }
        Instant from = toInstant(availableFrom);
        Instant until = toInstant(availableUntil);
        return from == null || until == null || !from.isAfter(until);
    }

    @AssertTrue(message = "별도 지정할 버전을 선택하세요.")
    boolean isFixedVersionId() {
        return !"FIXED".equals(defaultVersionMode) || (fixedVersionId != null && !fixedVersionId.isEmpty());
    }

    static Instant toInstant(String isoDateTime) {
        try {
            return OffsetDateTime.parse(isoDateTime).toInstant();
        } catch (RuntimeException e) {
            return null;
        }
    }
}
