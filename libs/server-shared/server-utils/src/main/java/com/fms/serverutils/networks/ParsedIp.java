package com.fms.serverutils.networks;

import java.math.BigInteger;

/** 비교 가능한 정수로 바꾼 IP. IPv4-mapped IPv6 는 {@code version = 4} 로 바뀐다. */
public record ParsedIp(int version, BigInteger value) {}
