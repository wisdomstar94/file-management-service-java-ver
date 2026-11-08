package com.fms.api.domains.sharelink;

import com.fms.entities.ShareLinkEntity;
import java.time.Instant;

/** 공개 링크를 지금 쓸 수 있는지. 관리자 목록 · 공개 링크 화면에 그대로 내려간다. */
public enum ShareLinkAvailability {
    SCHEDULED,
    EXPIRED,
    EXHAUSTED,
    ACTIVE;

    public static ShareLinkAvailability of(ShareLinkEntity link) {
        Instant now = Instant.now();
        if (link.getAvailableFrom() != null && now.isBefore(link.getAvailableFrom())) {
            return SCHEDULED;
        }
        if (link.getAvailableUntil() != null && now.isAfter(link.getAvailableUntil())) {
            return EXPIRED;
        }
        if (link.getMaxDownloadCount() != null && link.getDownloadCount() >= link.getMaxDownloadCount()) {
            return EXHAUSTED;
        }
        return ACTIVE;
    }
}
