package com.fms.api.routes.admin.permissiongroups;

import com.fms.api.commons.UuidParams;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 권한 그룹 생성 · 수정. 수정에서 {@code name} 은 생략할 수 있다.
 * {@code permissionIds} 는 생략하면 빈 목록이다. (원본 zod {@code .default([])} 가 수정에도 적용되는 동작을 그대로 따른다)
 */
record PermissionGroupRequest(
        @Size(min = 1, message = "권한 그룹명을 입력하세요.") @Size(max = 100, message = "100자 이하로 입력하세요.")
        String name,

        List<@NotNull @Pattern(regexp = UuidParams.REGEX, message = "식별키 형식이 올바르지 않습니다.") String> permissionIds) {
    PermissionGroupRequest {
        name = name == null ? null : name.strip();
        permissionIds = permissionIds == null ? List.of() : permissionIds;
    }
}
