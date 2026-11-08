import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  // TypeScript 7 은 Next 빌드가 쓰는 JS API 를 제공하지 않아, 타입 검사는 `yarn type:check`(tsc)로 따로 한다.
  typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,
  // 휴대폰 등 같은 사설망 기기에서 개발 서버로 접속할 때 Next 가 개발 리소스를 차단하지 않게 한다.
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
