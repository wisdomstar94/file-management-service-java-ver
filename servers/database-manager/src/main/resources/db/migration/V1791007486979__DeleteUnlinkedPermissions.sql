-- 권한 생성 기능을 없애면서, 그 전에 관리자가 만든 코드 미연동 권한을 지운다. 지운 행은 되살릴 수 없다.
-- 마이그레이션은 실행 시점의 코드와 무관하게 같은 결과를 내야 하므로 권한 레지스트리를 참조하지 않고 값을 고정한다.
DELETE FROM "permission" WHERE "code" NOT IN (
  'file.list.access',
  'file.list.create',
  'file.list.delete',
  'file.detail.access',
  'file.detail.update',
  'file.detail.version.create',
  'file.detail.version.update',
  'file.detail.link.create',
  'file.detail.link.update',
  'file.detail.link.delete',
  'account.access',
  'account.create',
  'account.update',
  'account.delete',
  'policy.access',
  'policy.create',
  'policy.update',
  'policy.delete',
  'perm.group.access',
  'perm.group.create',
  'perm.group.update',
  'perm.group.delete',
  'perm.access',
  'perm.update'
);
