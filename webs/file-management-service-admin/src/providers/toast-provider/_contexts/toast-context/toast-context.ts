"use client";

import { createContext } from "react";
import type { Toast } from "../../_types/toast";

export const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => undefined);
