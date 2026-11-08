package com.fms.api.routes.admin.permissiongroups;

import com.fms.api.domains.permission.PermissionResponse;
import java.util.List;

record PermissionGroupDetailResponse(
        String id,
        String name,
        int permissionCount,
        String createdAt,
        String updatedAt,
        List<PermissionResponse> permissions) {}
