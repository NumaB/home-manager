import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppHeader } from "./AppHeader";
import { AppMenu } from "../navigation/AppMenu";
import { BottomNavigation } from "../navigation/BottomNavigation";
import { SideNavigation } from "../navigation/SideNavigation";
import { useAppStore } from "@stores/app-store-provider";
import { MemberSessionSync } from "../auth/MemberSessionSync";

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
    <div className="min-h-screen min-h-[100svh] bg-light-background pb-[calc(104px+env(safe-area-inset-bottom))] md:flex md:pb-0">
      <SideNavigation />
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main className="mx-auto w-full max-w-[760px] px-6 pt-7 pb-11 md:max-w-[1040px] md:px-10 md:pt-10">
          <MemberSessionSync />
          <Outlet />
        </main>
      </div>
      {menuOpen && (
        <div className="md:hidden">
          <AppMenu onClose={closeMenu} />
        </div>
      )}
      <BottomNavigation menuOpen={menuOpen} onMenuToggle={toggleMenu} />
    </div>
  );
}
