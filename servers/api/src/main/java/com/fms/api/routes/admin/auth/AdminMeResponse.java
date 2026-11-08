package com.fms.api.routes.admin.auth;

import java.util.List;

record AdminMeResponse(
        String id,
        String loginId,
        String nickname,
        String permissionGroupName,
        String accessPolicyGroupName,
        List<String> permissionCodes) {}
