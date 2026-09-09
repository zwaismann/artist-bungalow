import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Stay at the project root so Vercel can collect functions and middleware. */
const SKIP_TOP_LEVEL = new Set([
  'api',
  'middleware.js',
  'package.json',
  'package-lock.json',
  'vercel.json',
  'scripts',
  'node_modules',
  'public',
]);

export function parseStaticAllowlist(ignoreText) {
  const paths = [];
  for (const raw of ignoreText.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('!/')) continue;
    const rel = line.slice(2);
    if (!rel || rel.endsWith('/**')) continue;
    const top = rel.split('/')[0];
    if (SKIP_TOP_LEVEL.has(top)) continue;
    paths.push(rel);
  }
  return paths;
}

function isServerModule(name) {
  return name.endsWith('.js') || name.endsWith('.mjs') || name.endsWith('.cjs');
}

async function copyTree(from, to, { skipServerModules = false } = {}) {
  const info = await stat(from);
  if (info.isDirectory()) {
    await mkdir(to, { recursive: true });
    for (const entry of await readdir(from, { withFileTypes: true })) {
      if (skipServerModules && !entry.isDirectory() && isServerModule(entry.name)) {
        continue;
      }
      await copyTree(join(from, entry.name), join(to, entry.name), { skipServerModules });
    }
    return;
  }
  if (skipServerModules && isServerModule(from.split('/').pop())) return;
  await mkdir(dirname(to), { recursive: true });
  await cp(from, to);
}

export async function stagePublic({ root = ROOT, destName = 'public' } = {}) {
  const dest = join(root, destName);
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });

  const entries = await readdir(root, { withFileTypes: true });
  let copied = 0;
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (SKIP_TOP_LEVEL.has(entry.name)) continue;
    if (entry.name === destName) continue;
    const from = join(root, entry.name);
    const to = join(dest, entry.name);
    const skipServerModules = entry.name === 'business';
    await copyTree(from, to, { skipServerModules });
    copied += 1;
  }

  const index = join(dest, 'index.html');
  try {
    await stat(index);
  } catch {
    throw new Error('stage-public: public/index.html was not created');
  }

  return { dest, copied };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const { dest, copied } = await stagePublic();
  console.log(`Staged ${copied} static paths into ${dest}`);
}
