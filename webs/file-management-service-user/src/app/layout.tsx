import type { Metadata } from "next";
import type { ReactNode } from "react";
import { webEnv } from "@/consts/web-env";
import { PublicEnvProvider } from "@/providers/public-env-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "파일 공유",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <PublicEnvProvider env={{ apiPublicUrl: webEnv.apiPublicUrl }}>{props.children}</PublicEnvProvider>
      </body>
    </html>
  );
}
