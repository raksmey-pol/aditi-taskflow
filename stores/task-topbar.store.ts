import React from "react";
import { create } from "zustand";

interface TopBarStore {
  actions: React.ReactNode | null;
  total_tasks: React.ReactNode;
  setActions: (data: {actions?: React.ReactNode | null, total_tasks?: React.ReactNode | null}) => void;
  clearTopBar: () => void;
}

export const useTopBarStore = create<TopBarStore>((set) => ({
  actions: null,
  total_tasks: null,
  setActions: (data) => set((state) => ({...state, ...data  })),
  clearTopBar: () => set({ actions: null, total_tasks: null }),
}));
