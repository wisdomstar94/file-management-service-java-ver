package com.fms.passwordhandler;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PasswordHandlerTest {
    /** 원본(node argon2, 기본 옵션 argon2id)으로 "admin1234!" 를 해시한 값 */
    private static final String NODE_ARGON2_HASH =
            "$argon2id$v=19$m=65536,p=4,t=3$U6Lmf/Dimu3yaVxbUHAEkg$isOP9p32qNt6W3p1OVNfWTxu4LC/Fav+ul9Xz5dkXK8";

    @Test
    void hashAndVerify() {
        String hash = PasswordHandler.hashPassword("admin1234!");
        assertThat(hash).startsWith("$argon2id$v=19$m=65536,p=4,t=3$");
        assertThat(PasswordHandler.verifyPassword(hash, "admin1234!")).isTrue();
        assertThat(PasswordHandler.verifyPassword(hash, "wrong")).isFalse();
    }

    @Test
    void invalidHashReturnsFalse() {
        assertThat(PasswordHandler.verifyPassword("not-a-hash", "x")).isFalse();
        assertThat(PasswordHandler.verifyPassword(null, "x")).isFalse();
    }

    @Test
    void verifiesHashMadeByOriginalNodeServer() {
        assertThat(PasswordHandler.verifyPassword(NODE_ARGON2_HASH, "admin1234!"))
                .isTrue();
        assertThat(PasswordHandler.verifyPassword(NODE_ARGON2_HASH, "admin1234?"))
                .isFalse();
    }
}
