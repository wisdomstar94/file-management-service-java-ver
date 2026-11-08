export type CreateAdminAccountBody = {
  loginId: string;
  password: string;
  nickname: string;
  memo?: string;
  permissionGroupId: string;
  accessPolicyGroupId: string;
};
