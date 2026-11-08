package com.fms.api.domains.adminauth;

import com.fms.entities.AdminAccountEntity;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface AdminAccountQueryRepository extends JpaRepository<AdminAccountEntity, UUID> {
    @EntityGraph(attributePaths = {"permissionGroup", "permissionGroup.permissions", "accessPolicyGroup"})
    Optional<AdminAccountEntity> findWithGroupsById(UUID id);

    @EntityGraph(attributePaths = {"accessPolicyGroup"})
    Optional<AdminAccountEntity> findWithAccessPolicyGroupByLoginId(String loginId);

    @Modifying
    @Query("update AdminAccountEntity a set a.lastAccessedAt = :at where a.id = :id")
    void updateLastAccessedAt(UUID id, Instant at);
}
