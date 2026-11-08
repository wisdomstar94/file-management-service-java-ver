package com.fms.api.domains.permission;

import com.fms.entities.PermissionEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionQueryRepository extends JpaRepository<PermissionEntity, UUID> {
    List<PermissionEntity> findAllByOrderByCategoryAscCreatedAtAsc();
}
