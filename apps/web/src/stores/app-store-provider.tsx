import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { createAppStore, type AppStore, type AppStoreState } from "./app-store";

const AppStoreContext = createContext<StoreApi<AppStore> | null>(null);

type AppStoreProviderProps = {
  children: ReactNode;
  initialState?: Partial<AppStoreState>;
};

export function AppStoreProvider({
  children,
  initialState,
}: AppStoreProviderProps) {
  const [store] = useState(() => createAppStore(initialState));

  return (
    <AppStoreContext.Provider value={store}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (state: AppStore) => T): T {
  const store = useContext(AppStoreContext);

  if (!store) {
    throw new Error("useAppStore doit être utilisé dans un AppStoreProvider");
  }

  return useStore(store, selector);
}
