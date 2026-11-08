package com.fms.api.commons;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * JSON 본문을 요청 record 로 바꾸고 Bean Validation 으로 검증한다. 실패하면 원본(zod)과 같은 400 규격으로 던진다.
 *
 * <p>PATCH 처럼 "필드 생략(기존 값 유지)" 과 "null(값 지움)" 을 구분해야 하는 곳에서 쓴다. 생략 여부는 {@link #presentKeys} 로 본다.
 */
@Component
@RequiredArgsConstructor
public class RequestBodies {
    private final JsonMapper jsonMapper;
    private final Validator validator;

    public <T> T parse(JsonNode body, Class<T> type) {
        if (body == null || !body.isObject()) {
            throw ValidationErrors.of("", "요청 본문이 올바른 JSON 객체가 아닙니다.");
        }
        T value;
        try {
            value = jsonMapper.treeToValue(body, type);
        } catch (JacksonException e) {
            String path = e.getPath().stream()
                    .map(reference -> reference.getPropertyName() != null
                            ? reference.getPropertyName()
                            : String.valueOf(reference.getIndex()))
                    .reduce((a, b) -> a + "." + b)
                    .orElse("");
            throw ValidationErrors.of(path, "값의 형식이 올바르지 않습니다.");
        }
        return validate(value);
    }

    /** Bean Validation 으로 검증하고, 실패하면 원본(zod)과 같은 400 규격으로 던진다. */
    public <T> T validate(T value) {
        Set<ConstraintViolation<T>> violations = validator.validate(value);
        if (!violations.isEmpty()) {
            List<ValidationIssue> issues = violations.stream()
                    .map(violation -> new ValidationIssue(
                            ValidationErrors.toZodPath(
                                    violation.getPropertyPath().toString()),
                            violation.getMessage()))
                    .sorted(Comparator.comparing(ValidationIssue::path))
                    .toList();
            throw ValidationErrors.of(issues);
        }
        return value;
    }

    /** PATCH 에서 생략은 되지만 null 은 안 되는 필드. null 이면 원본(zod)처럼 400 이다. */
    public void rejectNulls(JsonNode body, String... fields) {
        for (String field : fields) {
            if (body != null && body.has(field) && body.get(field).isNull()) {
                throw ValidationErrors.of(field, "값을 입력하세요.");
            }
        }
    }

    /** 본문에 실제로 들어 있는 필드 이름 (값이 null 이어도 포함) */
    public Set<String> presentKeys(JsonNode body) {
        return body == null ? Set.of() : new LinkedHashSet<>(body.propertyNames());
    }
}
