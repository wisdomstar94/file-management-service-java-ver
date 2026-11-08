package com.fms.api.routes.admin.documents;

record DocumentSummaryResponse(
        String id,
        String name,
        int versionCount,
        VersionSummary latestVersion,
        String latestVersionFileName,
        VersionSummary fixedDefaultVersion,
        String createdAt,
        String latestVersionCreatedAt) {

    record VersionSummary(String id, String versionName) {}
}
