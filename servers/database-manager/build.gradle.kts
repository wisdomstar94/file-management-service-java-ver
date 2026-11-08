// Flyway 마이그레이션 · 시드 CLI (Spring Boot 비웹 앱)
//   ./gradlew :servers:database-manager:bootRun --args=migrate|info|validate|seed|setup
//   ./gradlew :servers:database-manager:newMigration -Pname=<이름>
plugins {
    alias(libs.plugins.spring.boot)
}

dependencies {
    implementation(project(":libs:server-shared:database-entities"))
    implementation(project(":libs:server-shared:password-handler"))
    implementation(project(":libs:server-shared:server-consts"))
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-jdbc")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")

    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter")
    testImplementation("org.testcontainers:testcontainers-postgresql")
}

tasks.bootJar { archiveFileName.set("database-manager.jar") }

/**
 * 현재 시각(ms) 을 버전으로 한 빈 Flyway 마이그레이션 파일을 만든다. 파일명의 버전을 손으로 짓지 않는다.
 * (원본 TypeORM `migration:create` 대응. 엔티티 diff 로 SQL 을 만들어 주는 기능은 Flyway 에 없다.)
 */
tasks.register("newMigration") {
    group = "database"
    description = "빈 Flyway 마이그레이션 파일을 만든다. -Pname=<PascalCase 이름>"
    val migrationName = providers.gradleProperty("name")
    val migrationDir = layout.projectDirectory.dir("src/main/resources/db/migration")
    doLast {
        val name = migrationName.orNull ?: throw GradleException("-Pname=<이름> 을 지정하세요. 예) -Pname=AddDocumentMemo")
        require(Regex("^[A-Z][A-Za-z0-9]*$").matches(name)) { "이름은 PascalCase 영문 · 숫자만 씁니다: $name" }
        val file = migrationDir.file("V${System.currentTimeMillis()}__$name.sql").asFile
        file.writeText("-- TODO: $name\n")
        println("created ${file.relativeTo(rootDir)}")
    }
}
