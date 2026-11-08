package com.fms.api.routes.admin.auth;

import com.fms.entities.AdminRefreshTokenEntity;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface AdminRefreshTokenQueryRepository extends JpaRepository<AdminRefreshTokenEntity, UUID> {
    Optional<AdminRefreshTokenEntity> findByTokenHash(String tokenHash);

    @Modifying
    @Query("delete from AdminRefreshTokenEntity t where t.familyId = :familyId")
    void deleteByFamilyId(UUID familyId);

    @Modifying
    @Query("delete from AdminRefreshTokenEntity t where t.tokenHash = :tokenHash")
    void deleteByTokenHash(String tokenHash);

    @Modifying
    @Query("delete from AdminRefreshTokenEntity t where t.adminAccountId = :adminAccountId and t.expiresAt < :now")
    void deleteExpired(UUID adminAccountId, Instant now);
}
