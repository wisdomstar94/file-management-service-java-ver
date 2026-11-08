package com.fms.api.routes.admin.accesspolicygroups;

import com.fms.entities.AccessPolicyGroupEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface AccessPolicyGroupQueryRepository extends JpaRepository<AccessPolicyGroupEntity, UUID> {
    List<AccessPolicyGroupEntity> findAllByOrderByCreatedAtAsc();

    @Query("select count(a) from AdminAccountEntity a where a.accessPolicyGroupId = :id")
    long countAccounts(UUID id);

    @Query("select count(l) from ShareLinkEntity l where l.accessPolicyGroupId = :id")
    long countShareLinks(UUID id);
}
