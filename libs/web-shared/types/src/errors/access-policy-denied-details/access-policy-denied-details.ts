/** 접근 정책 차단 시 `details` 에 담기는 값. 차단 화면에 그대로 표시한다. */
export type AccessPolicyDeniedDetails = {
  accountLoginId?: string;
  accountNickname?: string;
  accessPolicyGroupName: string;
  failedReasons: string[];
  requestIp: string;
  requestedAt: string;
};
