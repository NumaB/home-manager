import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiRequestError, useApiClient } from "@lib/api-client";
import { buildCalendarWeeks } from "./calendar-date-utils";
import { CalendarWeek } from "./CalendarWeek";
import {
  currentMonthKey,
  formatMonth,
  shiftMonth,
} from "./calendar-formatters";
import { ReservationModal } from "./ReservationModal";
import type { CurrentMember, ModalState, Reservation } from "./calendar-types";

export function CalendarPage() {
  const { t, i18n } = useTranslation();
  const api = useApiClient();
  const [month, setMonth] = useState(currentMonthKey);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [member, setMember] = useState<CurrentMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState<ModalState | null>(null);

  const weeks = useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number);
    return buildCalendarWeeks(year, monthNumber - 1);
  }, [month]);
  const monthLabel = formatMonth(month, i18n.language);
  const weekDayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(i18n.language, { weekday: "short" })
        .format(new Date(2024, 0, 1 + index, 12))
        .replace(/\.$/, ""),
    );
  }, [i18n.language]);

  const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        // Synchronize the signed-in member before rendering reservations so the
        // API can return the latest profile name for this account.
        const currentMember = await api<CurrentMember>("auth/me");
        const items = await api<Reservation[]>(`reservations?month=${month}`);
        if (!cancelled) {
          setMember(currentMember);
          setReservations(items);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof ApiRequestError &&
              requestError.status === 401
              ? t("calendar.authRequired")
              : t("calendar.loadError"),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, month, refreshKey, t]);

  const goToPreviousMonth = () => setMonth((value) => shiftMonth(value, -1));
  const goToNextMonth = () => setMonth((value) => shiftMonth(value, 1));

  return (
    <section className="-mx-3" aria-labelledby="calendar-title">
      <header className="mb-4 flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <button
            className="grid size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-focused-background focus-visible:outline-2 focus-visible:outline-primary"
            type="button"
            aria-label={t("calendar.previousMonth")}
            onClick={goToPreviousMonth}
          >
            <span aria-hidden="true" className="text-[28px] leading-none">
              ‹
            </span>
          </button>
          <button
            className="grid size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-focused-background focus-visible:outline-2 focus-visible:outline-primary"
            type="button"
            aria-label={t("calendar.nextMonth")}
            onClick={goToNextMonth}
          >
            <span aria-hidden="true" className="text-[28px] leading-none">
              ›
            </span>
          </button>
          <h1
            id="calendar-title"
            className="m-0 truncate font-heading text-[clamp(19px,5.4vw,26px)] font-extrabold leading-tight tracking-[-0.045em] text-teal"
          >
            {monthLabel}
          </h1>
        </div>
        <button
          className="grid size-10 shrink-0 place-items-center rounded-full text-teal hover:bg-focused-background focus-visible:outline-2 focus-visible:outline-primary"
          type="button"
          aria-label={t("calendar.createReservation")}
          onClick={() => setModal({ type: "create" })}
        >
          <span
            aria-hidden="true"
            className="text-[34px] font-light leading-none"
          >
            +
          </span>
        </button>
      </header>

      {error && (
        <div
          className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-burgundy/20 bg-background px-3 py-2 text-sm text-burgundy"
          role="alert"
        >
          <span>{error}</span>
          <button
            className="font-semibold underline"
            type="button"
            onClick={reload}
          >
            {t("calendar.retry")}
          </button>
        </div>
      )}

      <div
        className="grid grid-cols-7 pb-2 text-center font-heading text-[15px] font-semibold text-burgundy"
        aria-hidden="true"
      >
        {weekDayLabels.map((label, index) => (
          <div key={`${index}-${label}`} className="truncate">
            {label}
          </div>
        ))}
      </div>

      <div
        className={`overflow-hidden border-l border-t border-[#211b18]${loading ? " opacity-60" : ""}`}
        aria-busy={loading}
        aria-label={t("calendar.monthView", { month: monthLabel })}
      >
        {weeks.map((days) => (
          <CalendarWeek
            key={days[0].dateKey}
            days={days}
            reservations={reservations}
            locale={i18n.language}
            onSelect={(reservation) =>
              setModal({ type: "details", reservation })
            }
            t={t}
          />
        ))}
      </div>
      {loading && (
        <p className="sr-only" role="status">
          {t("calendar.loading")}
        </p>
      )}

      {modal && member && (
        <ReservationModal
          key={modal.type === "create" ? "create" : modal.reservation.id}
          modal={modal}
          member={member}
          locale={i18n.language}
          api={api}
          t={t}
          onClose={() => setModal(null)}
          onChanged={() => {
            setModal(null);
            reload();
          }}
        />
      )}
    </section>
  );
}
