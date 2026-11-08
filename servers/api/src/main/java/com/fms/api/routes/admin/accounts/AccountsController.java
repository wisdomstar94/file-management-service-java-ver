package com.fms.api.routes.admin.accounts;

import com.fms.api.commons.ApiResponse;
import com.fms.api.commons.HttpError;
import com.fms.api.commons.IdName;
import com.fms.api.commons.PaginationQuery;
import com.fms.api.commons.RequestBodies;
import com.fms.api.commons.UuidParams;
import com.fms.api.commons.ValidationErrors;
import com.fms.api.domains.adminauth.AdminContexts;
import com.fms.api.domains.adminauth.RequirePermission;
import com.fms.consts.PermissionCode;
import com.fms.entities.AccessPolicyGroupRepository;
import com.fms.entities.AdminAccountEntity;
import com.fms.entities.PermissionGroupRepository;
import com.fms.passwordhandler.PasswordHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

/** /api/admin/accounts/** */
@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
public class AccountsController {
    private static final Sort OLDEST_FIRST = Sort.by(Sort.Direction.ASC, "createdAt");

    private final AccountQueryRepository accountRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final AccessPolicyGroupRepository accessPolicyGroupRepository;
    private final RequestBodies requestBodies;

    @GetMapping
    @RequirePermission(PermissionCode.ACCOUNT_ACCESS)
    ApiResponse<AdminAccountListResponse> list(@Valid @ModelAttribute PaginationQuery query) {
        Page<AdminAccountEntity> page = accountRepository.findPageWithGroups(
                PageRequest.of(query.page() - 1, query.size(), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ApiResponse.of(new AdminAccountListResponse(
                page.getContent().stream().map(AdminAccountResponse::of).toList(),
                page.getTotalElements(),
                query.page(),
                query.size()));
    }

    @PostMapping
    @RequirePermission(PermissionCode.ACCOUNT_CREATE)
    ResponseEntity<ApiResponse<AdminAccountResponse>> create(@RequestBody(required = false) JsonNode rawBody) {
        AdminAccountRequest body = requestBodies.parse(rawBody, AdminAccountRequest.class);
        List<String> missing = new ArrayList<>();
        if (body.loginId() == null) missing.add("loginId");
        if (body.password() == null) missing.add("password");
        if (body.nickname() == null) missing.add("nickname");
        if (body.permissionGroupId() == null) missing.add("permissionGroupId");
        if (body.accessPolicyGroupId() == null) missing.add("accessPolicyGroupId");
        if (!missing.isEmpty()) {
            throw ValidationErrors.of(missing.getFirst(), "값을 입력하세요.");
        }
        assertAssignableGroups(body);
        if (accountRepository.existsByLoginId(body.loginId())) {
            throw HttpError.conflict("이미 사용 중인 아이디입니다.");
        }

        AdminAccountEntity account = new AdminAccountEntity();
        account.setLoginId(body.loginId());
        account.setPasswordHash(PasswordHandler.hashPassword(body.password()));
        account.setNickname(body.nickname());
        account.setMemo(body.memo());
        account.setPermissionGroupId(UUID.fromString(body.permissionGroupId()));
        account.setAccessPolicyGroupId(UUID.fromString(body.accessPolicyGroupId()));
        AdminAccountEntity saved = accountRepository.saveAndFlush(account);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(AdminAccountResponse.of(findOrThrow(saved.getId()))));
    }

    /** 계정 생성 · 수정 모달의 선택지. 그룹 관리 권한이 없어도 이름은 볼 수 있어야 한다. */
    @GetMapping("/assignable-groups")
    @RequirePermission(PermissionCode.ACCOUNT_ACCESS)
    ApiResponse<AssignableGroupsResponse> assignableGroups() {
        return ApiResponse.of(new AssignableGroupsResponse(
                permissionGroupRepository.findAll(OLDEST_FIRST).stream()
                        .map(group -> new IdName(group.getId().toString(), group.getName()))
                        .toList(),
                accessPolicyGroupRepository.findAll(OLDEST_FIRST).stream()
                        .map(group -> new IdName(group.getId().toString(), group.getName()))
                        .toList()));
    }

    @GetMapping("/{id}")
    @RequirePermission(PermissionCode.ACCOUNT_ACCESS)
    ApiResponse<AdminAccountResponse> detail(@PathVariable String id) {
        return ApiResponse.of(AdminAccountResponse.of(findOrThrow(UuidParams.read(id))));
    }

    @PatchMapping("/{id}")
    @RequirePermission(PermissionCode.ACCOUNT_UPDATE)
    ApiResponse<AdminAccountResponse> update(@PathVariable String id, @RequestBody(required = false) JsonNode rawBody) {
        UUID accountId = UuidParams.read(id);
        AdminAccountRequest body = requestBodies.parse(rawBody, AdminAccountRequest.class);
        requestBodies.rejectNulls(rawBody, "password", "nickname", "memo", "permissionGroupId", "accessPolicyGroupId");
        AdminAccountEntity account = findOrThrow(accountId);
        assertAssignableGroups(body);

        // 아이디는 바꾸지 않는다.
        if (body.nickname() != null) {
            account.setNickname(body.nickname());
        }
        account.setMemo(body.memo());
        if (body.permissionGroupId() != null) {
            account.setPermissionGroupId(UUID.fromString(body.permissionGroupId()));
        }
        if (body.accessPolicyGroupId() != null) {
            account.setAccessPolicyGroupId(UUID.fromString(body.accessPolicyGroupId()));
        }
        if (body.password() != null && !body.password().isEmpty()) {
            account.setPasswordHash(PasswordHandler.hashPassword(body.password()));
        }
        accountRepository.saveAndFlush(account);
        return ApiResponse.of(AdminAccountResponse.of(findOrThrow(accountId)));
    }

    @DeleteMapping("/{id}")
    @RequirePermission(PermissionCode.ACCOUNT_DELETE)
    ResponseEntity<Void> delete(@PathVariable String id, HttpServletRequest request) {
        UUID accountId = UuidParams.read(id);
        if (AdminContexts.read(request).account().getId().equals(accountId)) {
            throw HttpError.conflict("로그인한 계정은 삭제할 수 없습니다.");
        }
        findOrThrow(accountId);
        accountRepository.deleteById(accountId);
        return ResponseEntity.noContent().build();
    }

    private AdminAccountEntity findOrThrow(UUID id) {
        return accountRepository.findWithGroupsById(id).orElseThrow(() -> HttpError.notFound("관리자 계정"));
    }

    /** 계정에 지정하려는 권한 그룹 · 접근 정책 그룹이 실제로 있는지 확인한다. */
    private void assertAssignableGroups(AdminAccountRequest body) {
        boolean isMissingPermissionGroup = body.permissionGroupId() != null
                && !permissionGroupRepository.existsById(UUID.fromString(body.permissionGroupId()));
        boolean isMissingAccessPolicyGroup = body.accessPolicyGroupId() != null
                && !accessPolicyGroupRepository.existsById(UUID.fromString(body.accessPolicyGroupId()));
        if (isMissingPermissionGroup || isMissingAccessPolicyGroup) {
            throw HttpError.validation("존재하지 않는 권한 그룹 또는 접근 정책 그룹입니다.");
        }
    }
}
