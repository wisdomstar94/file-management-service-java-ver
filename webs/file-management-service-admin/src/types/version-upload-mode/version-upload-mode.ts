import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";

export type VersionUploadMode =
  | { kind: "new-document" }
  | { kind: "new-version"; documentId: string }
  | {
      kind: "edit-version";
      documentId: string;
      version: ResBody<typeof DOCUMENT_DETAIL_API>["data"]["versions"][number];
    };
