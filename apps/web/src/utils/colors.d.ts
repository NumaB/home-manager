declare const colors: {
  reservationTextDark: string;
  reservationTextLight: string;
};

export const reservationPalette: Array<{ nameKey: string; hex: string }>;
export function getReservationTextColor(hex: string): string;
export default colors;
