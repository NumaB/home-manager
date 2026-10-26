import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Icons } from "../Icons";
import { navigationItems } from "./navigationItems";

export function SideNavigation() {
  const { t } = useTranslation();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-burgundy/10 bg-background px-5 py-7 md:flex">
      <div className="mb-10 flex items-center gap-3 px-2 text-primary">
        <span
          className="grid size-[38px] shrink-0 place-items-center rounded-[11px_11px_11px_3px] border-[1.5px] border-light-primary font-heading text-[13px] font-extrabold tracking-[-0.08em]"
          aria-hidden="true"
        >
          {t("app.shortName")}
        </span>
        <span className="font-heading text-[17px] font-extrabold tracking-[-0.03em]">
          {t("app.name")}
        </span>
      </div>

      <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        {t("navigation.section")}
      </p>
      <nav className="grid gap-1" aria-label={t("navigation.main")}>
        {navigationItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold no-underline transition-colors hover:bg-focused-background focus-visible:bg-focused-background focus-visible:outline-3 focus-visible:outline-[#bf7d00] focus-visible:outline-offset-2 ${active ? "bg-focused-background text-primary" : "text-secondary"}`}
              aria-current={active ? "page" : undefined}
            >
              <Icons name={item.icon} width={22} className="shrink-0" />
              <span>{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
