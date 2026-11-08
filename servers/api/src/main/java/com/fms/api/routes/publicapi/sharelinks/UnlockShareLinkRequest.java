package com.fms.api.routes.publicapi.sharelinks;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

record UnlockShareLinkRequest(
        @NotNull(message = "비밀번호를 입력하세요.") @Size(min = 1, message = "비밀번호를 입력하세요.")
        String password) {}
