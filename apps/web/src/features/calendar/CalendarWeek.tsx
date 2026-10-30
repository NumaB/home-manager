import { layoutWeekSegments, type CalendarDay } from "./calendar-date-utils";
import { formatDate } from "./calendar-formatters";
import type { Reservation, Translate } from "./calendar-types";

type CalendarWeekProps = {
  days: CalendarDay[];
  reservations: Reservation[];
  locale: string;
  onSelect: (reservation: Reservation) => void;
  t: Translate;
};

export function CalendarWeek({
  days,
  reservations,
  locale,
  onSelect,
  t,
}: CalendarWeekProps) {
  const segments = layoutWeekSegments(days, reservations);
  const laneCount = segments.reduce(
    (maximum, segment) => Math.max(maximum, segment.lane + 1),
    0,
  );
  const rowHeight = Math.max(116, 34 + laneCount * 23 + 12);

  return (
    <div className="relative grid grid-cols-7" style={{ minHeight: rowHeight }}>
      {days.map((day) => (
        <div
          key={day.dateKey}
          className={`min-w-0 border-r border-b border-[#211b18] px-[4px] pt-[7px] text-[14px] leading-none${day.inMonth ? " text-[#211b18]" : " text-[#aaa397]"}`}
          style={{ minHeight: rowHeight }}
          aria-label={formatDate(day.dateKey, locale)}
        >
          {day.date.getDate()}
        </div>
      ))}
      {segments.map(({ reservation, startColumn, endColumn, lane }) => {
        const isPending = reservation.status === "PENDING";
        const label = isPending
          ? `${reservation.creator.displayName} ${reservation.approvals}/${reservation.totalEligibleVoters}`
          : reservation.creator.displayName;
        return (
          <button
            key={`${reservation.id}-${days[0].dateKey}`}
            className={`absolute z-10 flex h-[19px] min-w-0 items-center overflow-hidden rounded-[6px] px-2 text-left text-[11px] font-semibold leading-none shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-burgundy ${isPending ? "bg-[#98c774] text-[#173b2d]" : "bg-teal text-white"}`}
            style={{
              left: `calc(${(startColumn / 7) * 100}% + 3px)`,
              width: `calc(${((endColumn - startColumn + 1) / 7) * 100}% - 6px)`,
              top: 30 + lane * 23,
            }}
            type="button"
            aria-label={t("calendar.reservationLabel", {
              name: reservation.creator.displayName,
              start: formatDate(reservation.startDate, locale),
              end: formatDate(reservation.endDate, locale),
              status: t(`calendar.status.${reservation.status.toLowerCase()}`),
              approvals: reservation.approvals,
              total: reservation.totalEligibleVoters,
            })}
            onClick={() => onSelect(reservation)}
          >
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
