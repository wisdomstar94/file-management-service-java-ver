package com.fms.api.domains.document;

import com.fms.entities.DocumentEntity;
import com.fms.entities.DocumentVersionEntity;
import java.util.List;

/** 자료와 버전 전체(최신순). 자료는 버전을 1개 이상 가진다. */
public record DocumentWithVersions(DocumentEntity document, List<DocumentVersionEntity> versions) {}
