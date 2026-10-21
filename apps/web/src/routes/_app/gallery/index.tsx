import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@components/PlaceholderPage";

export const Route = createFileRoute("/_app/gallery/")({
  component: GalleryPage,
});

function GalleryPage() {
  return <PlaceholderPage titleKey="pages.gallery" />;
}
