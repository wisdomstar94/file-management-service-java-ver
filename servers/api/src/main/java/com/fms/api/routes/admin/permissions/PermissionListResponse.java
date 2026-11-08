package com.fms.api.routes.admin.permissions;

import com.fms.api.domains.permission.PermissionResponse;
import java.util.List;

/** @param codeOnlyPermissionCodes 코드 레지스트리에는 있는데 DB 에 아직 없는 권한 코드 (시드 전) */
record PermissionListResponse(List<PermissionResponse> items, List<String> codeOnlyPermissionCodes) {}
