import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../../", "");
  const port = Number(env.WEB_PORT ?? 3000);

  return {
    plugins: [tailwindcss(), tanstackStart(), viteReact()],
    resolve: {
      alias: {
        "@components": fileURLToPath(
          new URL("./src/components", import.meta.url),
        ),
        "@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
      },
    },
    server: { host: "0.0.0.0", port },
    preview: { host: "0.0.0.0", port },
  };
});
