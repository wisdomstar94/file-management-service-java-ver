package com.fms.serverutils.accesspolicies;

import static org.assertj.core.api.Assertions.assertThat;

import com.fms.types.accesspolicies.AccessPolicyGroupNode;
import com.fms.types.accesspolicies.AccessPolicyGroupOperator;
import com.fms.types.accesspolicies.AccessPolicyHeaderMatchType;
import com.fms.types.accesspolicies.AccessPolicyHeaderNode;
import com.fms.types.accesspolicies.AccessPolicyIpMode;
import com.fms.types.accesspolicies.AccessPolicyIpNode;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AccessPolicyEvaluatorTest {
    private static final AccessPolicyIpNode ALLOW_OFFICE =
            new AccessPolicyIpNode("IP", AccessPolicyIpMode.DENY_ALL_EXCEPT, List.of("10.0.0.0/8"));
    private static final AccessPolicyHeaderNode TOKEN_HEADER =
            new AccessPolicyHeaderNode("HEADER", "X-Token", AccessPolicyHeaderMatchType.EQUALS, "secret");

    private static AccessPolicyRequest request(String ip, Map<String, List<String>> headers) {
        return new AccessPolicyRequest(ip, headers);
    }

    @Test
    void nullTreeAllowsAll() {
        assertThat(AccessPolicyEvaluator.evaluate(null, request("1.1.1.1", Map.of()))
                        .isAllowed())
                .isTrue();
    }

    @Test
    void andCollectsAllReasons() {
        var tree =
                new AccessPolicyGroupNode("GROUP", AccessPolicyGroupOperator.AND, List.of(ALLOW_OFFICE, TOKEN_HEADER));
        var result = AccessPolicyEvaluator.evaluate(tree, request("1.1.1.1", Map.of()));
        assertThat(result.isAllowed()).isFalse();
        assertThat(result.failedReasons()).containsExactly("IP 제한 · 허용 목록에 없음", "헤더 제한 · X-Token 조건 불일치");
    }

    @Test
    void orPassesWhenAnyChildPasses() {
        var tree =
                new AccessPolicyGroupNode("GROUP", AccessPolicyGroupOperator.OR, List.of(ALLOW_OFFICE, TOKEN_HEADER));
        var result = AccessPolicyEvaluator.evaluate(tree, request("1.1.1.1", Map.of("x-token", List.of("secret"))));
        assertThat(result.isAllowed()).isTrue();
    }

    @Test
    void regexAndExists() {
        var regex = new AccessPolicyHeaderNode("HEADER", "User-Agent", AccessPolicyHeaderMatchType.REGEX, "^Mozilla");
        var exists = new AccessPolicyHeaderNode("HEADER", "X-A", AccessPolicyHeaderMatchType.EXISTS, null);
        var badRegex = new AccessPolicyHeaderNode("HEADER", "X-A", AccessPolicyHeaderMatchType.REGEX, "(");
        var headers = Map.of("user-agent", List.of("Mozilla/5.0"), "x-a", List.of(""));
        assertThat(AccessPolicyEvaluator.evaluate(regex, request("::1", headers))
                        .isAllowed())
                .isTrue();
        assertThat(AccessPolicyEvaluator.evaluate(exists, request("::1", headers))
                        .isAllowed())
                .isTrue();
        assertThat(AccessPolicyEvaluator.evaluate(badRegex, request("::1", headers))
                        .isAllowed())
                .isFalse();
    }
}
