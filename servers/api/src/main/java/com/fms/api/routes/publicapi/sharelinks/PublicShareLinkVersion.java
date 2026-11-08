package com.fms.api.routes.publicapi.sharelinks;

import com.fms.entities.DocumentVersionEntity;

record PublicShareLinkVersion(String id, String versionName, String fileName, long fileSize) {
    static PublicShareLinkVersion of(DocumentVersionEntity version) {
        return new PublicShareLinkVersion(
                version.getId().toString(), version.getVersionName(), version.getFileName(), version.getFileSize());
    }
}
