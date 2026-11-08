import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Flyway 마이그레이션 파일명의 버전이 `newMigration` 태스크가 만든 실제 `System.currentTimeMillis()` 값인지 검사합니다.
 *
 * 손으로 지은 숫자(`1791001200000` 처럼 끝이 둥근 값)는 만든 시점을 알 수 없게 하므로 막고,
 * 같은 버전이 두 번 쓰이거나 git 에 이미 올라간 마이그레이션 파일의 이름이 바뀌는 일도 막습니다.
 * (Flyway 는 이미 적용한 마이그레이션의 파일명 · 내용이 바뀌면 checksum 불일치로 migrate 를 멈춥니다.)
 * DB 마이그레이션은 `yarn db:new-migration -Pname=<이름>` 으로만 만듭니다.
 *
 * @example
 * node scripts/check-migrations.mjs   # 어긋난 곳이 있으면 exit 1
 */

const ROOT = path.resolve(import.meta.dirname, "..");
const MIGRATIONS_DIR = "servers/database-manager/src/main/resources/db/migration";

const FILE_PATTERN = /^V(\d{13})__([A-Z][A-Za-z0-9]*)\.sql$/;
// 실제 currentTimeMillis() 의 끝 5자리가 모두 0 일 확률은 10만 분의 1 이라, 이런 값은 손으로 지은 것으로 봅니다.
const ROUND_UNIT = 100_000;

const errors = [];
const seen = new Map();
const now = Date.now();
const fileNames = fs.readdirSync(path.join(ROOT, MIGRATIONS_DIR)).sort();

for (const fileName of fileNames) {
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const match = FILE_PATTERN.exec(fileName);
  if (!match) {
    errors.push(`${filePath}: 파일명이 V<13자리 timestamp>__<PascalCase 이름>.sql 형식이 아닙니다.`);
    continue;
  }
  const [, timestamp] = match;

  if (Number(timestamp) % ROUND_UNIT === 0) {
    errors.push(`${filePath}: 버전이 손으로 지은 둥근 값입니다. db:new-migration 으로 다시 만드세요.`);
  }
  if (Number(timestamp) > now) {
    errors.push(`${filePath}: 버전이 현재 시각보다 미래입니다.`);
  }
  if (seen.has(timestamp)) {
    errors.push(`${filePath}: 버전이 ${seen.get(timestamp)} 와 같습니다.`);
  }
  seen.set(timestamp, filePath);
}

// git 에 커밋된 마이그레이션 파일이 사라졌다면 이름을 바꿨거나 지운 것이다. (git 저장소가 아니거나 커밋이 없으면 건너뜁니다)
try {
  const committed = execFileSync("git", ["ls-tree", "--name-only", "HEAD", `${MIGRATIONS_DIR}/`], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .split("\n")
    .filter(Boolean)
    .map((file) => path.basename(file));
  for (const fileName of committed) {
    if (!fileNames.includes(fileName)) {
      errors.push(`${MIGRATIONS_DIR}/${fileName}: 커밋된 마이그레이션 파일의 이름을 바꾸거나 지우면 안 됩니다.`);
    }
  }
} catch {
  // git 이 없거나 HEAD 가 없는 경우
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  console.error(`\nDB 마이그레이션 파일 문제 ${errors.length}건.`);
  process.exit(1);
}
