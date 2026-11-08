package com.fms.api.routes.admin.accounts;

import com.fms.api.commons.UuidParams;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 계정 생성 · 수정. 생성은 {@link #CREATE} 그룹으로 필수 값까지 검사한다. 수정에서 비밀번호는 바꿀 때만 보낸다.
 * {@code memo} 는 생략하면 빈 문자열이다. (원본 zod {@code .default("")} 가 수정에도 적용되는 동작을 그대로 따른다)
 */
record AdminAccountRequest(
        @Pattern(regexp = "^[a-zA-Z0-9_.-]{3,100}$", message = "아이디는 영문 · 숫자 · `_` `.` `-` 3~100자입니다.")
        String loginId,

        @Size(min = 8, message = "비밀번호는 8자 이상입니다.") @Size(max = 200, message = "200자 이하로 입력하세요.")
        String password,

        @Size(min = 1, message = "닉네임을 입력하세요.") @Size(max = 100, message = "100자 이하로 입력하세요.")
        String nickname,

        @Size(max = 2000, message = "2000자 이하로 입력하세요.") String memo,

        @Pattern(regexp = UuidParams.REGEX, message = "식별키 형식이 올바르지 않습니다.")
        String permissionGroupId,

        @Pattern(regexp = UuidParams.REGEX, message = "식별키 형식이 올바르지 않습니다.")
        String accessPolicyGroupId) {
    AdminAccountRequest {
        loginId = loginId == null ? null : loginId.strip();
        nickname = nickname == null ? null : nickname.strip();
        memo = memo == null ? "" : memo;
    }
}
