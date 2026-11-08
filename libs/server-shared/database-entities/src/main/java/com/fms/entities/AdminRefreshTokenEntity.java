package com.fms.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "admin_refresh_token")
@Getter
@Setter
@NoArgsConstructor
public class AdminRefreshTokenEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_account_id", nullable = false)
    private UUID adminAccountId;

    @Column(name = "token_hash", length = 128, nullable = false, unique = true)
    private String tokenHash;

    /** 로그인 한 번으로 시작된 토큰 계열. 갱신해도 그대로 이어받고, 재사용이 감지되면 계열째 폐기한다. */
    @Column(name = "family_id", nullable = false)
    private UUID familyId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /** 갱신에 쓴 시각. 동시에 들어온 갱신 요청을 받아 주려고 바로 지우지 않고 유예 시간 동안 남겨 둔다. */
    @Column(name = "used_at")
    private Instant usedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
