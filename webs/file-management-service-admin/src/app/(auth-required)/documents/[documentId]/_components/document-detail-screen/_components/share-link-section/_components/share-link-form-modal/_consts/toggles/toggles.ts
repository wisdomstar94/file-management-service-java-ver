export const TOGGLES = [
  {
    key: "isShowOtherVersions",
    label: "기본 버전 외 다른 버전 표시",
    description: "공개 페이지에 버전 목록을 보여줍니다.",
  },
  {
    key: "isAllowOtherVersionDownload",
    label: "다른 버전 다운로드 허용",
    description: "목록의 다른 버전도 내려받을 수 있습니다.",
  },
  {
    key: "isShowDownloadStatus",
    label: "다운로드 현황 표시",
    description: "현재 다운로드 수 / 허용 수를 공개 페이지에 표시합니다.",
  },
] as const;
