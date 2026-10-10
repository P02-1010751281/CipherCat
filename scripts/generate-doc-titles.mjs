/**
 * 生成文档标题索引：docs/**.md → 该文件第一个 H1 标题。
 *
 * 目的：文档侧栏原来只拿得到文件名（`getDocTitle(filename)`），于是标准目录下的一堆
 * `README.md` 在导航里全显示成 “README”。这里在构建期把正文标题抽出来，
 * 让导航显示真实标题。
 *
 * 用法：
 *   node scripts/generate-doc-titles.mjs          # 校验（与已生成文件不一致则失败）
 *   node scripts/generate-doc-titles.mjs --write  # 重新生成
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const docsRoot = join(root, 'docs');
const outputPath = join(root, 'src/generated/doc-titles.json');

function collectMarkdown(directory, prefix = '') {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...collectMarkdown(join(directory, entry.name), `${relative}/`));
    else if (entry.name.endsWith('.md')) files.push(relative);
  }
  return files;
}

function extractTitle(source, fallback) {
  const heading = source.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  const secondary = source.match(/^##\s+(.+)$/m);
  if (secondary) return secondary[1].trim();
  return fallback;
}

const titles = {};
for (const relative of collectMarkdown(docsRoot).sort()) {
  const source = readFileSync(join(docsRoot, relative), 'utf8');
  const fallback = relative.split('/').pop().replace(/\.en\.md$|\.md$/, '').replace(/-/g, ' ');
  titles[`/docs/${relative}`] = extractTitle(source, fallback);
}

const serialized = `${JSON.stringify(titles, null, 2)}\n`;
if (process.argv.includes('--write')) {
  if (!existsSync(dirname(outputPath))) mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  console.log(`DOC_TITLES_WRITTEN entries=${Object.keys(titles).length} → src/generated/doc-titles.json`);
} else {
  if (!existsSync(outputPath)) {
    console.error('DOC_TITLES_MISSING 运行 `npm run docs:titles`');
    process.exit(1);
  }
  if (readFileSync(outputPath, 'utf8') !== serialized) {
    console.error('DOC_TITLES_STALE docs 标题索引与正文不一致，运行 `npm run docs:titles`');
    process.exit(1);
  }
  console.log(`DOC_TITLES_OK entries=${Object.keys(titles).length}`);
}
