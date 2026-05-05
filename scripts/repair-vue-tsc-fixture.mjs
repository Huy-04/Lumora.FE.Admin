import { access, cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");

const typescriptDir = path.join(appRoot, "node_modules", "typescript");
const fixtureDir = path.join(
  appRoot,
  "node_modules",
  "vite-plugin-checker",
  "dist",
  "checkers",
  "vueTsc",
  "typescript-vue-tsc",
);

const requiredEntries = [
  path.join(fixtureDir, "bin", "tsc"),
  path.join(fixtureDir, "lib", "lib.d.ts"),
  path.join(fixtureDir, "lib", "lib.dom.d.ts"),
  path.join(fixtureDir, "lib", "lib.dom.iterable.d.ts"),
  path.join(fixtureDir, "lib", "lib.esnext.d.ts"),
];

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const canRepair = await exists(typescriptDir);
if (!canRepair) {
  process.exit(0);
}

const needsRepair = !(await Promise.all(requiredEntries.map((entry) => exists(entry)))).every(Boolean);

if (!needsRepair) {
  process.exit(0);
}

await mkdir(fixtureDir, { recursive: true });
await cp(typescriptDir, fixtureDir, {
  recursive: true,
  force: true,
});

console.log("[repair-vue-tsc-fixture] Restored missing TypeScript fixture files for vite-plugin-checker.");
