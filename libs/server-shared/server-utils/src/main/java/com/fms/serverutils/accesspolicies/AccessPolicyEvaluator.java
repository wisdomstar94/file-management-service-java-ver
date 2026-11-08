package com.fms.serverutils.accesspolicies;

import com.fms.serverutils.networks.IpCidr;
import com.fms.types.accesspolicies.AccessPolicyGroupNode;
import com.fms.types.accesspolicies.AccessPolicyGroupOperator;
import com.fms.types.accesspolicies.AccessPolicyHeaderMatchType;
import com.fms.types.accesspolicies.AccessPolicyHeaderNode;
import com.fms.types.accesspolicies.AccessPolicyIpMode;
import com.fms.types.accesspolicies.AccessPolicyIpNode;
import com.fms.types.accesspolicies.AccessPolicyNode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

public final class AccessPolicyEvaluator {
    private AccessPolicyEvaluator() {}

    /**
     * 접근 정책 트리를 요청 IP · 헤더로 평가한다. 트리가 {@code null} 이면 항상 허용한다.
     * 차단되면 {@code failedReasons} 에 통과하지 못한 규칙 설명을 담는다.
     */
    public static AccessPolicyResult evaluate(AccessPolicyNode node, AccessPolicyRequest request) {
        if (node == null) {
            return new AccessPolicyResult(true, List.of());
        }
        List<String> failedReasons = collectFailedReasons(node, request);
        return new AccessPolicyResult(failedReasons.isEmpty(), failedReasons);
    }

    private static List<String> collectFailedReasons(AccessPolicyNode node, AccessPolicyRequest request) {
        return switch (node) {
            case AccessPolicyIpNode ipNode -> optionalReason(evaluateIpNode(ipNode, request.ip()));
            case AccessPolicyHeaderNode headerNode -> optionalReason(evaluateHeaderNode(headerNode, request));
            case AccessPolicyGroupNode groupNode -> collectGroupFailedReasons(groupNode, request);
        };
    }

    private static List<String> collectGroupFailedReasons(AccessPolicyGroupNode node, AccessPolicyRequest request) {
        List<AccessPolicyNode> children = node.children() == null ? List.of() : node.children();
        List<List<String>> childReasons = children.stream()
                .map(child -> collectFailedReasons(child, request))
                .toList();
        List<String> flat = new ArrayList<>();
        childReasons.forEach(flat::addAll);
        if (node.operator() == AccessPolicyGroupOperator.AND) {
            return flat;
        }
        boolean isAnyPassed = childReasons.isEmpty() || childReasons.stream().anyMatch(List::isEmpty);
        return isAnyPassed ? List.of() : flat;
    }

    private static List<String> optionalReason(String reason) {
        return reason == null ? List.of() : List.of(reason);
    }

    private static String evaluateIpNode(AccessPolicyIpNode node, String ip) {
        boolean isListed = node.cidrs().stream().anyMatch(cidr -> IpCidr.isIpInCidr(ip, cidr));
        if (node.mode() == AccessPolicyIpMode.ALLOW_ALL_EXCEPT) {
            return isListed ? "IP 제한 · 차단 목록에 있음" : null;
        }
        return isListed ? null : "IP 제한 · 허용 목록에 없음";
    }

    private static String evaluateHeaderNode(AccessPolicyHeaderNode node, AccessPolicyRequest request) {
        return matchHeader(node, readHeader(request, node.name())) ? null : "헤더 제한 · " + node.name() + " 조건 불일치";
    }

    private static String readHeader(AccessPolicyRequest request, String name) {
        List<String> values = request.headers().get(name.toLowerCase(Locale.ROOT));
        return values == null || values.isEmpty() ? null : String.join(", ", values);
    }

    private static boolean matchHeader(AccessPolicyHeaderNode node, String actual) {
        if (node.matchType() == AccessPolicyHeaderMatchType.EXISTS) {
            return actual != null;
        }
        if (actual == null) {
            return false;
        }
        String expected = node.value() == null ? "" : node.value();
        return switch (node.matchType()) {
            case EQUALS -> actual.equals(node.value());
            case CONTAINS -> actual.contains(expected);
            default -> {
                try {
                    yield Pattern.compile(expected).matcher(actual).find();
                } catch (PatternSyntaxException e) {
                    yield false;
                }
            }
        };
    }
}
