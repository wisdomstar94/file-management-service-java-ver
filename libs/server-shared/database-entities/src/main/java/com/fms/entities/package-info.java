/**
 * JPA 엔티티와 Repository.
 *
 * <p>원본(TypeORM)처럼 외래 키는 {@code xxxId} 컬럼 필드로 읽고 쓰고, 연관 엔티티 필드({@code insertable/updatable =
 * false})는 조회할 때만 쓴다. 스키마는 {@code servers/database-manager} 의 Flyway 마이그레이션이 만들고, api 는
 * {@code ddl-auto=validate} 로 엔티티와 스키마가 맞는지만 확인한다.
 */
package com.fms.entities;
