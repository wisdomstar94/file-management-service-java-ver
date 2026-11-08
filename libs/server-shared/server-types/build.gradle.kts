// 서버 모듈들이 함께 쓰는 타입 (원본 @fms/types 의 서버 쪽 대응)
dependencies {
    // 접근 정책 트리를 JSON(jsonb · 요청 본문)으로 주고받을 때 쓰는 애너테이션
    "api"("com.fasterxml.jackson.core:jackson-annotations")
}
