package com.fms.api.routes.admin.accesspolicygroups;

import com.fms.api.commons.ValidationErrors;
import com.fms.api.commons.ValidationIssue;
import com.fms.consts.AccessPolicyTreeMaxDepth;
import com.fms.serverutils.networks.IpParser;
import com.fms.types.accesspolicies.AccessPolicyGroupNode;
import com.fms.types.accesspolicies.AccessPolicyGroupOperator;
import com.fms.types.accesspolicies.AccessPolicyHeaderMatchType;
import com.fms.types.accesspolicies.AccessPolicyHeaderNode;
import com.fms.types.accesspolicies.AccessPolicyIpMode;
import com.fms.types.accesspolicies.AccessPolicyIpNode;
import com.fms.types.accesspolicies.AccessPolicyNode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import tools.jackson.databind.JsonNode;

/**
 * 요청 본문의 접근 정책 조건 트리를 검증하며 {@link AccessPolicyNode} 로 바꾼다. IP · CIDR 과 헤더 이름은 앞뒤 공백을 지우고(헤더 값은 그대로 둔다), 모르는 필드는 버린다.
 * 실패하면 원본(zod)과 같은 경로({@code ruleTree.children.0.cidrs.1})로 400 을 던진다.
 */
final class AccessPolicyTreeParser {
    private static final Pattern HEADER_NAME_PATTERN = Pattern.compile("^[A-Za-z0-9-]+$");

    private final List<ValidationIssue> issues = new ArrayList<>();

    private AccessPolicyTreeParser() {}

    /** {@code null} 이면 제한 없음 */
    static AccessPolicyNode parse(JsonNode node, String path) {
        if (node == null || node.isNull()) {
            return null;
        }
        AccessPolicyTreeParser parser = new AccessPolicyTreeParser();
        AccessPolicyNode tree = parser.parseNode(node, path);
        if (parser.issues.isEmpty() && readDepth(tree) > AccessPolicyTreeMaxDepth.ACCESS_POLICY_TREE_MAX_DEPTH) {
            parser.issues.add(new ValidationIssue(
                    path, "조건은 최대 " + AccessPolicyTreeMaxDepth.ACCESS_POLICY_TREE_MAX_DEPTH + "단계까지 중첩할 수 있습니다."));
        }
        if (!parser.issues.isEmpty()) {
            throw ValidationErrors.of(parser.issues);
        }
        return tree;
    }

    private AccessPolicyNode parseNode(JsonNode node, String path) {
        if (!node.isObject()) {
            return fail(path, "조건 형식이 올바르지 않습니다.");
        }
        String type = node.path("type").isString() ? node.get("type").asString() : "";
        return switch (type) {
            case AccessPolicyIpNode.TYPE -> parseIpNode(node, path);
            case AccessPolicyHeaderNode.TYPE -> parseHeaderNode(node, path);
            case AccessPolicyGroupNode.TYPE -> parseGroupNode(node, path);
            default -> fail(join(path, "type"), "알 수 없는 조건 종류입니다.");
        };
    }

    private AccessPolicyNode parseIpNode(JsonNode node, String path) {
        AccessPolicyIpMode mode = readEnum(node, path, "mode", AccessPolicyIpMode.class);
        JsonNode cidrsNode = node.get("cidrs");
        if (cidrsNode == null || !cidrsNode.isArray()) {
            return fail(join(path, "cidrs"), "IP 또는 CIDR 목록이 필요합니다.");
        }
        List<String> cidrs = new ArrayList<>();
        for (int i = 0; i < cidrsNode.size(); i++) {
            JsonNode item = cidrsNode.get(i);
            String cidr = item.isString() ? item.asString().strip() : null;
            if (cidr == null || !isCidrFormat(cidr)) {
                issues.add(new ValidationIssue(join(path, "cidrs." + i), "IP 또는 CIDR 형식이 아닙니다."));
            }
            cidrs.add(cidr);
        }
        return new AccessPolicyIpNode(AccessPolicyIpNode.TYPE, mode, cidrs);
    }

