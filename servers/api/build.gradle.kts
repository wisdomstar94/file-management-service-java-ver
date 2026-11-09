// 관리자 · 공개 링크 api (Spring Boot). /api/admin/** 는 관리자, /api/public/** 는 외부 공개 링크
plugins {
    alias(libs.plugins.spring.boot)
}

dependencies {
    implementation(project(":libs:server-shared:server-consts"))
    implementation(project(":libs:server-shared:server-types"))
    implementation(project(":libs:server-shared:database-entities"))
    implementation(project(":libs:server-shared:password-handler"))
    implementation(project(":libs:server-shared:jwt-handler"))
    implementation(project(":libs:server-shared:server-utils"))
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    runtimeOnly("org.postgresql:postgresql")

    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")

    // 핫리로드(파일이 바뀌면 자동 재시작)용 devtools.
    // bootRun 으로 띄우더라도 `-PfmsDevtools` 인자가 넘어왔을 때만 의존성을 추가한다. 
    if (providers.gradleProperty("fmsDevtools").isPresent) {
        developmentOnly("org.springframework.boot:spring-boot-devtools")
    }
}

tasks.bootJar { archiveFileName.set("api.jar") }
