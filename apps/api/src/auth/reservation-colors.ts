// Liste des couleurs utilisée à l'initialisation d'un compte uniquement
// Pas dramatique si elle diverge de reservationPalette de utils/colors.js
export const RESERVATION_COLORS = [
  "#C72424",
  "#C74D24",
  "#C77524",
  "#C79E24",
  "#C7C724",
  "#9EC724",
  "#75C724",
  "#4DC724",
  "#24C724",
  "#24C74D",
  "#24C775",
  "#24C79E",
  "#24C7C7",
  "#249EC7",
  "#2475C7",
  "#244DC7",
  "#2424C7",
  "#4D24C7",
  "#7524C7",
  "#9E24C7",
  "#C724C7",
  "#C7249E",
  "#C72475",
  "#C7244D",
] as const;

export function randomReservationColor(): string {
  return RESERVATION_COLORS[
    Math.floor(Math.random() * RESERVATION_COLORS.length)
  ];
}
