package com.fms.api.routes;

import com.fms.api.commons.ApiResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    ApiResponse<Map<String, String>> health() {
        return ApiResponse.of(Map.of("status", "ok"));
    }
}
