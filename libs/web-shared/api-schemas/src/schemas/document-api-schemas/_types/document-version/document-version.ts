export type DocumentVersion = {
  id: string;
  seq: number;
  versionName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isLatest: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
