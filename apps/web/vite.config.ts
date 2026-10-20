import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../../", "");
  const port = Number(env.WEB_PORT ?? 3000);

  return {
    plugins: [tanstackStart(), viteReact()],
    server: { host: "0.0.0.0", port },
    preview: { host: "0.0.0.0", port },
  };
});
