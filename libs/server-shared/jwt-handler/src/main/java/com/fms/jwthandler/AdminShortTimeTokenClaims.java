package com.fms.jwthandler;

public record AdminShortTimeTokenClaims(String adminAccountId, AdminShortTimeTokenTarget target) {}
