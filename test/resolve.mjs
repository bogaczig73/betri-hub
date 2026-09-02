/**
 * Module-resolution hook for `node --test`, registered by `test/setup.mjs`.
 *
 * Node's ESM resolver has no notion of tsconfig `paths`, and it will not add a
 * `.ts` extension to an extensionless specifier. The app's source uses both
 * (`@/lib/format`, `./bspline`) because a bundler resolves them. This maps them
 * so the tests can import the real modules unmodified — no build step, no
 * dependency, and nothing about the app changes to accommodate the tests.
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    return next(pathToFileURL(withExt(SRC + specifier.slice(2))).href, context);
  }
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const abs = path.resolve(
      path.dirname(fileURLToPath(context.parentURL)),
      specifier,
    );
    const hit = withExt(abs);
    if (hit !== abs) return next(pathToFileURL(hit).href, context);
  }
  return next(specifier, context);
}

function withExt(p) {
  if (path.extname(p)) return p;
  for (const cand of [`${p}.ts`, path.join(p, "index.ts")]) {
    if (existsSync(cand)) return cand;
  }
  return p;
}
