"use client";

import { createContext } from "react";
import type { PublicEnv } from "../../_types/public-env";

export const PublicEnvContext = createContext<PublicEnv>({ apiPublicUrl: "" });
