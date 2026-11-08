package com.fms.api.routes.publicapi.sharelinks;

import com.fms.entities.DocumentEntity;
import com.fms.entities.DocumentVersionEntity;
import com.fms.entities.ShareLinkEntity;
import java.util.List;

/** 접근 정책을 통과한 링크 · 자료 · 버전(최신순). 잠금 해제까지 통과하면 {@code defaultVersion} 이 채워진다. */
record OpenedShareLink(
        ShareLinkEntity link,
        DocumentEntity document,
        List<DocumentVersionEntity> versions,
        DocumentVersionEntity defaultVersion) {}
