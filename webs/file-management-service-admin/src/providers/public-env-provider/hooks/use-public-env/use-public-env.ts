"use client";

import { useContext } from "react";
import { PublicEnvContext } from "../../_contexts/public-env-context";

export function usePublicEnv() {
  return useContext(PublicEnvContext);
}
