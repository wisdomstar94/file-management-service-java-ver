package com.fms.types.accesspolicies;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** 접근 정책 조건 트리의 노드. JSON 의 {@code type} 으로 종류를 구분한다. */
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type",
        visible = true)
@JsonSubTypes({
    @JsonSubTypes.Type(value = AccessPolicyGroupNode.class, name = "GROUP"),
    @JsonSubTypes.Type(value = AccessPolicyIpNode.class, name = "IP"),
    @JsonSubTypes.Type(value = AccessPolicyHeaderNode.class, name = "HEADER"),
})
public sealed interface AccessPolicyNode permits AccessPolicyGroupNode, AccessPolicyIpNode, AccessPolicyHeaderNode {
    String type();
}
