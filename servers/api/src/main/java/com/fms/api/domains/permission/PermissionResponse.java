package com.fms.api.domains.permission;

import com.fms.api.commons.IsoTimes;
import com.fms.entities.PermissionEntity;

public record PermissionResponse(
        String id, String category, String name, String code, String description, String createdAt, String updatedAt) {
    public static PermissionResponse of(PermissionEntity permission) {
        return new PermissionResponse(
                permission.getId().toString(),
                permission.getCategory(),
                permission.getName(),
                permission.getCode(),
                permission.getDescription(),
                IsoTimes.format(permission.getCreatedAt()),
                IsoTimes.format(permission.getUpdatedAt()));
    }
}
