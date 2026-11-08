package com.fms.api.routes.admin.accesspolicygroups;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.UuidParams;
import com.fms.api.commons.ValidationErrors;
import com.fms.api.domains.adminauth.RequirePermission;
import com.fms.consts.PermissionCode;
import com.fms.entities.AccessPolicyGroupEntity;
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

/** /api/admin/access-policy-groups/** */
@RestController
@RequestMapping("/api/admin/access-policy-groups")
@RequiredArgsConstructor
public class AccessPolicyGroupsController {
    private final AccessPolicyGroupQueryRepository groupRepository;

    @GetMapping
    @RequirePermission(PermissionCode.POLICY_ACCESS)
    ApiResponse<List<AccessPolicyGroupSummaryResponse>> list() {
        return ApiResponse.of(groupRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(AccessPolicyGroupSummaryResponse::of)
                .toList());
    }

    @PostMapping
    @RequirePermission(PermissionCode.POLICY_CREATE)
    ResponseEntity<ApiResponse<AccessPolicyGroupDetailResponse>> create(
            @RequestBody(required = false) JsonNode rawBody) {
        String name = readName(rawBody, true);
        if (!rawBody.has("ruleTree")) {
            throw ValidationErrors.of("ruleTree", "값을 입력하세요.");
        }
        AccessPolicyGroupEntity group = new AccessPolicyGroupEntity();
        group.setName(name);
        group.setRuleTree(AccessPolicyTreeParser.parse(rawBody.get("ruleTree"), "ruleTree"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(toDetail(groupRepository.saveAndFlush(group))));
    }

    @GetMapping("/{id}")
    @RequirePermission(PermissionCode.POLICY_ACCESS)
    ApiResponse<AccessPolicyGroupDetailResponse> detail(@PathVariable String id) {
        return ApiResponse.of(toDetail(findOrThrow(UuidParams.read(id))));
    }

    @PatchMapping("/{id}")
    @RequirePermission(PermissionCode.POLICY_UPDATE)
    ApiResponse<AccessPolicyGroupDetailResponse> update(
            @PathVariable String id, @RequestBody(required = false) JsonNode rawBody) {
        AccessPolicyGroupEntity group = findOrThrow(UuidParams.read(id));
        String name = readName(rawBody, false);
        if (name != null) {
            group.setName(name);
        }
        if (rawBody.has("ruleTree")) {
            group.setRuleTree(AccessPolicyTreeParser.parse(rawBody.get("ruleTree"), "ruleTree"));
        }
        return ApiResponse.of(toDetail(groupRepository.saveAndFlush(group)));
    }

    @DeleteMapping("/{id}")
    @RequirePermission(PermissionCode.POLICY_DELETE)
    ResponseEntity<Void> delete(@PathVariable String id) {
        AccessPolicyGroupEntity group = findOrThrow(UuidParams.read(id));
        long usedAccountCount = groupRepository.countAccounts(group.getId());
        long usedShareLinkCount = groupRepository.countShareLinks(group.getId());
        if (usedAccountCount + usedShareLinkCount > 0) {
            throw HttpError.conflict(
                    "이 접근 정책 그룹을 쓰는 계정 " + usedAccountCount + "개 · 공개 링크 " + usedShareLinkCount + "개가 있어 삭제할 수 없습니다.");
        }
        groupRepository.deleteById(group.getId());
        return ResponseEntity.noContent().build();
    }

    /** 생성은 필수, 수정은 생략 가능. 앞뒤 공백을 지운 1~100자 */
    private static String readName(JsonNode rawBody, boolean isRequired) {
        if (rawBody == null || !rawBody.isObject()) {
            throw ValidationErrors.of("", "요청 본문이 올바른 JSON 객체가 아닙니다.");
        }
        JsonNode nameNode = rawBody.get("name");
        if (nameNode == null && !isRequired) {
            return null;
        }
        String name =
                nameNode != null && nameNode.isString() ? nameNode.asString().strip() : null;
        if (name == null || name.isEmpty()) {
            throw ValidationErrors.of("name", "접근 정책 그룹명을 입력하세요.");
        }
        if (name.length() > 100) {
            throw ValidationErrors.of("name", "100자 이하로 입력하세요.");
        }
        return name;
    }

    private AccessPolicyGroupEntity findOrThrow(UUID id) {
        return groupRepository.findById(id).orElseThrow(() -> HttpError.notFound("접근 정책 그룹"));
    }

    private AccessPolicyGroupDetailResponse toDetail(AccessPolicyGroupEntity group) {
        return new AccessPolicyGroupDetailResponse(
                group.getId().toString(),
                group.getName(),
                AccessPolicyGroupSummaryResponse.of(group).createdAt(),
                AccessPolicyGroupSummaryResponse.of(group).updatedAt(),
                group.getRuleTree(),
                groupRepository.countAccounts(group.getId()),
                groupRepository.countShareLinks(group.getId()));
    }
}
