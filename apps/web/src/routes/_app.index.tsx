import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@components/PlaceholderPage";

export const Route = createFileRoute("/_app/")({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <PlaceholderPage
      titleKey="pages.calendar"
      descriptionKey="pages.calendarDescription"
    />
  );
}
