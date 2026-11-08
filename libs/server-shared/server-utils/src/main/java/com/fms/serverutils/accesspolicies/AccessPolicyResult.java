package com.fms.serverutils.accesspolicies;

import java.util.List;

public record AccessPolicyResult(boolean isAllowed, List<String> failedReasons) {}
