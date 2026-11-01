import { createStore } from "zustand/vanilla";

export type AppStoreState = {
  isMenuOpen: boolean;
  memberDisplayName: string | null;
};

export type AppStore = AppStoreState & {
  openMenu: () => void;
  setMemberDisplayName: (displayName: string | null) => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

export function createAppStore(initialState: Partial<AppStoreState> = {}) {
  return createStore<AppStore>()((set) => ({
    isMenuOpen: initialState.isMenuOpen ?? false,
    memberDisplayName: initialState.memberDisplayName ?? null,
    openMenu: () => set({ isMenuOpen: true }),
    setMemberDisplayName: (memberDisplayName) => set({ memberDisplayName }),
    closeMenu: () => set({ isMenuOpen: false }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  }));
}
