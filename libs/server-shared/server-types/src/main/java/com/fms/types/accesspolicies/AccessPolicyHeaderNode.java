package com.fms.types.accesspolicies;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/** {@code value} 는 {@code EXISTS} 가 아닐 때만 쓰며, 없으면 JSON 에서 빠진다. */
@JsonPropertyOrder({"type", "name", "matchType", "value"})
public record AccessPolicyHeaderNode(
        String type,
        String name,
        AccessPolicyHeaderMatchType matchType,
        @JsonInclude(JsonInclude.Include.NON_NULL) String value)
        implements AccessPolicyNode {
    public static final String TYPE = "HEADER";
}
