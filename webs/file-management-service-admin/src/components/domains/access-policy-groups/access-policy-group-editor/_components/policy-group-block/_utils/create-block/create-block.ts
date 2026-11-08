import type { EditorBlock } from "../../../../_types/editor-block";
import { createKey } from "../../../../_utils/create-key";

export const createBlock = (kind: EditorBlock["kind"]): EditorBlock => {
  if (kind === "IP") {
    return { kind, key: createKey(), mode: "DENY_ALL_EXCEPT", cidrs: [""] };
  }
  if (kind === "HEADERS") {
    return { kind, key: createKey(), rows: [{ key: createKey(), name: "", matchType: "EQUALS", value: "" }] };
  }
  return { kind, key: createKey(), operator: "AND", children: [] };
};
