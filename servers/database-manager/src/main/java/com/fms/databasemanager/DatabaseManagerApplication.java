package com.fms.databasemanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * DB 마이그레이션(Flyway) · 시드 CLI. 첫 번째 인자로 명령을 받는다.
 *
 * <ul>
 *   <li>{@code migrate} : 아직 적용하지 않은 마이그레이션을 적용한다.
 *   <li>{@code info} : 마이그레이션 적용 상태를 출력한다.
 *   <li>{@code validate} : 적용된 마이그레이션과 파일이 일치하는지 확인한다.
 *   <li>{@code seed} : 권한 · 기본 그룹 · 최초 관리자를 넣는다. 여러 번 실행해도 안전하다.
 *   <li>{@code setup} : {@code migrate} 후 {@code seed}.
 * </ul>
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EntityScan("com.fms.entities")
@EnableJpaRepositories("com.fms.entities")
public class DatabaseManagerApplication {
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(DatabaseManagerApplication.class);
        System.exit(SpringApplication.exit(application.run(args)));
    }
}
