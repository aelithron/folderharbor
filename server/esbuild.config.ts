import * as esbuild from "esbuild";
await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  sourcemap: false,
  packages: "external",
  outfile: "dist/index.js",
  format: "cjs",
  platform: "node"
});