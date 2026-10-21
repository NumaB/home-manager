import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppHeader } from "./AppHeader";
import { AppMenu } from "../navigation/AppMenu";
import { BottomNavigation } from "../navigation/BottomNavigation";
import { useAppStore } from "@stores/app-store-provider";

export function AppLayout() {
  const menuOpen = useAppStore((state) => state.isMenuOpen);
  const closeMenu = useAppStore((state) => state.closeMenu);
  const toggleMenu = useAppStore((state) => state.toggleMenu);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen, closeMenu]);

  return (
    <div className="min-h-screen min-h-[100svh] pb-[calc(104px+env(safe-area-inset-bottom))] md:pb-[130px]">
      <AppHeader />
      <main className="mx-auto w-full max-w-[760px] px-6 pt-7 pb-11 md:pt-12">
        <Outlet />
      </main>
      {menuOpen && <AppMenu onClose={closeMenu} />}
      <BottomNavigation menuOpen={menuOpen} onMenuToggle={toggleMenu} />
    </div>
  );
}
