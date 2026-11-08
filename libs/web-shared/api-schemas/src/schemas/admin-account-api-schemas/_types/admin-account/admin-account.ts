export type AdminAccount = {
  id: string;
  loginId: string;
  nickname: string;
  memo: string;
  permissionGroup: { id: string; name: string };
  accessPolicyGroup: { id: string; name: string };
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
