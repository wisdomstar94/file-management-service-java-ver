import { execSync } from "node:child_process";
import { collectEntries } from "./collect-entries.mjs";

/**
 * libs 패키지 공용 vite 설정을 만듭니다.
 *
 * 진입점은 `collectEntries()` 로 폴더 구조에서 유도하며, 진입점마다 `dist/<서브패스>/index.{mjs,cjs}` 를 만들어
 * 단일 파일로 번들되지 않게 합니다. 타입 선언(.d.ts)은 번들이 끝난 뒤 `tsc` 로 생성합니다.
 *
 * @param {object} [options]
 * @param {(string | RegExp)[]} [options.external] 번들에 포함하지 않을 의존성
 * @returns {import('vite').UserConfig}
 */
export function createLibViteConfig(options = {}) {
  const { external = [] } = options;
  const entries = collectEntries();

  return {
    build: {
      ssr: true,
      sourcemap: false,
      minify: false,
      outDir: "dist",
      lib: {
        entry: entries,
      },
      rolldownOptions: {
        input: entries,
        output: [
          {
            format: "es",
            entryFileNames: "[name]/index.mjs",
            chunkFileNames: "_chunks/[name].mjs",
          },
          {
            format: "cjs",
            entryFileNames: "[name]/index.cjs",
            chunkFileNames: "_chunks/[name].cjs",
          },
        ],
        external: [/^node:/, /^@fms\//, ...external],
      },
      emptyOutDir: process.env.EMPTY_OUT_DIR === "true",
      reportCompressedSize: false,
    },
    plugins: [
      {
        name: "dts-generator",
        closeBundle() {
          execSync("tsc", { stdio: "inherit" });
        },
      },
    ],
  };
}
