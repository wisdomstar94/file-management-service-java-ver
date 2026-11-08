package com.fms.api.middlewares;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** Express {@code trust proxy}(proxy-addr) 와 같은 결과인지 본다. */
class TrustProxySettingTest {
    @ParameterizedTest
    @CsvSource(
            nullValues = "null",
            value = {
                "'', 172.31.240.10, 203.0.113.1, 172.31.240.10",
                "'172.31.240.10, 172.31.240.11', 172.31.240.10, 203.0.113.1, 203.0.113.1",
                "'172.31.240.10', 10.0.0.9, 203.0.113.1, 10.0.0.9",
                "'loopback', 127.0.0.1, '198.51.100.7, 203.0.113.1', 203.0.113.1",
                "'loopback', ::1, 203.0.113.1, 203.0.113.1",
                "'loopback, 203.0.113.0/24', 127.0.0.1, '198.51.100.7, 203.0.113.1', 198.51.100.7",
                "'1', 172.31.240.10, '198.51.100.7, 203.0.113.1', 203.0.113.1",
                "'2', 172.31.240.10, '198.51.100.7, 203.0.113.1', 198.51.100.7",
                "'172.31.250.0/24', 172.31.250.5, null, 172.31.250.5",
                "'172.31.250.0/24', ::ffff:172.31.250.5, 203.0.113.42, 203.0.113.42",
            })
    void resolveClientIp(String setting, String socketAddress, String forwardedFor, String expected) {
        assertThat(TrustProxySetting.parse(setting).resolveClientIp(socketAddress, forwardedFor))
                .isEqualTo(expected);
    }
}
