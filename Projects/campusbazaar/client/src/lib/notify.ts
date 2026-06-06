import { useToastStore } from "@/store/toastStore";
import type { ToastVariant } from "@/store/toastStore";

const push = (type: ToastVariant) => (title: string, body?: string) =>
  useToastStore.getState().push({ type, title, body });

export const toast = {
  info: push("info"),
  success: push("success"),
  warning: push("warning"),
  danger: push("danger"),
  neutral: push("neutral"),
};
