// 모든 서버(Java) 모듈의 공통 빌드 설정
plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spotless) apply false
}

val catalog = libs

subprojects {
    // 하위 그룹 폴더(libs, libs:server-shared, servers)는 빌드 대상이 아니다.
    if (!file("src").exists()) return@subprojects

    group = "com.fms"
    version = "0.0.1"

    apply(plugin = "java-library")
    apply(plugin = "com.diffplug.spotless")

    extensions.configure<JavaPluginExtension> {
        toolchain { languageVersion.set(JavaLanguageVersion.of(catalog.versions.java.get())) }
    }

    dependencies {
        val bom = platform(catalog.spring.boot.bom)
        "implementation"(bom)
        "annotationProcessor"(bom)
        "testImplementation"(platform(catalog.testcontainers.bom))
        "compileOnly"(catalog.lombok)
        "annotationProcessor"(catalog.lombok)
        "testCompileOnly"(catalog.lombok)
        "testAnnotationProcessor"(catalog.lombok)
        "testImplementation"("org.springframework.boot:spring-boot-starter-test")
        "testRuntimeOnly"("org.junit.platform:junit-platform-launcher")
    }

    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        options.compilerArgs.addAll(listOf("-parameters", "-Xlint:all,-processing,-serial", "-Werror"))
    }

    tasks.withType<Test>().configureEach {
        useJUnitPlatform()
        systemProperty("file.encoding", "UTF-8")
    }

    extensions.configure<com.diffplug.gradle.spotless.SpotlessExtension> {
        java {
            target("src/**/*.java")
            palantirJavaFormat(catalog.versions.palantir.java.format.get())
            removeUnusedImports()
            trimTrailingWhitespace()
            endWithNewline()
        }
    }
}

/**
 * 루트 env 파일을 읽어 bootRun 등 실행 태스크의 환경변수로 넣는다. 이미 설정된 환경변수는 덮어쓰지 않는다.
 * 읽을 파일은 `FMS_ENV_FILE` 로 고르며(루트 기준 파일 이름), 없으면 `.env.local` 이다. (웹의 scripts/run-with-root-env.mjs 와 같은 규칙)
 */
fun readRootEnvFile(): Map<String, String> {
    val envFile = rootProject.file(System.getenv("FMS_ENV_FILE")?.takeIf { it.isNotEmpty() } ?: ".env.local")
    if (!envFile.exists()) return emptyMap()
    return envFile.readLines(Charsets.UTF_8)
        .map { it.trim() }
        .filter { it.isNotEmpty() && !it.startsWith("#") && it.contains("=") }
        .associate { line ->
            val (key, rawValue) = line.removePrefix("export ").split("=", limit = 2)
            val value = rawValue.trim().let { v ->
                if (v.length >= 2 && (v.first() == '"' && v.last() == '"' || v.first() == '\'' && v.last() == '\'')) {
                    v.substring(1, v.length - 1)
                } else {
                    v.substringBefore(" #")
                }
            }
            key.trim() to value
        }
        .filterKeys { System.getenv(it) == null }
}

subprojects {
    tasks.withType<JavaExec>().configureEach {
        doFirst { environment(readRootEnvFile()) }
    }
}
