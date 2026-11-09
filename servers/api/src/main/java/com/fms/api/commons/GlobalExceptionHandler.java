package com.fms.api.commons;

import com.fms.consts.ApiErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import tools.jackson.core.JacksonException;

/** 모든 실패 응답을 {@code { error: { code, message, requestKey?, details? } }} 로 맞춘다. (원본 global-error-middleware) */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpError.class)
    ResponseEntity<ApiFailBody> handleHttpError(HttpError error) {
        return ResponseEntity.status(error.getStatus())
                .body(ApiFailBody.of(error.getCode(), error.getMessage(), error.getDetails()));
    }

    /** {@code @Valid @RequestBody} · {@code @ModelAttribute} 검증 실패 */
    @ExceptionHandler(BindException.class)
    ResponseEntity<ApiFailBody> handleBindException(BindException exception) {
        List<ValidationIssue> issues = new ArrayList<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            String message = fieldError.isBindingFailure() ? "값의 형식이 올바르지 않습니다." : fieldError.getDefaultMessage();
            issues.add(new ValidationIssue(ValidationErrors.toZodPath(fieldError.getField()), message));
        }
        exception
                .getBindingResult()
                .getGlobalErrors()
                .forEach(error -> issues.add(new ValidationIssue("", error.getDefaultMessage())));
        return handleHttpError(ValidationErrors.of(issues));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ApiFailBody> handleMethodValidation(HandlerMethodValidationException exception) {
        List<ValidationIssue> issues = new ArrayList<>();
        exception
                .getParameterValidationResults()
                .forEach(result -> result.getResolvableErrors()
                        .forEach(error -> issues.add(new ValidationIssue(
                                result.getMethodParameter().getParameterName(), error.getDefaultMessage()))));
        return handleHttpError(ValidationErrors.of(issues));
    }

    /** JSON 파싱 실패 · 타입 불일치 · 본문 없음 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiFailBody> handleNotReadable(HttpMessageNotReadableException exception) {
        if (exception.getCause() instanceof JacksonException jacksonException
                && !jacksonException.getPath().isEmpty()) {
            String path = jacksonException.getPath().stream()
                    .map(reference -> reference.getPropertyName() != null
                            ? reference.getPropertyName()
                            : String.valueOf(reference.getIndex()))
                    .reduce((a, b) -> a + "." + b)
                    .orElse("");
            return handleHttpError(ValidationErrors.of(path, "값의 형식이 올바르지 않습니다."));
        }
        return handleHttpError(ValidationErrors.of("", "요청 본문이 올바른 JSON 이 아닙니다."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiFailBody> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        return handleHttpError(ValidationErrors.of(exception.getName(), "값의 형식이 올바르지 않습니다."));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    ResponseEntity<ApiFailBody> handleMissingParameter(MissingServletRequestParameterException exception) {
        return handleHttpError(ValidationErrors.of(exception.getParameterName(), "값을 입력하세요."));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    ResponseEntity<ApiFailBody> handleMissingPart(MissingServletRequestPartException exception) {
        return handleHttpError(HttpError.validation("파일을 선택하세요."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiFailBody> handleMaxUploadSize(MaxUploadSizeExceededException exception) {
        return handleHttpError(HttpError.validation("파일 업로드에 실패했습니다. (LIMIT_FILE_SIZE)"));
    }

    @ExceptionHandler(MultipartException.class)
    ResponseEntity<ApiFailBody> handleMultipart(MultipartException exception) {
        return handleHttpError(HttpError.validation("파일 업로드에 실패했습니다. (MULTIPART)"));
    }

    @ExceptionHandler({NoResourceFoundException.class, HttpRequestMethodNotSupportedException.class})
    ResponseEntity<ApiFailBody> handleNoRoute(Exception exception) {
        return handleHttpError(new HttpError(404, ApiErrorCode.NOT_FOUND, "요청한 api 를 찾을 수 없습니다."));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiFailBody> handleUnknown(Exception exception, HttpServletRequest request) {
        String requestKey = UUID.randomUUID().toString();
        log.error("[{}] {} {}", requestKey, request.getMethod(), request.getRequestURI(), exception);
        return ResponseEntity.status(500)
                .body(new ApiFailBody(new ApiFailBody.ApiErrorBody(
                        ApiErrorCode.INTERNAL_SERVER_ERROR, "서버에서 오류가 발생했습니다.", requestKey, null)));
    }
}
