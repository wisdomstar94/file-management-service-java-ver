package com.fms.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ConfigurationPropertiesScan
@EntityScan("com.fms.entities")
@EnableJpaRepositories({"com.fms.entities", "com.fms.api"})
public class FmsApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(FmsApiApplication.class, args);
    }
}
