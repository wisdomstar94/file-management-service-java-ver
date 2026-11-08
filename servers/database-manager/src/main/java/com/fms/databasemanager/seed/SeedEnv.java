package com.fms.databasemanager.seed;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.Name;

/** 최초 관리자 시드 값. 환경변수 {@code INITIAL_ADMIN_*} 에서 읽으며, 없으면 최초 관리자를 만들지 않는다. */
@ConfigurationProperties(prefix = "fms.seed")
public record SeedEnv(
        @Name("initial-admin-id") String initialAdminId,
        @Name("initial-admin-password") String initialAdminPassword,
        @Name("initial-admin-nickname") String initialAdminNickname) {}
