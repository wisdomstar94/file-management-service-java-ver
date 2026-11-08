package com.fms.api.routes.admin.accounts;

import com.fms.api.commons.IdName;
import com.fms.api.commons.IsoTimes;
import com.fms.entities.AdminAccountEntity;

record AdminAccountResponse(
        String id,
        String loginId,
        String nickname,
        String memo,
        IdName permissionGroup,
        IdName accessPolicyGroup,
        String lastAccessedAt,
        String createdAt,
        String updatedAt) {

    static AdminAccountResponse of(AdminAccountEntity account) {
        return new AdminAccountResponse(
                account.getId().toString(),
                account.getLoginId(),
                account.getNickname(),
                account.getMemo(),
                new IdName(
                        account.getPermissionGroupId().toString(),
                        account.getPermissionGroup() == null
                                ? ""
                                : account.getPermissionGroup().getName()),
                new IdName(
                        account.getAccessPolicyGroupId().toString(),
                        account.getAccessPolicyGroup() == null
                                ? ""
                                : account.getAccessPolicyGroup().getName()),
                IsoTimes.format(account.getLastAccessedAt()),
                IsoTimes.format(account.getCreatedAt()),
                IsoTimes.format(account.getUpdatedAt()));
    }
}
