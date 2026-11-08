package com.fms.api.routes.admin.accounts;

import com.fms.api.commons.IdName;
import java.util.List;

record AssignableGroupsResponse(List<IdName> permissionGroups, List<IdName> accessPolicyGroups) {}
