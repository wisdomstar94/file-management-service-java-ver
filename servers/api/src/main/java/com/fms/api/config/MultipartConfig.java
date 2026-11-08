package com.fms.api.config;

import com.fms.api.domains.filestorage.StorageDriver;
import org.springframework.boot.servlet.autoconfigure.MultipartProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** multipart 임시 파일을 저장소의 {@code .tmp} 에 둬, 업로드 완료 후 같은 파일 시스템 안에서 옮기게 한다. */
@Configuration
public class MultipartConfig {
    @Bean
    jakarta.servlet.MultipartConfigElement multipartConfigElement(
            MultipartProperties properties, StorageDriver storageDriver) {
        properties.setLocation(storageDriver.tempDir().toString());
        return properties.createMultipartConfig();
    }
}
