package com.fms.api.routes.admin.accesspolicygroups;

import com.fms.types.accesspolicies.AccessPolicyNode;

record AccessPolicyGroupDetailResponse(
        String id,
        String name,
        String createdAt,
        String updatedAt,
        AccessPolicyNode ruleTree,
        long usedAccountCount,
        long usedShareLinkCount) {}
