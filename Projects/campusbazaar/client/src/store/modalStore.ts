import { create } from "zustand";

export type ModalKey =
  | "create-listing"
  | "edit-listing"
  | "delete-listing"
  | "report"
  | "share"
  | "filter"
  | "auth"
  | "qr"
  | null;

interface ModalState {
  active: ModalKey;
  data: unknown;
  open: (key: Exclude<ModalKey, null>, data?: unknown) => void;
  close: () => void;
  isOpen: (key: ModalKey) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  active: null,
  data: null,
  open: (key, data) => set({ active: key, data }),
  close: () => set({ active: null, data: null }),
  isOpen: (key) => get().active === key,
}));
