// HS256 JWT 서명 · 검증 (원본 jose 대응). 관리자 웹(TS)이 같은 secret 으로 이 토큰을 검증한다.
dependencies {
    "api"(project(":libs:server-shared:server-consts"))
    "api"(libs.nimbus.jose.jwt)
}
