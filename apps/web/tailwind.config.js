import colors from "./src/utils/colors.js";

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        background: colors.background,
        "light-background": colors.lightBackground,
        "focused-background": colors.focusedBackground,
        primary: colors.primary,
        "light-primary": colors.lightPrimary,
        secondary: colors.secondary,
        "calendar-grid": colors.calendarGrid,
        "calendar-current-day": colors.calendarCurrentDay,
        "calendar-outside-day": colors.calendarOutsideDay,
        "pending-reservation": colors.pendingReservation,
        "pending-reservation-text": colors.pendingReservationText,
        "reservation-hover-outline": colors.reservationHoverOutline,
      },
    },
  },
};
