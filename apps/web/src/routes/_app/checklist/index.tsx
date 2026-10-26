import { createFileRoute } from "@tanstack/react-router";
import { ChecklistPage } from "@features/checklist/ChecklistPage";

export const Route = createFileRoute("/_app/checklist/")({
  component: ChecklistPage,
});
