-- `*.manage` 를 동작별 권한으로 나누고, 기존에 `*.manage` 를 가진 권한 그룹에는 나눈 권한을 모두 부여한다.
-- 마이그레이션은 실행 시점의 코드와 무관하게 같은 결과를 내야 하므로 권한 레지스트리를 참조하지 않고 값을 고정한다.
-- (원본 TypeORM 마이그레이션 SplitManagePermissions1791007486978 의 반복문을 풀어 쓴 것이다.)

-- file.detail.link.manage
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '외부 공개 링크 생성 권한', 'file.detail.link.create' FROM "permission" WHERE "code" = 'file.detail.link.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '외부 공개 링크 수정 권한', 'file.detail.link.update' FROM "permission" WHERE "code" = 'file.detail.link.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '외부 공개 링크 삭제 권한', 'file.detail.link.delete' FROM "permission" WHERE "code" = 'file.detail.link.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission_group_permission" ("permission_group_id", "permission_id")
SELECT pgp."permission_group_id", split."id"
FROM "permission_group_permission" pgp
JOIN "permission" manage ON manage."id" = pgp."permission_id" AND manage."code" = 'file.detail.link.manage'
JOIN "permission" split ON split."code" IN ('file.detail.link.create', 'file.detail.link.update', 'file.detail.link.delete')
ON CONFLICT DO NOTHING;
DELETE FROM "permission" WHERE "code" = 'file.detail.link.manage';

-- account.manage
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '생성 권한', 'account.create' FROM "permission" WHERE "code" = 'account.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '수정 권한', 'account.update' FROM "permission" WHERE "code" = 'account.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '삭제 권한', 'account.delete' FROM "permission" WHERE "code" = 'account.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission_group_permission" ("permission_group_id", "permission_id")
SELECT pgp."permission_group_id", split."id"
FROM "permission_group_permission" pgp
JOIN "permission" manage ON manage."id" = pgp."permission_id" AND manage."code" = 'account.manage'
JOIN "permission" split ON split."code" IN ('account.create', 'account.update', 'account.delete')
ON CONFLICT DO NOTHING;
DELETE FROM "permission" WHERE "code" = 'account.manage';

-- policy.manage
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '생성 권한', 'policy.create' FROM "permission" WHERE "code" = 'policy.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '수정 권한', 'policy.update' FROM "permission" WHERE "code" = 'policy.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '삭제 권한', 'policy.delete' FROM "permission" WHERE "code" = 'policy.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission_group_permission" ("permission_group_id", "permission_id")
SELECT pgp."permission_group_id", split."id"
FROM "permission_group_permission" pgp
JOIN "permission" manage ON manage."id" = pgp."permission_id" AND manage."code" = 'policy.manage'
JOIN "permission" split ON split."code" IN ('policy.create', 'policy.update', 'policy.delete')
ON CONFLICT DO NOTHING;
DELETE FROM "permission" WHERE "code" = 'policy.manage';

-- perm.group.manage
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '생성 권한', 'perm.group.create' FROM "permission" WHERE "code" = 'perm.group.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '수정 권한', 'perm.group.update' FROM "permission" WHERE "code" = 'perm.group.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '삭제 권한', 'perm.group.delete' FROM "permission" WHERE "code" = 'perm.group.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission_group_permission" ("permission_group_id", "permission_id")
SELECT pgp."permission_group_id", split."id"
FROM "permission_group_permission" pgp
JOIN "permission" manage ON manage."id" = pgp."permission_id" AND manage."code" = 'perm.group.manage'
JOIN "permission" split ON split."code" IN ('perm.group.create', 'perm.group.update', 'perm.group.delete')
ON CONFLICT DO NOTHING;
DELETE FROM "permission" WHERE "code" = 'perm.group.manage';

-- perm.manage
INSERT INTO "permission" ("category", "name", "code")
SELECT "category", '수정 권한', 'perm.update' FROM "permission" WHERE "code" = 'perm.manage'
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "permission_group_permission" ("permission_group_id", "permission_id")
SELECT pgp."permission_group_id", split."id"
FROM "permission_group_permission" pgp
JOIN "permission" manage ON manage."id" = pgp."permission_id" AND manage."code" = 'perm.manage'
JOIN "permission" split ON split."code" IN ('perm.update')
ON CONFLICT DO NOTHING;
DELETE FROM "permission" WHERE "code" = 'perm.manage';
