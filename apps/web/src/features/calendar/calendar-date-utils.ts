export type CalendarReservation = {
  id: string;
  startDate: string;
  endDate: string;
};

export type CalendarDay = {
  date: Date;
  dateKey: string;
  inMonth: boolean;
};

export type CalendarSegment<T extends CalendarReservation> = {
  reservation: T;
  startColumn: number;
  endColumn: number;
  lane: number;
};

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function buildCalendarWeeks(
  year: number,
  monthIndex: number,
): CalendarDay[][] {
  const firstOfMonth = new Date(year, monthIndex, 1, 12);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const firstCalendarDay = new Date(year, monthIndex, 1 - mondayOffset, 12);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const weekCount = Math.ceil((mondayOffset + daysInMonth) / 7);

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(
        firstCalendarDay.getFullYear(),
        firstCalendarDay.getMonth(),
        firstCalendarDay.getDate() + weekIndex * 7 + dayIndex,
        12,
      );
      return {
        date,
        dateKey: dateKey(date),
        inMonth: date.getMonth() === monthIndex,
      };
    }),
  );
}

export function layoutWeekSegments<T extends CalendarReservation>(
  days: readonly CalendarDay[],
  reservations: readonly T[],
): CalendarSegment<T>[] {
  if (days.length === 0) return [];
  const first = days[0].dateKey;
  const last = days[days.length - 1].dateKey;
  const candidates = reservations
    .filter(
      (reservation) =>
        reservation.startDate <= last && reservation.endDate >= first,
    )
    .map((reservation) => ({
      reservation,
      startColumn: Math.max(
        0,
        Math.round(
          (parseDateKey(reservation.startDate).getTime() -
            days[0].date.getTime()) /
            86_400_000,
        ),
      ),
      endColumn: Math.min(
        6,
        Math.round(
          (parseDateKey(reservation.endDate).getTime() -
            days[0].date.getTime()) /
            86_400_000,
        ),
      ),
    }))
    .sort(
      (a, b) =>
        a.startColumn - b.startColumn ||
        b.endColumn - a.endColumn ||
        a.reservation.id.localeCompare(b.reservation.id),
    );

  const laneEnds: number[] = [];
  return candidates.map((candidate) => {
    let lane = laneEnds.findIndex(
      (endColumn) => endColumn < candidate.startColumn,
    );
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = candidate.endColumn;
    return { ...candidate, lane };
  });
}
