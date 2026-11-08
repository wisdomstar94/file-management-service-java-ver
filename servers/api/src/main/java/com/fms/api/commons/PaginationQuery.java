package com.fms.api.commons;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** {@code ?page=1&size=20} (기본값 1 · 20, size 는 100 이하) */
public record PaginationQuery(
        @Min(value = 1, message = "1 이상이어야 합니다.") Integer page,

        @Min(value = 1, message = "1 이상이어야 합니다.") @Max(value = 100, message = "100 이하여야 합니다.")
        Integer size) {
    public PaginationQuery {
        page = page == null ? 1 : page;
        size = size == null ? 20 : size;
    }
}
