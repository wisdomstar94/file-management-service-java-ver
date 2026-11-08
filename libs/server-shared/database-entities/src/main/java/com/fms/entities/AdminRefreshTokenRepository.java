package com.fms.entities;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRefreshTokenRepository extends JpaRepository<AdminRefreshTokenEntity, UUID> {}
