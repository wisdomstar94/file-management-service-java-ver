package com.fms.passwordhandler;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;

/**
 * argon2id 해시. 파라미터 · 문자열 형식이 원본(node argon2 기본값)과 같아 서로 만든 해시를 검증할 수 있다.
 * 결과 예: {@code $argon2id$v=19$m=65536,p=4,t=3$<salt>$<hash>}
 *
 * <p>Spring Security 의 {@code Argon2PasswordEncoder} 는 {@code m,t,p} 를 위치로 읽어, 원본이 만든
 * {@code m,p,t} 순서의 해시를 잘못 읽으므로 쓰지 않는다.
 */
public final class PasswordHandler {
    private static final int MEMORY_KIB = 65536;
    private static final int ITERATIONS = 3;
    private static final int PARALLELISM = 4;
    private static final int SALT_LENGTH = 16;
    private static final int HASH_LENGTH = 32;
    private static final Base64.Encoder B64_ENCODER = Base64.getEncoder().withoutPadding();
    private static final Base64.Decoder B64_DECODER = Base64.getDecoder();
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordHandler() {}

    public static String hashPassword(String plain) {
        byte[] salt = new byte[SALT_LENGTH];
        RANDOM.nextBytes(salt);
        byte[] hash = derive(plain, salt, MEMORY_KIB, ITERATIONS, PARALLELISM, HASH_LENGTH);
        return "$argon2id$v=19$m=" + MEMORY_KIB + ",p=" + PARALLELISM + ",t=" + ITERATIONS + "$"
                + B64_ENCODER.encodeToString(salt) + "$" + B64_ENCODER.encodeToString(hash);
    }

    /** 해시 형식이 잘못된 경우에도 예외 대신 {@code false} 를 반환한다. */
    public static boolean verifyPassword(String hash, String plain) {
        try {
            if (hash == null || plain == null) {
                return false;
            }
            // "", "argon2id", "v=19", "m=..,p=..,t=..", salt, hash
            String[] parts = hash.split("\\$");
            if (parts.length != 6 || !parts[1].equals("argon2id") || !parts[2].equals("v=19")) {
                return false;
            }
            Map<String, Integer> params = new HashMap<>();
            for (String param : parts[3].split(",")) {
                String[] keyValue = param.split("=", 2);
                params.put(keyValue[0], Integer.parseInt(keyValue[1]));
            }
            byte[] salt = B64_DECODER.decode(parts[4]);
            byte[] expected = B64_DECODER.decode(parts[5]);
            byte[] actual = derive(plain, salt, params.get("m"), params.get("t"), params.get("p"), expected.length);
            return MessageDigest.isEqual(expected, actual);
        } catch (RuntimeException e) {
            return false;
        }
    }

    private static byte[] derive(
            String plain, byte[] salt, int memoryKib, int iterations, int parallelism, int length) {
        Argon2Parameters parameters = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withSalt(salt)
                .withMemoryAsKB(memoryKib)
                .withIterations(iterations)
                .withParallelism(parallelism)
                .build();
        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(parameters);
        byte[] result = new byte[length];
        generator.generateBytes(plain.getBytes(StandardCharsets.UTF_8), result);
        return result;
    }
}
