package com.fms.api.routes.admin.documents;

import com.fms.api.commons.UuidParams;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

record BulkDeleteDocumentsRequest(
        @NotNull(message = "삭제할 자료를 선택하세요.")
        @Size(min = 1, message = "삭제할 자료를 선택하세요.")
        @Size(max = 500, message = "한 번에 500개까지 삭제할 수 있습니다.")
        List<@NotNull @Pattern(regexp = UuidParams.REGEX, message = "식별키 형식이 올바르지 않습니다.") String> ids) {}
