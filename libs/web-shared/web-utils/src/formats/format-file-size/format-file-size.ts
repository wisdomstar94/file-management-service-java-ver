import { UNITS } from "./_consts/file-size-units/index.js";

/**
 * 바이트 수를 `18.4 MB` 처럼 1024 단위로 읽기 쉽게 바꿉니다.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(1)} ${UNITS[unitIndex]}`;
}
