// 서버(Java) 모듈만 Gradle 로 빌드한다. 웹 · TS 패키지는 yarn workspaces(package.json) 가 맡는다.
plugins {
    // 로컬에 JDK 25 가 없으면 toolchain 이 자동으로 내려받는다.
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "file-management-service"

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { mavenCentral() }
}

include(
    "libs:server-shared:server-consts",
    "libs:server-shared:server-types",
    "libs:server-shared:database-entities",
    "libs:server-shared:password-handler",
    "libs:server-shared:jwt-handler",
    "libs:server-shared:server-utils",
    "servers:api",
    "servers:database-manager",
)
