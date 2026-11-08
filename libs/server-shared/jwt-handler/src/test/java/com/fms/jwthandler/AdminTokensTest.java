package com.fms.jwthandler;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AdminTokensTest {
    private static final String SECRET = "test-secret-test-secret-test-secret-1234";
    /** 원본(jose) 으로 sub=acc-1, aud=fms-admin-access, exp=2100-01-01 로 서명한 토큰 */
    private static final String JOSE_TOKEN = "eyJhbGciOiJIUzI1NiJ9."
            + "eyJzdWIiOiJhY2MtMSIsImF1ZCI6ImZtcy1hZG1pbi1hY2Nlc3MiLCJpYXQiOjE3OTQxNDA3NDksImV4cCI6NDEwMjQ0NDgwMH0."
            + "s75Y_dWuwpan2DMNxKjGHwqV4XdsgWeldBjiy0ZVyms";

    @Test
    void verifiesTokenSignedByOriginalNodeServer() {
        assertThat(AdminTokens.verifyAdminAccessToken(JOSE_TOKEN, SECRET)).contains("acc-1");
        assertThat(AdminTokens.verifyAdminAccessToken(JOSE_TOKEN, SECRET + "x")).isEmpty();
    }

    @Test
    void accessTokenRoundTrip() {
        String token = AdminTokens.signAdminAccessToken("acc-2", SECRET);
        assertThat(AdminTokens.verifyAdminAccessToken(token, SECRET)).contains("acc-2");
        // 용도가 다른 토큰으로는 검증되지 않는다.
        assertThat(AdminTokens.verifyAdminShortTimeToken(token, SECRET)).isEmpty();
    }

    @Test
    void shortTimeTokenRoundTrip() {
        String token = AdminTokens.signAdminShortTimeToken(
                "acc-3", AdminShortTimeTokenTarget.downloadDocumentVersion("doc-1", "ver-1"), SECRET);
        assertThat(AdminTokens.verifyAdminShortTimeToken(token, SECRET))
                .contains(new AdminShortTimeTokenClaims(
                        "acc-3", new AdminShortTimeTokenTarget("DOWNLOAD_DOCUMENT_VERSION", "doc-1", "ver-1")));
        assertThat(AdminTokens.verifyAdminAccessToken(token, SECRET)).isEmpty();
    }

    @Test
    void malformedTokenIsEmpty() {
        assertThat(AdminTokens.verifyAdminAccessToken("abc", SECRET)).isEmpty();
    }
}
