import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@components/PlaceholderPage";

export const Route = createFileRoute("/_app/checklist/")({
  component: ChecklistPage,
});

function ChecklistPage() {
  return <PlaceholderPage titleKey="pages.checklist" />;
}
