package com.fms.jwthandler;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 브라우저가 api 를 직접 호출하는 업로드 · 다운로드에서 short-time token 으로 허용할 동작과 대상.
 *
 * @param purpose {@code UPLOAD_DOCUMENT} · {@code UPLOAD_DOCUMENT_VERSION} · {@code DOWNLOAD_DOCUMENT_VERSION}
 */
public record AdminShortTimeTokenTarget(String purpose, String documentId, String versionId) {
    public static final String UPLOAD_DOCUMENT = "UPLOAD_DOCUMENT";
    public static final String UPLOAD_DOCUMENT_VERSION = "UPLOAD_DOCUMENT_VERSION";
    public static final String DOWNLOAD_DOCUMENT_VERSION = "DOWNLOAD_DOCUMENT_VERSION";

    public static AdminShortTimeTokenTarget uploadDocument() {
        return new AdminShortTimeTokenTarget(UPLOAD_DOCUMENT, null, null);
    }

    public static AdminShortTimeTokenTarget uploadDocumentVersion(String documentId) {
        return new AdminShortTimeTokenTarget(UPLOAD_DOCUMENT_VERSION, documentId, null);
    }

    public static AdminShortTimeTokenTarget downloadDocumentVersion(String documentId, String versionId) {
        return new AdminShortTimeTokenTarget(DOWNLOAD_DOCUMENT_VERSION, documentId, versionId);
    }

    Map<String, Object> toClaim() {
        Map<String, Object> claim = new LinkedHashMap<>();
        claim.put("purpose", purpose);
        if (documentId != null) {
            claim.put("documentId", documentId);
        }
        if (versionId != null) {
            claim.put("versionId", versionId);
        }
        return claim;
    }

    static AdminShortTimeTokenTarget fromClaim(Object claim) {
        if (!(claim instanceof Map<?, ?> map) || !(map.get("purpose") instanceof String purpose)) {
            return null;
        }
        return new AdminShortTimeTokenTarget(
                purpose,
                map.get("documentId") instanceof String id ? id : null,
                map.get("versionId") instanceof String id ? id : null);
    }
}
