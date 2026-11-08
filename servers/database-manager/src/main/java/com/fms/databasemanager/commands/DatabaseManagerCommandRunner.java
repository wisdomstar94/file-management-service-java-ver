package com.fms.databasemanager.commands;

import com.fms.databasemanager.seed.SeedService;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ExitCodeGenerator;
import org.springframework.stereotype.Component;

/** 첫 번째 인자(migrate · info · validate · seed · setup)에 맞는 명령을 실행한다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseManagerCommandRunner implements ApplicationRunner, ExitCodeGenerator {
    private final DataSource dataSource;
    private final SeedService seedService;
    private int exitCode = 0;

    @Override
    public void run(ApplicationArguments args) {
        String command =
                args.getNonOptionArgs().isEmpty() ? "" : args.getNonOptionArgs().getFirst();
        Flyway flyway = FlywayFactory.configure(dataSource).load();
        switch (command) {
            case "migrate" -> migrate(flyway);
            case "info" -> printInfo(flyway);
            case "validate" -> flyway.validate();
            case "seed" -> seedService.runSeed();
            case "setup" -> {
                migrate(flyway);
                seedService.runSeed();
            }
            default -> {
                log.error("알 수 없는 명령입니다: '{}'. migrate · info · validate · seed · setup 중 하나를 지정하세요.", command);
                exitCode = 2;
            }
        }
    }

    @Override
    public int getExitCode() {
        return exitCode;
    }

    private static void migrate(Flyway flyway) {
        var result = flyway.migrate();
        log.info("[migrate] {}건 적용 · 현재 버전 {}", result.migrationsExecuted, result.targetSchemaVersion);
    }

    private static void printInfo(Flyway flyway) {
        for (MigrationInfo info : flyway.info().all()) {
            System.out.printf(
                    "%-16s %-45s %-10s %s%n",
                    info.getVersion(),
                    info.getDescription(),
                    info.getState().getDisplayName(),
                    info.getInstalledOn() == null ? "" : info.getInstalledOn());
        }
    }
}
