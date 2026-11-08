package com.fms.api.routes.admin.permissiongroups;

import com.fms.entities.PermissionGroupEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface PermissionGroupQueryRepository extends JpaRepository<PermissionGroupEntity, UUID> {
    @EntityGraph(attributePaths = {"permissions"})
    @Query("select g from PermissionGroupEntity g order by g.createdAt asc")
    List<PermissionGroupEntity> findAllWithPermissions();

    @EntityGraph(attributePaths = {"permissions"})
    Optional<PermissionGroupEntity> findWithPermissionsById(UUID id);

    @Query("select count(a) from AdminAccountEntity a where a.permissionGroupId = :id")
    long countAccounts(UUID id);
}
