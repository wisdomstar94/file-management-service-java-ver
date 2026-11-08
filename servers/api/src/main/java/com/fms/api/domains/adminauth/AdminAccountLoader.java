package com.fms.api.domains.adminauth;

import com.fms.entities.AdminAccountEntity;
import com.fms.entities.PermissionEntity;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 관리자 계정을 권한 그룹(+권한) · 접근 정책 그룹과 함께 읽는다. */
@Component
@RequiredArgsConstructor
public class AdminAccountLoader {
    private final AdminAccountQueryRepository repository;

    @Transactional(readOnly = true)
    public Optional<AdminContext> load(UUID adminAccountId) {
        return repository
                .findWithGroupsById(adminAccountId)
                .filter(account -> account.getPermissionGroup() != null && account.getAccessPolicyGroup() != null)
                .map(AdminAccountLoader::toContext);
    }

    private static AdminContext toContext(AdminAccountEntity account) {
        return new AdminContext(
                account,
                account.getPermissionGroup(),
                account.getAccessPolicyGroup(),
                account.getPermissionGroup().getPermissions().stream()
                        .map(PermissionEntity::getCode)
                        .collect(Collectors.toUnmodifiableSet()));
    }
}
