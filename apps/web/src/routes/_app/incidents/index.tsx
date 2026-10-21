import { createFileRoute } from "@tanstack/react-router";
import { IncidentsPage } from "@features/incidents/IncidentsPage";

export const Route = createFileRoute("/_app/incidents/")({
  component: IncidentsPage,
});
