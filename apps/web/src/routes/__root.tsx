import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AppStoreProvider } from "@stores/app-store-provider";
import "../i18n";
import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#f7ecd5" },
      { title: "Home Manager" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppStoreProvider>
          <Outlet />
        </AppStoreProvider>
        <Scripts />
      </body>
    </html>
  );
}
