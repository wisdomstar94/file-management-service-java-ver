# shared-consts

서버(Java) 와 웹(TS) 이 **함께 지켜야 하는 상수의 단일 원본** 입니다. 값은 여기 JSON 에서만 고칩니다.

| 파일 | 생성되는 TS (`@fms/consts`) | 생성되는 Java (`libs/server-shared/server-consts`) |
| --- | --- | --- |
| `permission-code-registry.json` | `PERMISSION_CODE_REGISTRY` | `PermissionCode` enum · `PermissionCodeRegistry` |
| `api-error-code.json` | `API_ERROR_CODE` | `ApiErrorCode` enum |
| `admin-auth-cookie-names.json` | `ADMIN_ACCESS_TOKEN_COOKIE` · `ADMIN_REFRESH_TOKEN_COOKIE` | `AdminAuthCookieNames` |
| `access-policy-tree-max-depth.json` | `ACCESS_POLICY_TREE_MAX_DEPTH` | `AccessPolicyTreeMaxDepth` |
| `jwt-audiences.json` | `ADMIN_ACCESS_TOKEN_AUDIENCE` | `JwtAudiences` |

- TS : `yarn contracts:generate` 로 `libs/web-shared/consts/src/**` 를 다시 만듭니다. 생성 파일은 저장소에 올리고, `yarn lint:check` 가 JSON 과 어긋나지 않았는지 검사합니다.
- Java : Gradle 빌드가 `:libs:server-shared:server-consts` 를 컴파일할 때마다 `build/generated` 에 만듭니다. 별도 명령이 필요 없습니다.
- 권한 코드를 추가하면 TS · Java 양쪽에서 바로 쓸 수 있고, 없는 코드를 쓰면 양쪽 모두 컴파일 에러가 납니다.
