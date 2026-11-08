package com.fms.api.routes.admin.documents;

import java.util.List;

record DocumentListResponse(List<DocumentSummaryResponse> items, long total, int page, int size) {}
