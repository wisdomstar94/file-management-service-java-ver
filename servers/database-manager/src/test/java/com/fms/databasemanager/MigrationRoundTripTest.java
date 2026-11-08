package com.fms.databasemanager;

import static org.assertj.core.api.Assertions.assertThat;

import com.fms.consts.PermissionCode;
import com.fms.databasemanager.commands.FlywayFactory;
import com.fms.databasemanager.seed.SeedService;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** 원본 database-manager e2e(migration-round-trip) 대응. 빈 PostgreSQL 컨테이너에 실제 마이그레이션 · 시드를 실행한다. */
@SpringBootTest(
        args = "noop",
        properties = {"fms.seed.initial-admin-id=admin", "fms.seed.initial-admin-password=admin1234!"})
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class MigrationRoundTripTest {
    private static final List<String> APP_TABLES = List.of(
            "access_policy_group",
            "admin_account",
            "admin_refresh_token",
            "document",
            "document_version",
            "permission",
            "permission_group",
            "permission_group_permission",
            "share_link",
            "share_link_download_log");
    private static final String INIT_VERSION = "1790990442114";

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:18.6");

    @Autowired
    DataSource dataSource;

    @Autowired
    SeedService seedService;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    @Order(1)
    void migrateCreatesAllTables() {
        FlywayFactory.configure(dataSource).load().migrate();

        List<String> tables = jdbc.queryForList(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
                String.class);
        assertThat(tables).containsExactlyInAnyOrderElementsOf(concat(APP_TABLES, "flyway_schema_history"));
    }

    @Test
    @Order(2)
    void seedTwiceCreatesOneSet() {
        seedService.runSeed();
        seedService.runSeed();

        Map<String, Object> counts = jdbc.queryForMap("""
                SELECT (SELECT count(*) FROM permission) AS permission,
                       (SELECT count(*) FROM permission_group_permission) AS group_permission,
                       (SELECT count(*) FROM admin_account WHERE login_id = 'admin') AS admin
                """);
        int registered = PermissionCode.values().length;
        assertThat(counts)
                .containsEntry("permission", (long) registered)
                .containsEntry("group_permission", (long) registered)
                .containsEntry("admin", 1L);
    }

    /**
     * Flyway Community 에는 되돌리기(undo)가 없어, 원본의 revert 대신 Init 까지만 적용한 새 스키마에서 시작해
     * 권한 마이그레이션이 manage 권한을 나눠 옮기고 코드에 없는 권한은 지우는지 본다.
     */
    @Test
    @Order(3)
    void permissionMigrationsSplitManageAndDeleteUnlinked() {
        jdbc.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
        Flyway initOnly =
                FlywayFactory.configure(dataSource).target(INIT_VERSION).load();
        initOnly.migrate();
        jdbc.execute("""
                WITH pg AS (INSERT INTO permission_group (name) VALUES ('그룹') RETURNING id),
                     p AS (INSERT INTO permission (category, name, code) VALUES
                            ('관리자 계정 관리', '접근 권한', 'account.access'),
                            ('관리자 계정 관리', '관리 권한', 'account.manage'),
                            ('자산 목록 페이지', '조회 권한', 'asset.list.view') RETURNING id)
                INSERT INTO permission_group_permission (permission_group_id, permission_id) SELECT pg.id, p.id FROM pg, p
                """);

        FlywayFactory.configure(dataSource).load().migrate();

        List<String> groupCodes = jdbc.queryForList("""
                SELECT p.code FROM permission_group_permission pgp JOIN permission p ON p.id = pgp.permission_id
                WHERE p.code LIKE 'account.%' OR p.code LIKE 'asset.%' ORDER BY p.code
                """, String.class);
        assertThat(groupCodes).containsExactly("account.access", "account.create", "account.delete", "account.update");
    }

    private static List<String> concat(List<String> list, String item) {
        return java.util.stream.Stream.concat(list.stream(), java.util.stream.Stream.of(item))
                .toList();
    }
}