    private AccessPolicyNode parseHeaderNode(JsonNode node, String path) {
        String name = node.path("name").isString() ? node.get("name").asString().strip() : null;
        if (name == null || !HEADER_NAME_PATTERN.matcher(name).matches()) {
            issues.add(new ValidationIssue(join(path, "name"), "헤더명은 영문 · 숫자 · `-` 만 쓸 수 있습니다."));
        }
        AccessPolicyHeaderMatchType matchType = readEnum(node, path, "matchType", AccessPolicyHeaderMatchType.class);
        JsonNode valueNode = node.get("value");
        if (valueNode != null && !valueNode.isMissingNode() && !valueNode.isString()) {
            issues.add(new ValidationIssue(join(path, "value"), "값의 형식이 올바르지 않습니다."));
        }
        String value = valueNode != null && valueNode.isString() ? valueNode.asString() : null;
        if (matchType != null
                && matchType != AccessPolicyHeaderMatchType.EXISTS
                && (value == null || value.isEmpty())) {
            issues.add(new ValidationIssue(path, "값을 입력하세요."));
        } else if (matchType == AccessPolicyHeaderMatchType.REGEX && !isRegexFormat(value == null ? "" : value)) {
            issues.add(new ValidationIssue(path, "정규식 형식이 아닙니다."));
        }
        return new AccessPolicyHeaderNode(AccessPolicyHeaderNode.TYPE, name, matchType, value);
    }

    private AccessPolicyNode parseGroupNode(JsonNode node, String path) {
        AccessPolicyGroupOperator operator = readEnum(node, path, "operator", AccessPolicyGroupOperator.class);
        JsonNode childrenNode = node.get("children");
        if (childrenNode == null || !childrenNode.isArray()) {
            return fail(join(path, "children"), "그룹에는 조건이 1개 이상 있어야 합니다.");
        }
        if (childrenNode.isEmpty()) {
            issues.add(new ValidationIssue(join(path, "children"), "그룹에는 조건이 1개 이상 있어야 합니다."));
        }
        List<AccessPolicyNode> children = new ArrayList<>();
        for (int i = 0; i < childrenNode.size(); i++) {
            children.add(parseNode(childrenNode.get(i), join(path, "children." + i)));
        }
        return new AccessPolicyGroupNode(AccessPolicyGroupNode.TYPE, operator, children);
    }

    private <E extends Enum<E>> E readEnum(JsonNode node, String path, String field, Class<E> type) {
        JsonNode value = node.get(field);
        if (value != null && value.isString()) {
            for (E constant : type.getEnumConstants()) {
                if (constant.name().equals(value.asString())) {
                    return constant;
                }
            }
        }
        issues.add(new ValidationIssue(
                join(path, field),
                Arrays.stream(type.getEnumConstants()).map(Enum::name).toList() + " 중 하나여야 합니다."));
        return null;
    }

    private AccessPolicyNode fail(String path, String message) {
        issues.add(new ValidationIssue(path, message));
        return null;
    }

    private static String join(String path, String field) {
        return path.isEmpty() ? field : path + "." + field;
    }

    private static int readDepth(AccessPolicyNode node) {
        if (!(node instanceof AccessPolicyGroupNode group)) {
            return 1;
        }
        return 1
                + group.children().stream()
                        .mapToInt(AccessPolicyTreeParser::readDepth)
                        .max()
                        .orElse(0);
    }

    /** 원본과 같은 판정 : {@code IP} 또는 {@code IP/접두 길이}. 접두 길이는 JS {@code Number()} 처럼 해석한다. */
    static boolean isCidrFormat(String value) {
        String[] parts = value.strip().split("/", -1);
        int version = IpParser.readIpVersion(parts[0]);
        if (version == 0) {
            return false;
        }
        if (parts.length == 1) {
            return true;
        }
        String prefix = parts[1].strip();
        if (prefix.isEmpty()) {
            return true;
        }
        if (!prefix.matches("^[+-]?(\\d+\\.?\\d*|\\.\\d+)$")) {
            return false;
        }
        java.math.BigDecimal number = new java.math.BigDecimal(prefix);
        boolean isInteger = number.stripTrailingZeros().scale() <= 0;
        return isInteger
                && number.signum() >= 0
                && number.compareTo(java.math.BigDecimal.valueOf(version == 4 ? 32 : 128)) <= 0;
    }

    private static boolean isRegexFormat(String value) {
        try {
            Pattern.compile(value);
            return true;
        } catch (PatternSyntaxException e) {
            return false;
        }
    }
}
