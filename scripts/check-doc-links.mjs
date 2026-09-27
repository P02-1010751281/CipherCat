import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, resolve, dirname, relative } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const scanRoots = ['README.md', 'README.en.md', 'RULES.md', 'docs', 'demos', 'paper/references'];
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'dist-verify', 'target']);
const publicAssetRoots = ['public', 'frontend/public'].map((path) => resolve(root, path));
const markdownFiles = [];

function collect(path) {
  const entries = readdirSync(path, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) collect(child);
    else if (extname(entry.name).toLowerCase() === '.md') markdownFiles.push(child);
  }
}

for (const scanRoot of scanRoots) {
  const path = resolve(root, scanRoot);
  if (existsSync(path) && extname(path).toLowerCase() === '.md') markdownFiles.push(path);
  else if (existsSync(path)) collect(path);
}

const broken = [];
// A bracketed expression in prose is not necessarily a Markdown link.
// Ignore brackets attached to ASCII identifiers (e.g. `Ascon-p[12](S)`),
// while allowing links immediately after CJK text, as in `见[说明](guide.md)`.
const linkPattern = /(?<![A-Za-z0-9_-])!?\[[^\]]*\]\((<[^>\n]+>|[^)\n]+)\)/g;
for (const file of markdownFiles) {
  const content = readFileSync(file, 'utf8');
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    let target = match[1].trim();
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
    else target = target.split(/\s+/)[0];
    if (!target || /^(?:https?:|mailto:|#|data:|codex:)/i.test(target)) continue;
    // Formula notation such as `S[0:127]` can resemble `[label](target)`;
    // real local links in this corpus have a path separator or file extension.
    if (!target.includes('/') && !/\.[A-Za-z0-9]+$/.test(target)) continue;
    target = decodeURIComponent(target.split('#', 1)[0].split('?', 1)[0]);
    if (!target) continue;

    // Audit evidence links may use an absolute workspace path with a line suffix.
    const candidates = [target];
    if (target.startsWith('/')) candidates.push(target.replace(/:\d+$/, ''));
    const publicAssets = target.startsWith('/')
      ? publicAssetRoots.map((path) => resolve(path, target.slice(1).replace(/:\d+$/, '')))
      : [];
    const valid = candidates.some((candidate) => existsSync(resolve(dirname(file), candidate)))
      || publicAssets.some((asset) => existsSync(asset));
    if (!valid) broken.push(`${relative(root, file)} -> ${target}`);
  }
}

console.log(`DOC_LINK_SUMMARY files=${markdownFiles.length} broken=${broken.length}`);
for (const item of broken) console.error(item);
process.exit(broken.length ? 1 : 0);
