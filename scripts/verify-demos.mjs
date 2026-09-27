import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const harness = resolve(root, 'dist-verify/verify-demo.js');
const DEMO_TIMEOUT_MS = 30_000;

function collectDemos(directory, prefix = '') {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectDemos(file, `${relative}/`));
    else if (entry.name.endsWith('.json') && relative !== 'tests.json') files.push(relative);
  }
  return files;
}

const registry = Object.keys(JSON.parse(readFileSync(resolve(root, 'demos/tests.json'), 'utf8')));
const demos = collectDemos(resolve(root, 'demos')).sort();
const missing = demos.filter((demo) => !registry.includes(demo));
const stale = registry.filter((demo) => !demos.includes(demo));
if (missing.length || stale.length) {
  if (missing.length) console.error(`未注册 demo: ${missing.join(', ')}`);
  if (stale.length) console.error(`注册表中的陈旧 demo: ${stale.join(', ')}`);
  process.exit(1);
}

if (!demos.length) {
  console.error('没有找到可验证的 demo');
  process.exit(1);
}

let passed = 0;
for (const demo of demos) {
  const result = spawnSync(process.execPath, [harness, resolve(root, 'demos', demo), '--exec'], {
    cwd: root,
    encoding: 'utf8',
    timeout: DEMO_TIMEOUT_MS,
  });
  if (result.status === 0) {
    passed += 1;
    continue;
  }
  console.error(`FAIL ${demo}`);
  if (result.error) console.error(result.error.message);
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  if (output) console.error(output.slice(-2000));
}

console.log(`DEMO_SUMMARY total=${demos.length} pass=${passed} fail=${demos.length - passed}`);
process.exit(passed === demos.length ? 0 : 1);
