package com.fms.types.accesspolicies;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.util.List;

@JsonPropertyOrder({"type", "mode", "cidrs"})
public record AccessPolicyIpNode(String type, AccessPolicyIpMode mode, List<String> cidrs) implements AccessPolicyNode {
    public static final String TYPE = "IP";
}
