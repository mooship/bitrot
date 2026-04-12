import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { FontaineTransform } from "fontaine";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    FontaineTransform.vite({
      fallbacks: ["Arial", "sans-serif"],
      resolvePath: (id) => new URL(`./node_modules${id}`, import.meta.url),
    }),
  ],
});
