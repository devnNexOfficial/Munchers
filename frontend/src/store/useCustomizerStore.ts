import { create } from 'zustand';

interface CustomizerState {
  selections: Record<string, { qty: number; [key: string]: any }>;
  setSelections: (selections: Record<string, any>) => void;
  setItemQuantity: (id: string, qty: number, ...args: any[]) => void;
  calculateSubtotal: (...args: any[]) => number;
  calculatePrepTime: (...args: any[]) => number;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  selections: {},
  setSelections: (selections) => set({ selections }),
  setItemQuantity: (id, qty) => set((state) => ({
    selections: {
      ...state.selections,
      [id]: { ...state.selections[id], qty }
    }
  })),
  calculateSubtotal: () => 0,
  calculatePrepTime: () => 0,
}));
