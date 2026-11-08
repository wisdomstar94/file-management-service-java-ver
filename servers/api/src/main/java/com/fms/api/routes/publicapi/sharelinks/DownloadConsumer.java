package com.fms.api.routes.publicapi.sharelinks;

import com.fms.api.commons.HttpError;
import com.fms.entities.ShareLinkDownloadLogEntity;
import com.fms.entities.ShareLinkDownloadLogRepository;
import jakarta.persistence.EntityManager;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
class DownloadConsumer {
    private final EntityManager entityManager;
    private final ShareLinkDownloadLogRepository downloadLogRepository;

    /**
     * 기간 · 허용 수를 만족할 때만 다운로드 수를 1 올리고 이력을 남긴다.
     * 동시에 여러 요청이 와도 허용 수를 넘지 않도록 조건부 UPDATE 한 번으로 판정한다.
     */
    @Transactional
    void consume(UUID linkId, UUID versionId, String ip) {
        int updated =
                entityManager.createNativeQuery("""
                        UPDATE share_link SET download_count = download_count + 1
                         WHERE id = :id
                           AND (max_download_count IS NULL OR download_count < max_download_count)
                           AND (available_from IS NULL OR available_from <= now())
                           AND (available_until IS NULL OR available_until >= now())
                        """).setParameter("id", linkId).executeUpdate();
        if (updated == 0) {
            throw HttpError.conflict("다운로드 가능 기간이 아니거나 허용 횟수를 모두 사용했습니다.");
        }
        ShareLinkDownloadLogEntity log = new ShareLinkDownloadLogEntity();
        log.setShareLinkId(linkId);
        log.setDocumentVersionId(versionId);
        log.setIp(ip);
        downloadLogRepository.save(log);
    }
}
