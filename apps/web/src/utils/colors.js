const colors = {
  background: "#F7DFB2",
  lightBackground: "#FFF3DF",
  focusedBackground: "#FAF0DC",
  primary: "#006849",
  lightPrimary: "#9BC472",
  secondary: "#493D33",
  focusRing: "#bf7d00",

  // Calendrier
  calendarGrid: "#211b18",
  calendarCurrentDay: "#211b18",
  calendarOutsideDay: "#aaa397",
  pendingReservation: "#98c774",
  pendingReservationText: "#173b2d",
  reservationHoverOutline: "#000000",
  reservationTextDark: "#211B18",
  reservationTextLight: "#FFFFFF",

  // Paramètres de compte
  displayNameInputBackground: "#FFFFFF",
};

export const reservationPalette = [
  { nameKey: "red", hex: "#C72424" },
  { nameKey: "vermilion", hex: "#C74D24" },
  { nameKey: "orange", hex: "#C77524" },
  { nameKey: "amber", hex: "#C79E24" },
  { nameKey: "yellow", hex: "#C7C724" },
  { nameKey: "chartreuse", hex: "#9EC724" },
  { nameKey: "lime", hex: "#75C724" },
  { nameKey: "springGreen", hex: "#4DC724" },
  { nameKey: "green", hex: "#24C724" },
  { nameKey: "emerald", hex: "#24C74D" },
  { nameKey: "mint", hex: "#24C775" },
  { nameKey: "turquoise", hex: "#24C79E" },
  { nameKey: "cyan", hex: "#24C7C7" },
  { nameKey: "iceBlue", hex: "#249EC7" },
  { nameKey: "azure", hex: "#2475C7" },
  { nameKey: "royalBlue", hex: "#244DC7" },
  { nameKey: "blue", hex: "#2424C7" },
  { nameKey: "indigo", hex: "#4D24C7" },
  { nameKey: "violet", hex: "#7524C7" },
  { nameKey: "purple", hex: "#9E24C7" },
  { nameKey: "magenta", hex: "#C724C7" },
  { nameKey: "fuchsia", hex: "#C7249E" },
  { nameKey: "pink", hex: "#C72475" },
  { nameKey: "raspberry", hex: "#C7244D" },
];

export function getReservationTextColor(hex) {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = [red, green, blue]
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (total, channel, index) =>
        total + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );
  const darkContrast = (luminance + 0.05) / 0.05;
  const lightContrast = 1.05 / (luminance + 0.05);
  return darkContrast >= lightContrast
    ? colors.reservationTextDark
    : colors.reservationTextLight;
}

export default colors;
