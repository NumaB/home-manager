import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@components/PlaceholderPage";

export const Route = createFileRoute("/_app/inventory/")({
  component: InventoryPage,
});

function InventoryPage() {
  return <PlaceholderPage titleKey="pages.inventory" />;
}
