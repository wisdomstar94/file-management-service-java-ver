package com.fms.databasemanager.seed;

import com.fms.consts.PermissionCode;
import com.fms.entities.AccessPolicyGroupEntity;
import com.fms.entities.AccessPolicyGroupRepository;
import com.fms.entities.AdminAccountEntity;
import com.fms.entities.AdminAccountRepository;
import com.fms.entities.PermissionEntity;
import com.fms.entities.PermissionGroupEntity;
import com.fms.entities.PermissionGroupRepository;
import com.fms.entities.PermissionRepository;
import com.fms.passwordhandler.PasswordHandler;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 기본 데이터. 모든 단계가 "없을 때만 만든다" 라서 여러 번 실행해도 안전하다. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeedService {
    static final String DEFAULT_PERMISSION_GROUP_NAME = "최고 관리자";
    static final String DEFAULT_ACCESS_POLICY_GROUP_NAME = "전체 허용";
    private static final Sort OLDEST_FIRST = Sort.by(Sort.Direction.ASC, "createdAt");

    private final PermissionRepository permissionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final AccessPolicyGroupRepository accessPolicyGroupRepository;
    private final AdminAccountRepository adminAccountRepository;
    private final SeedEnv seedEnv;

    @Transactional
    public void runSeed() {
        int addedPermissionCount = seedPermissions();
        PermissionGroupEntity permissionGroup = seedDefaultPermissionGroup();
        AccessPolicyGroupEntity accessPolicyGroup = seedDefaultAccessPolicyGroup();
        String initialAdmin = seedInitialAdmin(permissionGroup, accessPolicyGroup);
        log.info("[seed] 권한 {}건 추가 · 최초 관리자 {}", addedPermissionCount, initialAdmin);
    }

    /** 코드 레지스트리에 있는데 DB 에 없는 권한만 추가한다. 관리자가 고친 이름은 덮어쓰지 않는다. */
    private int seedPermissions() {
        Set<String> existingCodes = permissionRepository.findAll().stream()
                .map(PermissionEntity::getCode)
                .collect(Collectors.toSet());
        List<PermissionEntity> missing = Arrays.stream(PermissionCode.values())
                .filter(code -> !existingCodes.contains(code.code()))
                .map(code -> {
                    PermissionEntity permission = new PermissionEntity();
                    permission.setCode(code.code());
                    permission.setCategory(code.seedCategory());
                    permission.setName(code.seedName());
                    return permission;
                })
                .toList();
        permissionRepository.saveAll(missing);
        return missing.size();
    }

    /** 권한 그룹이 하나도 없을 때만 모든 권한을 가진 기본 그룹을 만든다. */
    private PermissionGroupEntity seedDefaultPermissionGroup() {
        return permissionGroupRepository.findAll(OLDEST_FIRST).stream()
                .findFirst()
                .orElseGet(() -> {
                    PermissionGroupEntity group = new PermissionGroupEntity();
                    group.setName(DEFAULT_PERMISSION_GROUP_NAME);
                    group.setPermissions(new LinkedHashSet<>(permissionRepository.findAll()));
                    return permissionGroupRepository.save(group);
                });
    }

    /** 접근 정책 그룹이 하나도 없을 때만 제한 없는 기본 그룹을 만든다. */
    private AccessPolicyGroupEntity seedDefaultAccessPolicyGroup() {
        return accessPolicyGroupRepository.findAll(OLDEST_FIRST).stream()
                .findFirst()
                .orElseGet(() -> {
                    AccessPolicyGroupEntity group = new AccessPolicyGroupEntity();
                    group.setName(DEFAULT_ACCESS_POLICY_GROUP_NAME);
                    group.setRuleTree(null);
                    return accessPolicyGroupRepository.save(group);
                });
    }

    /**
     * {@code INITIAL_ADMIN_ID} · {@code INITIAL_ADMIN_PASSWORD} 가 설정돼 있고 같은 아이디의 계정이 없을 때만 최초 관리자를
     * 만든다. 이미 있으면 비밀번호를 바꾸지 않는다.
     */
    private String seedInitialAdmin(PermissionGroupEntity permissionGroup, AccessPolicyGroupEntity accessPolicyGroup) {
        String loginId = seedEnv.initialAdminId();
        String password = seedEnv.initialAdminPassword();
        if (isBlank(loginId) || isBlank(password)) {
            return "skipped";
        }
        if (adminAccountRepository.existsByLoginId(loginId)) {
            return "exists";
        }
        AdminAccountEntity admin = new AdminAccountEntity();
        admin.setLoginId(loginId);
        admin.setPasswordHash(PasswordHandler.hashPassword(password));
        admin.setNickname(isBlank(seedEnv.initialAdminNickname()) ? "최초 관리자" : seedEnv.initialAdminNickname());
        admin.setPermissionGroupId(permissionGroup.getId());
        admin.setAccessPolicyGroupId(accessPolicyGroup.getId());
        adminAccountRepository.save(admin);
        return "created";
    }

    private static boolean isBlank(String value) {
        return value == null || value.isEmpty();
    }
}
