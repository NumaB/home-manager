import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCalendarWeeks,
  dateKey,
  layoutWeekSegments,
} from "./calendar-date-utils";

test("builds Monday-to-Sunday rows including adjacent month days", () => {
  const weeks = buildCalendarWeeks(2026, 11);
  assert.equal(weeks.length, 5);
  assert.deepEqual(
    weeks[0].map(({ date }) => date.getDay()),
    [1, 2, 3, 4, 5, 6, 0],
  );
  assert.equal(weeks[0][0].dateKey, "2026-11-30");
  assert.equal(weeks[4][6].dateKey, "2027-01-03");
  assert.equal(weeks[0][0].inMonth, false);
  assert.equal(weeks[0][1].inMonth, true);
});

test("uses six week rows when the month needs them", () => {
  assert.equal(buildCalendarWeeks(2026, 7).length, 6);
});

test("lays out overlapping reservations on separate lanes and clips to the week", () => {
  const days = buildCalendarWeeks(2026, 11)[2];
  const segments = layoutWeekSegments(days, [
    { id: "a", startDate: "2026-12-14", endDate: "2026-12-19" },
    { id: "b", startDate: "2026-12-19", endDate: "2026-12-20" },
    { id: "c", startDate: "2026-12-01", endDate: "2026-12-15" },
  ]);
  assert.equal(segments.length, 3);
  assert.deepEqual(
    segments.map(({ reservation, startColumn, endColumn, lane }) => ({
      id: reservation.id,
      startColumn,
      endColumn,
      lane,
    })),
    [
      { id: "a", startColumn: 0, endColumn: 5, lane: 0 },
      { id: "c", startColumn: 0, endColumn: 1, lane: 1 },
      { id: "b", startColumn: 5, endColumn: 6, lane: 1 },
    ],
  );
});

test("formats local calendar days as ISO date keys", () => {
  assert.equal(dateKey(new Date(2026, 11, 1, 12)), "2026-12-01");
});
