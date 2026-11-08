/**
 * `libs/contracts/shared-consts/*.json` 에서 웹용 TS 상수(`@fms/consts`)를 만듭니다.
 *
 * 서버(Java) 쪽 상수는 Gradle 빌드가 같은 JSON 으로 만들므로, 이 스크립트는 TS 만 다룹니다.
 *
 *   node scripts/generate-shared-consts.mjs           # 파일을 다시 만듭니다
 *   node scripts/generate-shared-consts.mjs --check   # JSON 과 어긋난 파일이 있으면 실패합니다 (yarn lint:check)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTRACTS_DIR = path.join(ROOT, "libs/contracts/shared-consts");
const CONSTS_SRC_DIR = path.join(ROOT, "libs/web-shared/consts/src");
const BIOME_BIN = path.join(ROOT, "node_modules/@biomejs/biome/bin/biome");
const HEADER =
  "// 자동 생성 파일입니다. 직접 고치지 말고 libs/contracts/shared-consts 의 JSON 을 고친 뒤 `yarn contracts:generate` 를 실행하세요.\n";

const isCheck = process.argv.includes("--check");

function readContract(fileName) {
  return JSON.parse(fs.readFileSync(path.join(CONTRACTS_DIR, fileName), "utf8"));
}

/** @type {{ file: string; content: string }[]} */
const outputs = [
  {
    file: "permissions/permission-code-registry/permission-code-registry.ts",
    content: `${HEADER}
/**
 * 코드가 실제로 검사하는 권한 코드 목록입니다.
 *
 * 여기에 있는 코드만 \`requirePermission\` · 메뉴 노출 판정에 쓸 수 있고, DB 의 권한은 시드가 이 목록으로만 추가합니다.
 * \`seed\` 는 DB 에 처음 넣을 분류·권한명입니다.
 */
export const PERMISSION_CODE_REGISTRY = ${JSON.stringify(readContract("permission-code-registry.json"))} as const satisfies Record<string, { seed: { category: string; name: string } }>;
`,
  },
  {
    file: "errors/api-error-code/api-error-code.ts",
    content: `${HEADER}
export const API_ERROR_CODE = ${JSON.stringify(Object.fromEntries(readContract("api-error-code.json").map((code) => [code, code])))} as const;
`,
  },
  {
    file: "cookies/admin-auth-cookie-names/admin-auth-cookie-names.ts",
    content: `${HEADER}
/** 관리자 토큰 쿠키 이름. api 가 로그인 · 로그아웃에서 쓰고, 관리자 웹 서버가 같은 쿠키를 읽고 갱신한다. */
${Object.entries(readContract("admin-auth-cookie-names.json"))
  .map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`)
  .join("\n")}
`,
  },
  {
    file: "access-policies/access-policy-tree-max-depth/access-policy-tree-max-depth.ts",
    content: `${HEADER}
/** 접근 정책 조건 트리의 최대 중첩 단계 */
export const ACCESS_POLICY_TREE_MAX_DEPTH = ${readContract("access-policy-tree-max-depth.json").ACCESS_POLICY_TREE_MAX_DEPTH};
`,
  },
  {
    file: "jwt/jwt-audiences/jwt-audiences.ts",
    content: `${HEADER}
/** JWT \`aud\` 클레임 값. api 가 서명하고 관리자 웹 서버가 같은 값으로 검증한다. */
${Object.entries(readContract("jwt-audiences.json"))
  .map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`)
  .join("\n")}
`,
  },
];

/** 저장소의 biome 설정으로 포맷해, 생성 결과가 `biome check` 와 어긋나지 않게 합니다. */
function format(filePath, content) {
  return execFileSync(process.execPath, [BIOME_BIN, "format", `--stdin-file-path=${filePath}`], {
    input: content,
    cwd: ROOT,
    encoding: "utf8",
  });
}

const staleFiles = [];
for (const { file, content } of outputs) {
  const filePath = path.join(CONSTS_SRC_DIR, file);
  const formatted = format(filePath, content);
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (current === formatted) continue;

  if (isCheck) {
    staleFiles.push(path.relative(ROOT, filePath));
  } else {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, formatted);
    console.log(`generated ${path.relative(ROOT, filePath)}`);
  }
}

if (staleFiles.length > 0) {
  console.error(
    "libs/contracts/shared-consts 와 어긋난 생성 파일이 있습니다. `yarn contracts:generate` 를 실행하세요.",
  );
  for (const file of staleFiles) console.error(`  - ${file}`);
  process.exit(1);
}
