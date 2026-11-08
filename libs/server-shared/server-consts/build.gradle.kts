import groovy.json.JsonSlurper

// libs/contracts/shared-consts/*.json → Java 상수. 웹(TS) 쪽은 scripts/generate-shared-consts.mjs 가 같은 JSON 으로 만든다.
val contractsDir = rootProject.layout.projectDirectory.dir("libs/contracts/shared-consts")
val generatedDir = layout.buildDirectory.dir("generated/sources/shared-consts")

val generateSharedConsts = tasks.register("generateSharedConsts") {
    description = "libs/contracts/shared-consts 의 JSON 으로 Java 상수 클래스를 만든다."
    inputs.dir(contractsDir)
    outputs.dir(generatedDir)

    doLast {
        val pkgDir = generatedDir.get().dir("com/fms/consts").asFile
        pkgDir.deleteRecursively()
        pkgDir.mkdirs()
        fun read(name: String): Any = JsonSlurper().parse(contractsDir.file(name).asFile, "UTF-8")
        fun quote(value: String) = "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
        val header = "// 자동 생성 파일입니다. libs/contracts/shared-consts 의 JSON 을 고치세요.\npackage com.fms.consts;\n\n"

        @Suppress("UNCHECKED_CAST")
        val registry = read("permission-code-registry.json") as Map<String, Map<String, Map<String, String>>>
        val permissionConstants = registry.entries.joinToString(",\n") { (code, value) ->
            val seed = value.getValue("seed")
            val name = code.uppercase().replace('.', '_')
            "    $name(${quote(code)}, ${quote(seed.getValue("category"))}, ${quote(seed.getValue("name"))})"
        }
        File(pkgDir, "PermissionCode.java").writeText(
            header + """
            |import java.util.Arrays;
            |import java.util.Optional;
            |
            |/** 코드가 실제로 검사하는 권한 코드 목록. DB 의 권한은 시드가 이 목록으로만 추가한다. */
            |public enum PermissionCode {
            |$permissionConstants;
            |
            |    private final String code;
            |    private final String seedCategory;
            |    private final String seedName;
            |
            |    PermissionCode(String code, String seedCategory, String seedName) {
            |        this.code = code;
            |        this.seedCategory = seedCategory;
            |        this.seedName = seedName;
            |    }
            |
            |    /** DB · API 에 쓰는 권한 코드 문자열 (예 {@code file.list.access}) */
            |    public String code() {
            |        return code;
            |    }
            |
            |    /** DB 에 처음 넣을 분류 */
            |    public String seedCategory() {
            |        return seedCategory;
            |    }
            |
            |    /** DB 에 처음 넣을 권한명 */
            |    public String seedName() {
            |        return seedName;
            |    }
            |
            |    public static Optional<PermissionCode> fromCode(String code) {
            |        return Arrays.stream(values()).filter(value -> value.code.equals(code)).findFirst();
            |    }
            |}
            |""".trimMargin(),
        )

        @Suppress("UNCHECKED_CAST")
        val errorCodes = read("api-error-code.json") as List<String>
        File(pkgDir, "ApiErrorCode.java").writeText(
            header + "/** api 실패 응답의 {@code error.code} */\npublic enum ApiErrorCode {\n" +
                errorCodes.joinToString(",\n") { "    $it" } + ";\n}\n",
        )

        fun writeStringConstants(className: String, file: String, doc: String) {
            @Suppress("UNCHECKED_CAST")
            val values = read(file) as Map<String, Any>
            val body = values.entries.joinToString("\n") { (name, value) ->
                when (value) {
                    is String -> "    public static final String $name = ${quote(value)};"
                    else -> "    public static final int $name = $value;"
                }
            }
            File(pkgDir, "$className.java").writeText(
                header + "/** $doc */\npublic final class $className {\n$body\n\n    private $className() {}\n}\n",
            )
        }
        writeStringConstants("AdminAuthCookieNames", "admin-auth-cookie-names.json", "관리자 토큰 쿠키 이름")
        writeStringConstants("AccessPolicyTreeMaxDepth", "access-policy-tree-max-depth.json", "접근 정책 조건 트리의 최대 중첩 단계")
        writeStringConstants("JwtAudiences", "jwt-audiences.json", "JWT aud 클레임 값")
    }
}

sourceSets.main { java.srcDir(generateSharedConsts) }
