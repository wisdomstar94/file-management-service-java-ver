package com.fms.serverutils.networks;

import java.util.Optional;

public final class IpCidr {
    private IpCidr() {}

    /**
     * {@code ip} 가 {@code cidr}(예: {@code 10.0.0.0/8}, {@code 2001:db8::/32}) 범위에 속하는지 판정한다.
     * 접두 길이가 없으면 단일 IP 로 보고 일치 여부만 비교한다. 형식이 잘못되면 {@code false} 이다.
     */
    public static boolean isIpInCidr(String ip, String cidr) {
        String[] parts = cidr.trim().split("/", -1);
        String rangeIp = parts[0];
        String prefixText = parts.length > 1 ? parts[1] : null;
        Optional<ParsedIp> target = IpParser.parse(ip.trim());
        Optional<ParsedIp> range = IpParser.parse(rangeIp);
        if (target.isEmpty()
                || range.isEmpty()
                || target.get().version() != range.get().version()) {
            return false;
        }

        int totalBits = range.get().version() == 4 ? 32 : 128;
        // IPv4-mapped IPv6 범위(`::ffff:1.2.3.0/120`)는 IPv4 로 바뀌므로 접두 길이에서 앞 96비트를 뺀다.
        int mappedPrefixOffset = range.get().version() == 4 && IpParser.readIpVersion(rangeIp) == 6 ? 96 : 0;
        Integer prefix = prefixText == null ? Integer.valueOf(totalBits) : parsePrefix(prefixText, mappedPrefixOffset);
        if (prefix == null || prefix < 0 || prefix > totalBits) {
            return false;
        }

        int shift = totalBits - prefix;
        return target.get().value().shiftRight(shift).equals(range.get().value().shiftRight(shift));
    }

    /** Number(text) 와 같이 앞뒤 공백 · 빈 문자열(0)을 허용하고, 정수가 아니면 null */
    private static Integer parsePrefix(String prefixText, int offset) {
        String text = prefixText.trim();
        if (text.isEmpty()) {
            return -offset;
        }
        if (!text.matches("^[+-]?\\d+$")) {
            return null;
        }
        try {
            return Integer.parseInt(text) - offset;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
