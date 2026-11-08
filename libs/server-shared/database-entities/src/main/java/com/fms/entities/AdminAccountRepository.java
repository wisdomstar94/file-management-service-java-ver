package com.fms.entities;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAccountRepository extends JpaRepository<AdminAccountEntity, UUID> {
    boolean existsByLoginId(String loginId);

    Optional<AdminAccountEntity> findByLoginId(String loginId);
}
