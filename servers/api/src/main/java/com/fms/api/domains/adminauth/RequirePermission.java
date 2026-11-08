package com.fms.api.domains.adminauth;

import com.fms.consts.PermissionCode;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 권한 그룹에 이 권한이 없으면 403. 여러 개를 주면 하나라도 있으면 통과한다. (원본 requirePermission · requireAnyPermission)
 * 레지스트리({@link PermissionCode})에 있는 코드만 쓸 수 있다.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    PermissionCode[] value();
}
