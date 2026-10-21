import { createStore } from "zustand/vanilla";

export type AppStoreState = {
  isMenuOpen: boolean;
};

export type AppStore = AppStoreState & {
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

export function createAppStore(initialState: Partial<AppStoreState> = {}) {
  return createStore<AppStore>()((set) => ({
    isMenuOpen: initialState.isMenuOpen ?? false,
    openMenu: () => set({ isMenuOpen: true }),
    closeMenu: () => set({ isMenuOpen: false }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  }));
}
