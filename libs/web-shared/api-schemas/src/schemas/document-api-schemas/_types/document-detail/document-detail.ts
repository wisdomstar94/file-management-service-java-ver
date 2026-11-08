import type { DocumentVersion } from "../document-version/index.js";

export type DocumentDetail = {
  id: string;
  name: string;
  /** `null` 이면 최신 버전을 따른다. */
  defaultVersionId: string | null;
  latestVersion: DocumentVersion;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
};
