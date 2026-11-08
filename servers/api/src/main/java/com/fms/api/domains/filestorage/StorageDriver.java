package com.fms.api.domains.filestorage;

import com.fms.api.config.ApiEnv;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * {@code STORAGE_DIR} 아래에 저장 키 경로 그대로 파일을 둔다. 도커에서는 이 경로를 볼륨으로 마운트한다.
 * S3 등으로 바꿀 때는 이 클래스만 바꾼다.
 */
@Component
public class StorageDriver {
    private final Path rootDir;

    public StorageDriver(ApiEnv apiEnv) {
        this.rootDir = apiEnv.storageRootDir();
        try {
            Files.createDirectories(rootDir.resolve(".tmp"));
        } catch (IOException e) {
            throw new UncheckedIOException("저장소 폴더를 만들지 못했습니다: " + rootDir, e);
        }
    }

    /** 업로드 임시 폴더. multipart 임시 파일도 여기 둬 같은 파일 시스템 안에서 옮기게 한다. */
    public Path tempDir() {
        return rootDir.resolve(".tmp");
    }

    public void saveUploadedFile(MultipartFile file, String key) throws IOException {
        Path target = resolveKey(key);
        Files.createDirectories(target.getParent());
        file.transferTo(target);
    }

    public InputStream openRead(String key) throws IOException {
        return Files.newInputStream(resolveKey(key));
    }

    public void delete(String key) {
        try {
            Files.deleteIfExists(resolveKey(key));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private Path resolveKey(String key) {
        Path resolved = rootDir.resolve(key).normalize();
        if (!resolved.startsWith(rootDir) || resolved.equals(rootDir)) {
            throw new IllegalArgumentException("저장소 밖을 가리키는 키입니다: " + key);
        }
        return resolved;
    }
}
