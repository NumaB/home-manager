import { getReservationTextColor } from "@utils/colors";
import {
  layoutDateRangeWeekSegment,
  layoutWeekSegments,
  type CalendarDay,
} from "./calendar-date-utils";
import { formatDate } from "./calendar-formatters";
import type { Reservation, Translate } from "./calendar-types";

type CalendarWeekProps = {
  days: CalendarDay[];
  reservations: Reservation[];
  hoveredReservationId: string | null;
  onReservationHover: (reservationId: string | null) => void;
  locale: string;
  onSelect: (reservation: Reservation) => void;
  onDaySelect: (dateKey: string) => void;
  onDayPointerDown: (dateKey: string, pointerId: number) => void;
  previewRange: { startDate: string; endDate: string } | null;
  previewColor: string | null;
  isPointerDragging: boolean;
  t: Translate;
};

export function CalendarWeek({
  days,
  reservations,
  hoveredReservationId,
  onReservationHover,
  locale,
  onSelect,
  onDaySelect,
  onDayPointerDown,
  previewRange,
  previewColor,
  isPointerDragging,
  t,
}: CalendarWeekProps) {
  const segments = layoutWeekSegments(days, reservations);
  const previewSegment = previewRange
    ? layoutDateRangeWeekSegment(days, previewRange)
    : null;
  const hasPreviewBar = previewSegment !== null && previewColor !== null;
  const laneOffset = hasPreviewBar ? 1 : 0;
  const laneCount = segments.reduce(
    (maximum, segment) => Math.max(maximum, segment.lane + 1),
    0,
  );
  const rowHeight = Math.max(116, 34 + (laneCount + laneOffset) * 23 + 12);

  return (
    <div className="relative grid grid-cols-7" style={{ minHeight: rowHeight }}>
      {days.map((day) => (
        <button
          key={day.dateKey}
          className={`flex min-w-0 cursor-pointer items-start justify-start border-r border-b border-calendar-grid bg-transparent px-[4px] pt-[7px] text-left text-[14px] leading-none hover:bg-focused-background focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-focus-ring${day.inMonth ? " text-calendar-current-day" : " text-calendar-outside-day"}`}
          style={{ minHeight: rowHeight }}
          type="button"
          aria-label={formatDate(day.dateKey, locale)}
          data-calendar-date={day.dateKey}
          onPointerDown={(event) =>
            onDayPointerDown(day.dateKey, event.pointerId)
          }
          onClick={() => onDaySelect(day.dateKey)}
        >
          {day.date.getDate()}
        </button>
      ))}
      {hasPreviewBar && previewSegment && previewColor && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-20 h-[19px] rounded-[6px]"
          style={{
            left: `calc(${(previewSegment.startColumn / 7) * 100}% + 4px)`,
            width: `calc(${((previewSegment.endColumn - previewSegment.startColumn + 1) / 7) * 100}% - 8px)`,
            top: 30,
            backgroundColor: previewColor,
          }}
        />
      )}
      {segments.map(({ reservation, startColumn, endColumn, lane }) => {
        const isPending = reservation.status === "PENDING";
        const isHighlighted = hoveredReservationId === reservation.id;
        const displayName = reservation.title
          ? `${reservation.reservedFor.displayName} - ${reservation.title}`
          : reservation.reservedFor.displayName;
        const label = isPending
          ? `${displayName} ${reservation.approvals}/${reservation.totalEligibleVoters}`
          : displayName;
        return (
          <button
            key={`${reservation.id}-${days[0].dateKey}`}
            className={`absolute z-10 flex h-[19px] min-w-0 cursor-pointer items-center overflow-hidden rounded-[6px] border-0 px-2 text-left text-[11px] font-semibold leading-none shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-burgundy${isPointerDragging ? " pointer-events-none" : ""}${isHighlighted ? " z-20 brightness-145 shadow-lg ring-2 ring-reservation-hover-outline" : ""}`}
            style={{
              left: `calc(${(startColumn / 7) * 100}% + 3px)`,
              width: `calc(${((endColumn - startColumn + 1) / 7) * 100}% - 6px)`,
              top: 30 + (lane + laneOffset) * 23,
              backgroundColor: reservation.reservedFor.reservationColor,
              color: getReservationTextColor(
                reservation.reservedFor.reservationColor,
              ),
            }}
            type="button"
            aria-label={t("calendar.reservationLabel", {
              name: reservation.reservedFor.displayName,
              title: reservation.title ? `, ${reservation.title}` : "",
              start: formatDate(reservation.startDate, locale),
              end: formatDate(reservation.endDate, locale),
              approvalInfo: reservation.approvalEnabled
                ? t("calendar.reservationApprovalInfo", {
                    status: t(
                      `calendar.status.${reservation.status.toLowerCase()}`,
                    ),
                    approvals: reservation.approvals,
                    total: reservation.totalEligibleVoters,
                  })
                : "",
            })}
            onClick={() => onSelect(reservation)}
            onMouseEnter={() => onReservationHover(reservation.id)}
            onMouseLeave={() => onReservationHover(null)}
          >
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
