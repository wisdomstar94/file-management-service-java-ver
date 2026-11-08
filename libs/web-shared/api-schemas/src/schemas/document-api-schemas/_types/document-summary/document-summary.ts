import type { DocumentVersionSummary } from "../document-version-summary/index.js";

export type DocumentSummary = {
  id: string;
  name: string;
  versionCount: number;
  latestVersion: DocumentVersionSummary;
  /** 목록의 파일 형식 아이콘을 고르는 데 쓴다. */
  latestVersionFileName: string;
  /** `null` 이면 최신 버전을 따른다. */
  fixedDefaultVersion: DocumentVersionSummary | null;
  createdAt: string;
  latestVersionCreatedAt: string;
};
