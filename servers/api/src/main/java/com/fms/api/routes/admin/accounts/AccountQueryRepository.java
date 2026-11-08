package com.fms.api.routes.admin.accounts;

import com.fms.entities.AdminAccountEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface AccountQueryRepository extends JpaRepository<AdminAccountEntity, UUID> {
    @EntityGraph(attributePaths = {"permissionGroup", "accessPolicyGroup"})
    @Query("select a from AdminAccountEntity a")
    Page<AdminAccountEntity> findPageWithGroups(Pageable pageable);

    @EntityGraph(attributePaths = {"permissionGroup", "accessPolicyGroup"})
    Optional<AdminAccountEntity> findWithGroupsById(UUID id);

    boolean existsByLoginId(String loginId);
}
