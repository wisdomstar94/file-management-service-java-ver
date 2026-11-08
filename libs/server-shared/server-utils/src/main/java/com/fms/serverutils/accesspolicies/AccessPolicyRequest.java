package com.fms.serverutils.accesspolicies;

import java.util.List;
import java.util.Map;

/**
 * 접근 정책을 평가할 요청 정보.
 *
 * @param headers 헤더 이름(소문자) → 값 목록
 */
public record AccessPolicyRequest(String ip, Map<String, List<String>> headers) {}
