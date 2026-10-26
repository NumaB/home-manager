import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Icons } from "../Icons";

type BottomNavigationProps = {
  menuOpen: boolean;
  onMenuToggle: () => void;
};

export function BottomNavigation({
  menuOpen,
  onMenuToggle,
}: BottomNavigationProps) {
  const { t } = useTranslation();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto grid min-h-[82px] w-full max-w-[760px] grid-cols-4 gap-[5px] rounded-t-[18px] border-t border-burgundy/10 bg-paper-light px-[18px] pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-4px_15px_rgb(78_55_20_/_8%)] md:hidden"
      aria-label={t("navigation.main")}
    >
      <BottomNavLink
        to="/"
        label={t("navigation.calendar")}
        active={pathname === "/"}
      >
        <Icons name="calendar" width={30} />
      </BottomNavLink>
      <BottomNavLink
        to="/checklist"
        label={t("navigation.checklist")}
        active={pathname === "/checklist"}
      >
        <Icons name="checklist" width={30} />
      </BottomNavLink>
      <BottomNavLink
        to="/incidents"
        label={t("navigation.incidents")}
        active={pathname === "/incidents"}
      >
        <Icons name="tools" width={30} />
      </BottomNavLink>
      <button
        className={`grid min-w-0 min-h-[54px] place-items-center self-center rounded-[13px] cursor-pointer text-[#493d33] transition-[background-color,color,transform] duration-[140ms] hover:-translate-y-px hover:bg-[#f3e4ca] focus-visible:outline-3 focus-visible:outline-[#bf7d00] focus-visible:outline-offset-[3px]${menuOpen ? " bg-[#f3e4ca] text-teal" : ""}`}
        type="button"
        aria-label={t("navigation.openMenu")}
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? "app-menu" : undefined}
        onClick={onMenuToggle}
      >
        <Icons name="menu" />
      </button>
    </nav>
  );
}

type BottomNavLinkProps = {
  to: "/" | "/checklist" | "/incidents";
  label: string;
  active: boolean;
  children: React.ReactNode;
};

function BottomNavLink({ to, label, active, children }: BottomNavLinkProps) {
  return (
    <Link
      to={to}
      className={`grid min-w-0 min-h-[54px] place-items-center self-center rounded-[13px] cursor-pointer text-[#493d33] no-underline transition-[background-color,color,transform] duration-[140ms] hover:-translate-y-px hover:bg-[#f3e4ca] focus-visible:outline-3 focus-visible:outline-[#bf7d00] focus-visible:outline-offset-[3px]${active ? " bg-[#f3e4ca] text-teal" : ""}`}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
