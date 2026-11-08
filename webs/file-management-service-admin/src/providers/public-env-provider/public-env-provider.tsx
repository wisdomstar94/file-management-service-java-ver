"use client";

import type { ReactNode } from "react";
import { PublicEnvContext } from "./_contexts/public-env-context";
import type { PublicEnv } from "./_types/public-env";

export function PublicEnvProvider(props: { env: PublicEnv; children: ReactNode }) {
  return <PublicEnvContext value={props.env}>{props.children}</PublicEnvContext>;
}
