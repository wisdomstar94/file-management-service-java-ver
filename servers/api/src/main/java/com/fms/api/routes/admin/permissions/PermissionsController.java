package com.fms.api.routes.admin.permissions;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.RequestBodies;
import com.fms.api.commons.UuidParams;
import com.fms.api.domains.adminauth.RequirePermission;
import com.fms.api.domains.permission.PermissionQueryRepository;
import com.fms.api.domains.permission.PermissionResponse;
import com.fms.consts.PermissionCode;
import com.fms.entities.PermissionEntity;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

/** /api/admin/permissions/** . 권한은 코드로만 생기므로 분류 · 이름 · 설명만 바꿀 수 있다. */
@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
public class PermissionsController {
    private final PermissionQueryRepository permissionRepository;
    private final RequestBodies requestBodies;

    @GetMapping
    @RequirePermission(PermissionCode.PERM_ACCESS)
    ApiResponse<PermissionListResponse> list() {
        List<PermissionEntity> permissions = permissionRepository.findAllByOrderByCategoryAscCreatedAtAsc();
        Set<String> storedCodes =
                permissions.stream().map(PermissionEntity::getCode).collect(Collectors.toSet());
        return ApiResponse.of(new PermissionListResponse(
                permissions.stream().map(PermissionResponse::of).toList(),
                Arrays.stream(PermissionCode.values())
                        .map(PermissionCode::code)
                        .filter(code -> !storedCodes.contains(code))
                        .toList()));
    }

    @GetMapping("/{id}")
    @RequirePermission(PermissionCode.PERM_ACCESS)
    ApiResponse<PermissionResponse> detail(@PathVariable String id) {
        return ApiResponse.of(PermissionResponse.of(findOrThrow(UuidParams.read(id))));
    }

    @PatchMapping("/{id}")
    @RequirePermission(PermissionCode.PERM_UPDATE)
    ApiResponse<PermissionResponse> update(@PathVariable String id, @RequestBody(required = false) JsonNode rawBody) {
        UUID permissionId = UuidParams.read(id);
        UpdatePermissionRequest body = requestBodies.parse(rawBody, UpdatePermissionRequest.class);
        requestBodies.rejectNulls(rawBody, "category", "name", "description");
        PermissionEntity permission = findOrThrow(permissionId);
        if (body.category() != null) {
            permission.setCategory(body.category());
        }
        if (body.name() != null) {
            permission.setName(body.name());
        }
        if (body.description() != null) {
            permission.setDescription(body.description());
        }
        return ApiResponse.of(PermissionResponse.of(permissionRepository.saveAndFlush(permission)));
    }

    private PermissionEntity findOrThrow(UUID id) {
        return permissionRepository.findById(id).orElseThrow(() -> HttpError.notFound("권한"));
    }
}
