package com.fms.api.routes.admin.documents;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/** @param createdWithinDays 자료 등록일 기준 최근 N일. 없으면 전체 */
record DocumentListQuery(
        @Min(value = 1, message = "1 이상이어야 합니다.") Integer page,

        @Min(value = 1, message = "1 이상이어야 합니다.") @Max(value = 100, message = "100 이하여야 합니다.")
        Integer size,

        @Size(max = 300, message = "300자 이하로 입력하세요.") String keyword,

        @Min(value = 1, message = "1 이상이어야 합니다.") @Max(value = 3650, message = "3650 이하여야 합니다.")
        Integer createdWithinDays) {
    DocumentListQuery {
        page = page == null ? 1 : page;
        size = size == null ? 20 : size;
        keyword = keyword == null ? null : keyword.strip();
    }
}
