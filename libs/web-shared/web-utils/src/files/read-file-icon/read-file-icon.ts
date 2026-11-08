import { ICONS } from "./_consts/file-icons/index.js";

/** 파일명 확장자로 tabler 아이콘 클래스와 색을 고른다. 모르는 확장자는 일반 파일 아이콘 */
export function readFileIcon(fileName: string): { icon: string; color: string } {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const matched = ICONS.find((item) => item.extensions.includes(extension));
  return matched ? { icon: matched.icon, color: matched.color } : { icon: "ti-file", color: "#5b6270" };
}
