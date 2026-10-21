import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@components/PlaceholderPage";

export const Route = createFileRoute("/_app/incidents/")({
  component: IncidentPage,
});

function IncidentPage() {
  return <PlaceholderPage titleKey="pages.incidents" />;
}
