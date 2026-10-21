import { createFileRoute } from "@tanstack/react-router";
import { StocksPage } from "@features/stocks/StocksPage";

export const Route = createFileRoute("/_app/stocks/")({
  component: StocksPage,
});
