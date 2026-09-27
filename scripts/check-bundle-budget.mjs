import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';

const entryBudgetBytes = 64 * 1024;
const assetsDirectory = join(cwd(), 'dist', 'assets');
const entryPattern = /^index-[A-Za-z0-9_-]+\.js$/;

const entries = (await readdir(assetsDirectory)).filter((name) => entryPattern.test(name));
if (entries.length !== 1) {
  throw new Error(`expected exactly one production entry chunk, found ${entries.length}`);
}

const entryPath = join(assetsDirectory, entries[0]);
const entryBytes = (await stat(entryPath)).size;
console.log(
  `BUNDLE_BUDGET_SUMMARY entry=${entries[0]} bytes=${entryBytes} budget=${entryBudgetBytes}`,
);

if (entryBytes > entryBudgetBytes) {
  throw new Error(
    `production entry chunk exceeds ${entryBudgetBytes} bytes: ${entries[0]} is ${entryBytes} bytes`,
  );
}
