package com.fms.api.routes.admin.permissiongroups;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.IsoTimes;
import com.fms.api.commons.RequestBodies;
import com.fms.api.commons.UuidParams;
import com.fms.api.commons.ValidationErrors;
import com.fms.api.domains.adminauth.RequirePermission;
import com.fms.api.domains.permission.PermissionQueryRepository;
import com.fms.api.domains.permission.PermissionResponse;
import com.fms.consts.PermissionCode;
import com.fms.entities.PermissionEntity;
import com.fms.entities.PermissionGroupEntity;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

/** /api/admin/permission-groups/** */
@RestController
@RequestMapping("/api/admin/permission-groups")
@RequiredArgsConstructor
public class PermissionGroupsController {
    private final PermissionGroupQueryRepository groupRepository;
    private final PermissionQueryRepository permissionRepository;
    private final RequestBodies requestBodies;

    @GetMapping
    @RequirePermission(PermissionCode.PERM_GROUP_ACCESS)
    ApiResponse<List<PermissionGroupSummaryResponse>> list() {
        return ApiResponse.of(groupRepository.findAllWithPermissions().stream()
                .map(group -> new PermissionGroupSummaryResponse(
                        group.getId().toString(),
                        group.getName(),
                        group.getPermissions().size(),
                        IsoTimes.format(group.getCreatedAt()),
                        IsoTimes.format(group.getUpdatedAt())))
                .toList());
    }

    /** 권한 그룹 상세의 체크 목록. 권한 관리 권한이 없어도 그룹에 넣을 권한은 볼 수 있어야 한다. */
    @GetMapping("/assignable-permissions")
    @RequirePermission(PermissionCode.PERM_GROUP_ACCESS)
    ApiResponse<List<PermissionResponse>> assignablePermissions() {
        return ApiResponse.of(permissionRepository.findAllByOrderByCategoryAscCreatedAtAsc().stream()
                .map(PermissionResponse::of)
                .toList());
    }

    @PostMapping
    @RequirePermission(PermissionCode.PERM_GROUP_CREATE)
    ResponseEntity<ApiResponse<PermissionGroupDetailResponse>> create(@RequestBody(required = false) JsonNode rawBody) {
        PermissionGroupRequest body = requestBodies.parse(rawBody, PermissionGroupRequest.class);
        if (body.name() == null) {
            throw ValidationErrors.of("name", "권한 그룹명을 입력하세요.");
        }
        PermissionGroupEntity group = new PermissionGroupEntity();
        group.setName(body.name());
        group.setPermissions(findPermissionsOrThrow(body.permissionIds()));
        PermissionGroupEntity saved = groupRepository.saveAndFlush(group);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(toDetail(findOrThrow(saved.getId()))));
    }

    @GetMapping("/{id}")
    @RequirePermission(PermissionCode.PERM_GROUP_ACCESS)
    ApiResponse<PermissionGroupDetailResponse> detail(@PathVariable String id) {
        return ApiResponse.of(toDetail(findOrThrow(UuidParams.read(id))));
    }

    @PatchMapping("/{id}")
    @RequirePermission(PermissionCode.PERM_GROUP_UPDATE)
    ApiResponse<PermissionGroupDetailResponse> update(
            @PathVariable String id, @RequestBody(required = false) JsonNode rawBody) {
        PermissionGroupRequest body = requestBodies.parse(rawBody, PermissionGroupRequest.class);
        requestBodies.rejectNulls(rawBody, "name", "permissionIds");
        PermissionGroupEntity group = findOrThrow(UuidParams.read(id));
        if (body.name() != null) {
            group.setName(body.name());
        }
        group.setPermissions(findPermissionsOrThrow(body.permissionIds()));
        groupRepository.saveAndFlush(group);
        return ApiResponse.of(toDetail(findOrThrow(group.getId())));
    }

    @DeleteMapping("/{id}")
    @RequirePermission(PermissionCode.PERM_GROUP_DELETE)
    ResponseEntity<Void> delete(@PathVariable String id) {
        PermissionGroupEntity group = findOrThrow(UuidParams.read(id));
        long usedAccountCount = groupRepository.countAccounts(group.getId());
        if (usedAccountCount > 0) {
            throw HttpError.conflict("이 권한 그룹이 할당된 계정이 " + usedAccountCount + "개 있어 삭제할 수 없습니다.");
        }
        groupRepository.deleteById(group.getId());
        return ResponseEntity.noContent().build();
    }

    private PermissionGroupEntity findOrThrow(UUID id) {
        return groupRepository.findWithPermissionsById(id).orElseThrow(() -> HttpError.notFound("권한 그룹"));
    }

    private LinkedHashSet<PermissionEntity> findPermissionsOrThrow(List<String> permissionIds) {
        List<UUID> ids = permissionIds.stream().map(UUID::fromString).toList();
        List<PermissionEntity> permissions = permissionRepository.findAllById(ids);
        if (permissions.size() != new HashSet<>(ids).size()) {
            throw HttpError.validation("존재하지 않는 권한이 포함되어 있습니다.");
        }
        return new LinkedHashSet<>(permissions);
    }

    private static PermissionGroupDetailResponse toDetail(PermissionGroupEntity group) {
        List<PermissionResponse> permissions = group.getPermissions().stream()
                .sorted(Comparator.comparing(PermissionEntity::getCreatedAt))
                .map(PermissionResponse::of)
                .toList();
        return new PermissionGroupDetailResponse(
                group.getId().toString(),
                group.getName(),
                permissions.size(),
                IsoTimes.format(group.getCreatedAt()),
                IsoTimes.format(group.getUpdatedAt()),
                permissions);
    }
}
