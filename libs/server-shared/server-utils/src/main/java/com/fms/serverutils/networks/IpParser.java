package com.fms.serverutils.networks;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * IP 문자열을 판정 · 변환한다. DNS 조회가 일어나는 {@link java.net.InetAddress} 대신 문자열만 해석한다.
 * 판정 기준은 원본(Node.js {@code net.isIP})과 같다.
 */
public final class IpParser {
    private static final String IPV4_OCTET = "(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)";
    private static final Pattern IPV4_PATTERN = Pattern.compile("^" + IPV4_OCTET + "(\\." + IPV4_OCTET + "){3}$");
    private static final Pattern IPV6_GROUP_PATTERN = Pattern.compile("^[0-9a-fA-F]{1,4}$");
    private static final BigInteger IPV4_MAPPED_PREFIX = BigInteger.valueOf(0xffff);
    private static final BigInteger LOW_32_BITS = BigInteger.ONE.shiftLeft(32).subtract(BigInteger.ONE);

    private IpParser() {}

    /** 올바른 IPv4 면 4, IPv6 면 6, 아니면 0 */
    public static int readIpVersion(String ip) {
        if (ip == null) {
            return 0;
        }
        if (IPV4_PATTERN.matcher(ip).matches()) {
            return 4;
        }
        return isIpv6(ip) ? 6 : 0;
    }

    /** IPv4-mapped IPv6({@code ::ffff:1.2.3.4})는 IPv4 로 취급한다. 올바른 IP 가 아니면 빈 값이다. */
    public static Optional<ParsedIp> parse(String ip) {
        int version = readIpVersion(ip);
        if (version == 4) {
            return Optional.of(new ParsedIp(4, parseIpv4(ip)));
        }
        if (version != 6) {
            return Optional.empty();
        }
        BigInteger value = parseIpv6(stripZone(ip));
        if (value.shiftRight(32).equals(IPV4_MAPPED_PREFIX)) {
            return Optional.of(new ParsedIp(4, value.and(LOW_32_BITS)));
        }
        return Optional.of(new ParsedIp(6, value));
    }

    private static boolean isIpv6(String rawIp) {
        String ip = stripZone(rawIp);
        if (ip.isEmpty() || !ip.contains(":")) {
            return false;
        }
        int doubleColon = ip.indexOf("::");
        if (doubleColon != ip.lastIndexOf("::")) {
            return false;
        }
        List<String> groups = new ArrayList<>();
        if (doubleColon >= 0) {
            groups.addAll(splitGroups(ip.substring(0, doubleColon)));
            groups.addAll(splitGroups(ip.substring(doubleColon + 2)));
        } else {
            groups.addAll(Arrays.asList(ip.split(":", -1)));
        }
        int groupCount = 0;
        for (int i = 0; i < groups.size(); i++) {
            String group = groups.get(i);
            boolean isLast = i == groups.size() - 1;
            if (isLast && group.contains(".")) {
                if (!IPV4_PATTERN.matcher(group).matches()) {
                    return false;
                }
                groupCount += 2;
            } else if (IPV6_GROUP_PATTERN.matcher(group).matches()) {
                groupCount += 1;
            } else {
                return false;
            }
        }
        return doubleColon >= 0 ? groupCount <= 7 : groupCount == 8;
    }

    private static List<String> splitGroups(String part) {
        return part.isEmpty() ? List.of() : Arrays.asList(part.split(":", -1));
    }

    private static String stripZone(String ip) {
        int zone = ip.indexOf('%');
        return zone >= 0 && zone < ip.length() - 1 ? ip.substring(0, zone) : ip;
    }

    private static BigInteger parseIpv4(String ip) {
        BigInteger value = BigInteger.ZERO;
        for (String octet : ip.split("\\.")) {
            value = value.shiftLeft(8).add(BigInteger.valueOf(Integer.parseInt(octet)));
        }
        return value;
    }

    private static BigInteger parseIpv6(String ip) {
        int doubleColon = ip.indexOf("::");
        List<String> head = new ArrayList<>(splitGroups(doubleColon >= 0 ? ip.substring(0, doubleColon) : ip));
        List<String> tail = new ArrayList<>(doubleColon >= 0 ? splitGroups(ip.substring(doubleColon + 2)) : List.of());

        List<String> lastGroupOwner = tail.isEmpty() ? head : tail;
        List<String> embeddedIpv4Groups = new ArrayList<>();
        if (!lastGroupOwner.isEmpty() && lastGroupOwner.getLast().contains(".")) {
            BigInteger v4 = parseIpv4(lastGroupOwner.removeLast());
            embeddedIpv4Groups.add(v4.shiftRight(16).toString(16));
            embeddedIpv4Groups.add(v4.and(BigInteger.valueOf(0xffff)).toString(16));
        }

        List<String> groups = new ArrayList<>(head);
        int zeroFillCount = doubleColon >= 0 ? 8 - head.size() - tail.size() - embeddedIpv4Groups.size() : 0;
        for (int i = 0; i < zeroFillCount; i++) {
            groups.add("0");
        }
        groups.addAll(tail);
        groups.addAll(embeddedIpv4Groups);

        BigInteger value = BigInteger.ZERO;
        for (String group : groups) {
            value = value.shiftLeft(16).add(new BigInteger(group, 16));
        }
        return value;
    }
}
