package com.fms.api.routes.admin.accounts;

import java.util.List;

record AdminAccountListResponse(List<AdminAccountResponse> items, long total, int page, int size) {}
