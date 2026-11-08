export type CreateShareLinkBody = {
  accessPolicyGroupId: string | null;
  /** 문자열이면 그 비밀번호로 설정, `null` 이면 비밀번호 해제. 수정 시 생략하면 기존 값 유지 */
  password: string | null;
  maxDownloadCount: number | null;
  /** offset 을 포함한 ISO 8601 일시 */
  availableFrom: string | null;
  /** offset 을 포함한 ISO 8601 일시 */
  availableUntil: string | null;
  defaultVersionMode: "FOLLOW_DOCUMENT" | "FIXED";
  fixedVersionId: string | null;
  isShowOtherVersions: boolean;
  isAllowOtherVersionDownload: boolean;
  isShowDownloadStatus: boolean;
};
