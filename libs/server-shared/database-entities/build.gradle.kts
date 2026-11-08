// JPA 엔티티 · Repository (api · database-manager 공용). 스키마는 Flyway 마이그레이션으로만 바꾼다.
dependencies {
    "api"("org.springframework.boot:spring-boot-starter-data-jpa")
    "api"(project(":libs:server-shared:server-types"))
}
