#!/usr/bin/node

/*!
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { execSync } from "child_process";
import esbuild from "esbuild";
import { readdirSync } from "fs";
import { performance } from "perf_hooks";

/**
 * @type {esbuild.WatchMode|false}
 */
const watch = process.argv.includes("--watch")
  ? {
      onRebuild: (err) => {
        if (err) console.error("Build Error", err.message);
        else console.log("Rebuilt!");
      },
    }
  : false;

// https://github.com/evanw/esbuild/issues/619#issuecomment-751995294
/**
 * @type {esbuild.Plugin}
 */
const makeAllPackagesExternalPlugin = {
  name: "make-all-packages-external",
  setup(build) {
    let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/; // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};

/**
 * @type {esbuild.Plugin}
 */
const globPlugins = {
  name: "glob-plugins",
  setup: (build) => {
    build.onResolve({ filter: /^plugins$/ }, (args) => {
      return {
        namespace: "import-plugins",
        path: args.path,
      };
    });

    build.onLoad({ filter: /^plugins$/, namespace: "import-plugins" }, () => {
      const files = readdirSync("./src/plugins");
      let code = "";
      let obj = "";
      for (let i = 0; i < files.length; i++) {
        if (files[i] === "index.ts") {
          continue;
        }
        const mod = `__pluginMod${i}`;
        code += `import ${mod} from "./${files[i].replace(".ts", "")}";\n`;
        obj += `[${mod}.name]: ${mod},`;
      }
      code += `export default {${obj}}`;
      return {
        contents: code,
        resolveDir: "./src/plugins",
      };
    });
  },
};

const gitHash = execSync("git rev-parse --short HEAD", {
  encoding: "utf-8",
}).trim();
/**
 * @type {esbuild.Plugin}
 */
const gitHashPlugin = {
  name: "git-hash-plugin",
  setup: (build) => {
    const filter = /^git-hash$/;
    build.onResolve({ filter }, (args) => ({
      namespace: "git-hash",
      path: args.path,
    }));
    build.onLoad({ filter, namespace: "git-hash" }, () => ({
      contents: `export default "${gitHash}"`,
    }));
  },
};

const begin = performance.now();
await Promise.allSettled([
  esbuild.build({
    entryPoints: ["src/preload.ts"],
    outfile: "dist/preload.js",
    format: "cjs",
    bundle: true,
    platform: "node",
    target: ["esnext"],
    sourcemap: "linked",
    plugins: [makeAllPackagesExternalPlugin],
  }),
  esbuild.build({
    entryPoints: ["src/patcher.ts"],
    outfile: "dist/patcher.js",
    bundle: true,
    format: "cjs",
    target: ["esnext"],
    external: ["electron"],
    platform: "node",
    sourcemap: "linked",
    plugins: [makeAllPackagesExternalPlugin],
  }),
])
  .then((res) => {
    const took = performance.now() - begin;
    console.log(`Built in ${took.toFixed(2)}ms`);
  })
  .catch((err) => {
    console.error("Build failed");
    console.error(err.message);
  });

if (watch) console.log("Watching...");
