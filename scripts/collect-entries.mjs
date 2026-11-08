import fs from "node:fs";
import path from "node:path";

/**
 * @typedef {object} CollectEntriesOptions
 * @property {string} [srcDir] 진입점을 탐색할 루트 경로. 패키지 디렉토리 기준 상대 경로입니다. 기본값 `"src"`
 * @property {string} [entryFileName] 진입점으로 인식할 파일명. 기본값 `"index.ts"`
 * @property {string} [ignorePrefix] 이 접두사로 시작하는 폴더는 진입점에서 제외합니다. 기본값 `"_"`
 */

/**
 * `srcDir` 하위를 순회하며 `entryFileName` 을 가진 폴더를 서브패스 진입점으로 수집합니다.
 *
 * 서브패스 export 구조를 쓰는 패키지에서 진입점 목록을 직접 나열하지 않고 폴더 구조에서 유도하기 위한
 * 공용 함수입니다. 반환값은 rolldown 의 `input` 및 vite 의 `build.lib.entry` 에 그대로 넣을 수 있습니다.
 *
 * `ignorePrefix` 로 시작하는 폴더는 외부로 공개하지 않는 내부 구현으로 취급해 진입점에서 제외하며,
 * 해당 코드는 이를 참조하는 진입점들의 공유 청크로만 번들됩니다.
 *
 * @example
 * // libs/<그룹>/<패키지>/vite.config.mjs
 * import { collectEntries } from "../../../scripts/collect-entries.mjs";
 *
 * const entries = collectEntries();
 * // → { "array/chunk": "src/array/chunk/index.ts", "promise/sleep": "src/promise/sleep/index.ts", ... }
 *
 * @param {CollectEntriesOptions} [options]
 * @returns {Record<string, string>} 서브패스를 키, 진입점 파일 경로를 값으로 갖는 객체
 */
export function collectEntries(options = {}) {
  const { srcDir = "src", entryFileName = "index.ts", ignorePrefix = "_" } = options;

  return collectFrom(srcDir, "", { srcDir, entryFileName, ignorePrefix });
}

/**
 * `collectEntries` 의 재귀 구현부입니다. 외부로 공개하지 않습니다.
 *
 * @param {string} currentDir 현재 순회 중인 디렉토리 경로
 * @param {string} subpathBase 현재까지 누적된 서브패스
 * @param {Required<CollectEntriesOptions>} options
 * @returns {Record<string, string>}
 */
function collectFrom(currentDir, subpathBase, options) {
  const { srcDir, entryFileName, ignorePrefix } = options;
  const entries = {};

  for (const dirent of fs.readdirSync(currentDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    if (ignorePrefix.length > 0 && dirent.name.startsWith(ignorePrefix)) continue;

    const subpath = subpathBase ? `${subpathBase}/${dirent.name}` : dirent.name;
    const entryDir = path.join(currentDir, dirent.name);

    // 반환 경로는 rolldown 이 요구하는 형태에 맞춰 항상 "/" 구분자를 사용합니다.
    if (fs.existsSync(path.join(entryDir, entryFileName))) {
      entries[subpath] = `${srcDir}/${subpath}/${entryFileName}`;
    }
    Object.assign(entries, collectFrom(entryDir, subpath, options));
  }

  return entries;
}
