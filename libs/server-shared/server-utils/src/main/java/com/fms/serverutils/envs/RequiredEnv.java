package com.fms.serverutils.envs;

/** 필수 환경변수를 읽는다. */
public final class RequiredEnv {
    private RequiredEnv() {}

    /** 값이 없거나 빈 문자열이면 어떤 변수가 빠졌는지 담아 예외를 던진다. */
    public static String read(String name) {
        String value = System.getenv(name);
        if (value == null || value.isEmpty()) {
            throw new IllegalStateException("환경변수 " + name + " 가 설정되지 않았습니다.");
        }
        return value;
    }
}
