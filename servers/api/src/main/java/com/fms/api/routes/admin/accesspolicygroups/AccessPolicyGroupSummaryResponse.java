package com.fms.api.routes.admin.accesspolicygroups;

import com.fms.api.commons.IsoTimes;
import com.fms.entities.AccessPolicyGroupEntity;

record AccessPolicyGroupSummaryResponse(String id, String name, String createdAt, String updatedAt) {
    static AccessPolicyGroupSummaryResponse of(AccessPolicyGroupEntity group) {
        return new AccessPolicyGroupSummaryResponse(
                group.getId().toString(),
                group.getName(),
                IsoTimes.format(group.getCreatedAt()),
                IsoTimes.format(group.getUpdatedAt()));
    }
}
