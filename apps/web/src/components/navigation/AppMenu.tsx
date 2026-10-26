import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Icons } from "../Icons";
import { navigationItems } from "./navigationItems";

type AppMenuProps = {
  onClose: () => void;
};

export function AppMenu({ onClose }: AppMenuProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-[15] flex animate-fade-in items-end justify-center bg-black/[0.35] px-3 pt-4 pb-[calc(94px+env(safe-area-inset-bottom))] md:pb-[116px]"
      onClick={onClose}
      role="presentation"
    >
      <aside
        id="app-menu"
        className="max-h-[min(72vh,620px)] w-full max-w-[520px] animate-rise-in overflow-y-auto rounded-[22px] border border-burgundy/[0.12] bg-light-background px-5 pt-[22px] pb-[18px] shadow-[0_18px_50px_rgb(28_20_11_/_20%)]"
        aria-label={t("navigation.menuLabel")}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-[14px] flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-burgundy">
              {t("navigation.section")}
            </p>
            <h2 className="m-0 font-heading text-[27px] font-extrabold tracking-[-0.055em] text-primary">
              {t("navigation.menuTitle")}
            </h2>
          </div>
          <button
            className="grid size-[42px] cursor-pointer place-items-center rounded-full bg-light-background text-burgundy focus-visible:bg-focused-background focus-visible:outline-3 focus-visible:outline-[#bf7d00] focus-visible:outline-offset-[3px]"
            type="button"
            aria-label={t("navigation.closeMenu")}
            onClick={onClose}
          >
            <Icons name="close" />
          </button>
        </div>
        <nav className="grid" aria-label={t("navigation.allPages")}>
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex min-h-12 items-center justify-between gap-3 border-b border-burgundy/10 font-semibold text-secondary no-underline focus-visible:outline-3 focus-visible:outline-[#bf7d00] focus-visible:outline-offset-[3px]"
              activeProps={{
                className:
                  "flex min-h-12 items-center justify-between gap-3 border-b border-burgundy/10 font-semibold text-primary no-underline focus-visible:outline-3 focus-visible:outline-[#bf7d00] focus-visible:outline-offset-[3px]",
              }}
              onClick={onClose}
            >
              {t(item.label)}
              <span
                className="text-[25px] font-normal text-burgundy"
                aria-hidden="true"
              >
                ›
              </span>
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-[13px] text-muted">
          {t("navigation.moreSections")}
        </p>
      </aside>
    </div>
  );
}
