package com.fms.api.routes.admin.permissiongroups;

record PermissionGroupSummaryResponse(
        String id, String name, int permissionCount, String createdAt, String updatedAt) {}
