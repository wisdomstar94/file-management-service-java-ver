package com.fms.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "admin_account")
@Getter
@Setter
@NoArgsConstructor
public class AdminAccountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "login_id", length = 100, nullable = false, unique = true)
    private String loginId;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "nickname", length = 100, nullable = false)
    private String nickname;

    @Column(name = "memo", columnDefinition = "text", nullable = false)
    private String memo = "";

    @Column(name = "permission_group_id", nullable = false)
    private UUID permissionGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_group_id", insertable = false, updatable = false)
    private PermissionGroupEntity permissionGroup;

    @Column(name = "access_policy_group_id", nullable = false)
    private UUID accessPolicyGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "access_policy_group_id", insertable = false, updatable = false)
    private AccessPolicyGroupEntity accessPolicyGroup;

    @Column(name = "last_accessed_at")
    private Instant lastAccessedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
