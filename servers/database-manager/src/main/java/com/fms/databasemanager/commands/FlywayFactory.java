package com.fms.databasemanager.commands;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;

/** 이 프로젝트의 Flyway 설정. 마이그레이션은 {@code src/main/resources/db/migration} 에 있다. */
public final class FlywayFactory {
    private FlywayFactory() {}

    public static FluentConfiguration configure(DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                // 이미 적용한 마이그레이션 파일이 바뀌면 실행을 멈춘다.
                .validateOnMigrate(true)
                .cleanDisabled(true);
    }
}
