export const BLOCK_META = {
  IP: { icon: "ti-world", title: "IP 제한", description: "요청 IP 기준으로 허용 · 차단합니다. CIDR 표기 지원." },
  HEADERS: {
    icon: "ti-code",
    title: "특정 헤더 제한",
    description: "요청 헤더 값이 조건과 모두 맞을 때만 통과합니다.",
  },
  GROUP: {
    icon: "ti-brackets",
    title: "하위 조건 그룹",
    description: "괄호로 묶은 조건입니다. 결합 방식을 따로 정합니다.",
  },
};
