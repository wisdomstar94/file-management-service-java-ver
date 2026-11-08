package com.fms.serverutils.networks;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class IpCidrTest {
    @ParameterizedTest
    @CsvSource({
        "10.1.2.3, 10.0.0.0/8, true",
        "11.1.2.3, 10.0.0.0/8, false",
        "192.168.0.1, 192.168.0.1, true",
        "192.168.0.2, 192.168.0.1, false",
        "2001:db8::1, 2001:db8::/32, true",
        "2001:db9::1, 2001:db8::/32, false",
        "::ffff:10.0.0.1, 10.0.0.0/8, true",
        "10.0.0.1, ::ffff:10.0.0.0/104, true",
        "::1, ::1, true",
        "1::, 1:0:0:0:0:0:0:0/128, true",
        "10.0.0.1, 2001:db8::/32, false",
        "abc, 10.0.0.0/8, false",
        "10.0.0.1, 10.0.0.0/33, false",
        "10.0.0.1, 10.0.0.0/x, false",
        "01.0.0.1, 1.0.0.0/8, false",
        "0.0.0.0, 0.0.0.0/0, true",
    })
    void isIpInCidr(String ip, String cidr, boolean expected) {
        assertThat(IpCidr.isIpInCidr(ip, cidr)).isEqualTo(expected);
    }

    @ParameterizedTest
    @CsvSource({
        "1.2.3.4, 4",
        "256.1.1.1, 0",
        "::, 6",
        "fe80::1%eth0, 6",
        "1:2:3:4:5:6:7:8, 6",
        "1:2:3:4:5:6:7:8:9, 0",
        "1::2::3, 0",
        "::ffff:1.2.3.4, 6",
        "localhost, 0",
    })
    void readIpVersion(String ip, int expected) {
        assertThat(IpParser.readIpVersion(ip)).isEqualTo(expected);
    }
}
