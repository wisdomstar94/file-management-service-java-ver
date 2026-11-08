package com.fms.api.domains.adminauth;

import com.fms.entities.AccessPolicyGroupEntity;
import com.fms.entities.AdminAccountEntity;
import com.fms.entities.PermissionGroupEntity;
import java.util.Set;

/** 인증을 통과한 요청의 관리자 정보 (원본 {@code req.admin}) */
public record AdminContext(
        AdminAccountEntity account,
        PermissionGroupEntity permissionGroup,
        AccessPolicyGroupEntity accessPolicyGroup,
        Set<String> permissionCodes) {}
