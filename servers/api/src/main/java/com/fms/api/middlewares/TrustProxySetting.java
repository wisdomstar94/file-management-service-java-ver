package com.fms.api.middlewares;

import com.fms.serverutils.networks.IpCidr;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * {@code API_TRUST_PROXY} 해석. Express {@code trust proxy}(proxy-addr) 와 같은 규칙이다.
 *
 * <ul>
 *   <li>빈 값 : 프록시를 신뢰하지 않는다. (직접 연결된 IP)
 *   <li>숫자 : 직접 연결된 쪽부터 그 수만큼의 홉을 신뢰한다.
 *   <li>그 외 : {@code loopback, 10.0.0.0/8} 처럼 신뢰할 주소 · 대역 · 키워드(loopback · linklocal · uniquelocal) 목록
 * </ul>
 */
final class TrustProxySetting {
    private static final List<String> LOOPBACK = List.of("127.0.0.1/8", "::1/128");
    private static final List<String> LINKLOCAL = List.of("169.254.0.0/16", "fe80::/10");
    private static final List<String> UNIQUELOCAL =
            List.of("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "fc00::/7");

    private final Integer hops;
    private final List<String> trustedRanges;

    private TrustProxySetting(Integer hops, List<String> trustedRanges) {
        this.hops = hops;
        this.trustedRanges = trustedRanges;
    }

    static TrustProxySetting parse(String value) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            return new TrustProxySetting(0, List.of());
        }
        if (trimmed.matches("^\\d+$")) {
            return new TrustProxySetting(Integer.parseInt(trimmed), List.of());
        }
        List<String> ranges = new ArrayList<>();
        for (String item : trimmed.split(",")) {
            String entry = item.trim();
            switch (entry) {
                case "" -> {}
                case "loopback" -> ranges.addAll(LOOPBACK);
                case "linklocal" -> ranges.addAll(LINKLOCAL);
                case "uniquelocal" -> ranges.addAll(UNIQUELOCAL);
                default -> ranges.add(entry);
            }
        }
        return new TrustProxySetting(null, List.copyOf(ranges));
    }

    /**
     * 직접 연결된 주소부터 {@code X-Forwarded-For} 를 오른쪽에서 왼쪽으로 따라가며, 처음으로 신뢰하지 않는 주소를 요청 IP 로 쓴다.
     * 모두 신뢰하면 가장 왼쪽 주소다.
     */
    String resolveClientIp(String socketAddress, String forwardedFor) {
        List<String> addresses = new ArrayList<>();
        addresses.add(socketAddress);
        if (forwardedFor != null) {
            List<String> forwarded = new ArrayList<>(Arrays.stream(forwardedFor.split(","))
                    .map(String::trim)
                    .filter(address -> !address.isEmpty())
                    .toList());
            for (int i = forwarded.size() - 1; i >= 0; i--) {
                addresses.add(forwarded.get(i));
            }
        }
        for (int i = 0; i < addresses.size() - 1; i++) {
            if (!isTrusted(addresses.get(i), i)) {
                return addresses.get(i);
            }
        }
        return addresses.getLast();
    }

    private boolean isTrusted(String address, int index) {
        if (hops != null) {
            return index < hops;
        }
        return trustedRanges.stream().anyMatch(range -> IpCidr.isIpInCidr(address, range));
    }
}
