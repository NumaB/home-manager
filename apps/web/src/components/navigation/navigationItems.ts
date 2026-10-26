import type { IconName } from "../Icons";

export const navigationItems = [
  { to: "/", label: "navigation.calendar", icon: "calendar" },
  { to: "/checklist", label: "navigation.checklist", icon: "checklist" },
  { to: "/incidents", label: "navigation.declareIncident", icon: "tools" },
  { to: "/inventory", label: "navigation.inventory", icon: "inventory" },
  { to: "/stocks", label: "navigation.stocks", icon: "stocks" },
  { to: "/gallery", label: "navigation.gallery", icon: "gallery" },
] as const satisfies readonly {
  to: string;
  label: string;
  icon: IconName;
}[];
