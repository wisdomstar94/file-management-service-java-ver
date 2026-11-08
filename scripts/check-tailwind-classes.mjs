import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

/**
 * webs · libs 의 ts / tsx 에서 tailwind 클래스가 정규(canonical) 표기인지 검사합니다.
 *
 * 에디터의 `tailwindcss(suggestCanonicalClasses)` 경고와 같은 기준(tailwind 의 `canonicalizeCandidates`)을 쓰므로,
 * `w-[640px]` → `w-160`, `!h-9` → `h-9!` 처럼 에디터가 고치라고 하는 표기를 그대로 잡아냅니다.
 *
 * @example
 * node scripts/check-tailwind-classes.mjs          # 검사만 하고, 고칠 곳이 있으면 exit 1
 * node scripts/check-tailwind-classes.mjs --write  # 정규 표기로 바꿔 저장
 */

const ROOT = path.resolve(import.meta.dirname, "..");
const SCAN_DIRS = ["webs", "libs"];
const IGNORE_DIRS = new Set(["node_modules", ".next", "dist", ".turbo", "test-results", "playwright-report"]);
const THEME_CSS = "libs/web-shared/web-ui/src/styles/theme.css";

const write = process.argv.includes("--write");

const require = createRequire(path.join(ROOT, "package.json"));
const tailwindDir = path.dirname(require.resolve("tailwindcss/package.json"));
const tailwind = await import(path.join(tailwindDir, "dist/lib.mjs"));
const css = [
  fs.readFileSync(path.join(tailwindDir, "index.css"), "utf8"),
  fs.readFileSync(path.join(ROOT, THEME_CSS), "utf8"),
].join("\n");
const designSystem = await tailwind.__unstable__loadDesignSystem(css, { base: tailwindDir });

// 문자열 안의 클래스 한 개 단위로 자릅니다. tailwind 로 해석되지 않는 토큰은 아래에서 걸러집니다.
const TOKEN_PATTERN = /[^\s"'`{}()<>,;]+/g;

let total = 0;
for (const file of SCAN_DIRS.flatMap((dir) => collectFiles(path.join(ROOT, dir)))) {
  let source = fs.readFileSync(file, "utf8");
  const fixes = new Map();
  for (const [token] of source.matchAll(TOKEN_PATTERN)) {
    if (fixes.has(token) || designSystem.candidatesToCss([token])[0] == null) continue;
    const [canonical] = designSystem.canonicalizeCandidates([token], { rem: 16 });
    if (canonical && canonical !== token) fixes.set(token, canonical);
  }

  for (const [from, to] of fixes) {
    // 클래스 경계(공백 · 따옴표 · 백틱) 사이에 있는 것만 바꿔, 다른 클래스의 일부가 바뀌지 않게 합니다.
    const pattern = new RegExp(`(?<=[\\s"'\`])${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s"'\`])`, "g");
    const count = source.match(pattern)?.length ?? 0;
    if (count === 0) continue;
    total += count;
    console.log(`${path.relative(ROOT, file)}: ${from} → ${to} (${count})`);
    if (write) source = source.replace(pattern, to);
  }
  if (write && fixes.size > 0) fs.writeFileSync(file, source);
}

if (total > 0 && !write) {
  console.error(`\n정규 표기가 아닌 tailwind 클래스 ${total}곳. \`yarn lint:format\` 으로 고칠 수 있습니다.`);
  process.exit(1);
}

/**
 * `dir` 하위의 ts / tsx 파일 경로를 재귀로 모읍니다.
 *
 * @param {string} dir
 * @returns {string[]}
 */
function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (IGNORE_DIRS.has(entry.name)) return [];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath);
    return /\.tsx?$/.test(entry.name) ? [fullPath] : [];
  });
}
