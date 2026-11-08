package com.fms.api.domains.accesspolicy;

import com.fms.api.commons.HttpError;
import com.fms.api.commons.IsoTimes;
import com.fms.consts.ApiErrorCode;
import com.fms.entities.AccessPolicyGroupEntity;
import com.fms.entities.AdminAccountEntity;
import com.fms.serverutils.accesspolicies.AccessPolicyEvaluator;
import com.fms.serverutils.accesspolicies.AccessPolicyRequest;
import com.fms.serverutils.accesspolicies.AccessPolicyResult;
import com.fms.types.errors.AccessPolicyDeniedDetails;
import jakarta.servlet.http.HttpServletRequest;

public final class AccessPolicyGuard {
    private AccessPolicyGuard() {}

    /** 접근 정책을 통과하지 못하면 차단 화면에 쓸 정보를 담아 403 을 던진다. {@code account} 는 없을 수 있다. */
    public static void assertAccessPolicy(
            HttpServletRequest request, AccessPolicyGroupEntity group, AdminAccountEntity account) {
        AccessPolicyRequest policyRequest = AccessPolicyRequests.read(request);
        AccessPolicyResult result = AccessPolicyEvaluator.evaluate(group.getRuleTree(), policyRequest);
        if (result.isAllowed()) {
            return;
        }
        AccessPolicyDeniedDetails details = new AccessPolicyDeniedDetails(
                account == null ? null : account.getLoginId(),
                account == null ? null : account.getNickname(),
                group.getName(),
                result.failedReasons(),
                policyRequest.ip(),
                IsoTimes.now());
        throw new HttpError(403, ApiErrorCode.ACCESS_POLICY_DENIED, "접근 정책에 의해 차단되었습니다.", details);
    }
}
