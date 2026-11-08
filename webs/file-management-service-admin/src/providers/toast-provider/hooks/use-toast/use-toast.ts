"use client";

import { useContext } from "react";
import { ToastContext } from "../../_contexts/toast-context";

export function useToast() {
  return useContext(ToastContext);
}
