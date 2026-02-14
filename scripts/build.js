#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

async function rimraf(target) {
  await fsp.rm(target, { recursive: true, force: true });
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

async function copyDir(srcDir, destDir) {
  await ensureDir(destDir);
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const ent of entries) {
    const src = path.join(srcDir, ent.name);
    const dest = path.join(destDir, ent.name);
    if (ent.isDirectory()) {
      await copyDir(src, dest);
    } else if (ent.isFile()) {
      await copyFile(src, dest);
    }
  }
}

async function exists(p) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const cleanOnly = args.has("--clean");

  if (cleanOnly) {
    await rimraf(DIST);
    console.log("Cleaned dist/");
    return;
  }

  const requiredFiles = ["index.html", "test.html", "server.js"];
  for (const f of requiredFiles) {
    const p = path.join(ROOT, f);
    if (!(await exists(p))) {
      throw new Error(`Missing required file: ${f}`);
    }
  }

  if (!(await exists(path.join(ROOT, "assets")))) {
    throw new Error("Missing required directory: assets/");
  }

  await rimraf(DIST);
  await ensureDir(DIST);

  await copyFile(path.join(ROOT, "index.html"), path.join(DIST, "index.html"));
  await copyFile(path.join(ROOT, "test.html"), path.join(DIST, "test.html"));
  await copyFile(path.join(ROOT, "server.js"), path.join(DIST, "server.js"));
  await copyDir(path.join(ROOT, "assets"), path.join(DIST, "assets"));

  // Optional docs for deployers (no secrets).
  if (await exists(path.join(ROOT, ".env.example"))) {
    await copyFile(path.join(ROOT, ".env.example"), path.join(DIST, ".env.example"));
  }

  console.log("Build complete: dist/");
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});

