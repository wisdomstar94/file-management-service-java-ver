package com.fms.types.errors;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** 접근 정책 차단 시 {@code details} 에 담기는 값. 차단 화면에 그대로 표시한다. */
public record AccessPolicyDeniedDetails(
        @JsonInclude(JsonInclude.Include.NON_NULL) String accountLoginId,
        @JsonInclude(JsonInclude.Include.NON_NULL) String accountNickname,
        String accessPolicyGroupName,
        List<String> failedReasons,
        String requestIp,
        String requestedAt) {}
