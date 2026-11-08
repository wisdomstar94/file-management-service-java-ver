package com.fms.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "share_link")
@Getter
@Setter
@NoArgsConstructor
public class ShareLinkEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", insertable = false, updatable = false)
    private DocumentEntity document;

    @Column(name = "share_link_key", length = 64, nullable = false, unique = true)
    private String shareLinkKey;

    @Column(name = "access_policy_group_id")
    private UUID accessPolicyGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "access_policy_group_id", insertable = false, updatable = false)
    private AccessPolicyGroupEntity accessPolicyGroup;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    /** {@code null} 이면 다운로드 횟수 제한이 없다. */
    @Column(name = "max_download_count")
    private Integer maxDownloadCount;

    @Column(name = "download_count", nullable = false)
    private int downloadCount;

    @Column(name = "available_from")
    private Instant availableFrom;

    @Column(name = "available_until")
    private Instant availableUntil;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_version_mode", length = 20, nullable = false)
    private ShareLinkDefaultVersionMode defaultVersionMode = ShareLinkDefaultVersionMode.FOLLOW_DOCUMENT;

    @Column(name = "fixed_version_id")
    private UUID fixedVersionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fixed_version_id", insertable = false, updatable = false)
    private DocumentVersionEntity fixedVersion;

    @Column(name = "is_show_other_versions", nullable = false)
    private boolean isShowOtherVersions;

    @Column(name = "is_allow_other_version_download", nullable = false)
    private boolean isAllowOtherVersionDownload;

    @Column(name = "is_show_download_status", nullable = false)
    private boolean isShowDownloadStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
