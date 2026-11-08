package com.fms.types.accesspolicies;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.util.List;

@JsonPropertyOrder({"type", "operator", "children"})
public record AccessPolicyGroupNode(String type, AccessPolicyGroupOperator operator, List<AccessPolicyNode> children)
        implements AccessPolicyNode {
    public static final String TYPE = "GROUP";
}
