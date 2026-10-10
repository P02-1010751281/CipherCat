import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const standardsRoot = join(root, 'docs', 'standards');
const manifestPath = join(standardsRoot, 'standards-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const entries = manifest.entries;
const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
const errors = [];

async function collectMarkdown(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const filePath = join(directory, item.name);
    if (item.isDirectory()) {
      files.push(...(await collectMarkdown(filePath)));
    } else if (item.isFile() && item.name.endsWith('.md')) {
      files.push(filePath);
    }
  }
  return files;
}

const topLevel = (await readdir(standardsRoot, { withFileTypes: true }))
  .filter((item) => item.isDirectory() && item.name !== 'papers')
  .map((item) => item.name)
  .sort();

const expectedFields = [
  'id',
  'kind',
  'standard',
  'version',
  'status',
  'source_url',
  'source_checked_at',
  'errata_url',
  'errata_status',
  'artifacts',
];

for (const id of topLevel) {
  const entry = entryMap.get(id);
  if (!entry) {
    errors.push(`${id}: missing manifest entry`);
    continue;
  }
  for (const field of expectedFields) {
    if (!(field in entry)) errors.push(`${id}: missing ${field}`);
  }
  if (!['current', 'tracking', 'review', 'reference'].includes(entry.status)) {
    errors.push(`${id}: invalid status ${entry.status}`);
  }
  if (!/^https:\/\//.test(entry.source_url)) {
    errors.push(`${id}: source_url must use HTTPS`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.source_checked_at)) {
    errors.push(`${id}: source_checked_at must be YYYY-MM-DD`);
  }
  if (!['tracked', 'landing-page-only', 'not-listed'].includes(entry.errata_status)) {
    errors.push(`${id}: invalid errata_status ${entry.errata_status}`);
  }
  // tracked：已登记独立勘误/更新文档；landing-page-only：只复核了发布页本身；not-listed：无链接。
  const expectedErrataStatus = entry.errata_url
    ? (entry.errata_url === entry.source_url ? 'landing-page-only' : 'tracked')
    : 'not-listed';
  if (entry.errata_status !== expectedErrataStatus) {
    errors.push(`${id}: errata_status ${entry.errata_status} does not match errata_url (expected ${expectedErrataStatus})`);
  }
}

// manifest 的 updated_at 不得早于任何条目的 source_checked_at，否则说明清单本身已过期。
const newestSourceCheck = entries
  .map((entry) => entry.source_checked_at)
  .filter((value) => typeof value === 'string')
  .sort()
  .at(-1);
if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.updated_at || '')) {
  errors.push('updated_at must be YYYY-MM-DD');
} else if (newestSourceCheck && manifest.updated_at < newestSourceCheck) {
  errors.push(`updated_at (${manifest.updated_at}) is older than newest source_checked_at (${newestSourceCheck})`);
}

for (const id of topLevel) {
  const entry = entryMap.get(id);
  if (!entry) continue;
  const readme = join(standardsRoot, id, 'README.md');
  try {
    await readFile(readme);
  } catch {
    errors.push(`${id}: README.md missing`);
  }

  const artifactList = Array.isArray(entry.artifacts) ? entry.artifacts : [];
  if (!Array.isArray(entry.artifacts)) {
    errors.push(`${id}: artifacts must be an array`);
  }
  const artifacts = new Map(
    artifactList
      .filter(
        (artifact) =>
          artifact && typeof artifact === 'object' && 'path' in artifact,
      )
      .map((artifact) => [artifact.path, artifact]),
  );
  // 本地主源文件（PDF 与 RFC 全文 .txt）必须登记在 artifacts。
  const localSources = (await readdir(join(standardsRoot, id), { withFileTypes: true }))
    .filter((item) => item.isFile() && /\.(pdf|txt)$/i.test(item.name))
    .map((item) => item.name)
    .sort();
  for (const file of localSources) {
    const artifact = artifacts.get(file);
    if (!artifact) {
      errors.push(`${id}: source file missing from manifest: ${file}`);
      continue;
    }
  }
  for (const artifact of artifactList) {
    if (
      !artifact ||
      typeof artifact !== 'object' ||
      !artifact.path ||
      !artifact.sha256
    ) {
      errors.push(`${id}: artifact requires path and sha256`);
      continue;
    }
    const artifactPath = join(standardsRoot, id, artifact.path);
    try {
      // 所有登记 artifact（含 RFC 全文、ACVP/CAVP 压缩包、数据表）重算 SHA-256 比对。
      const digest = createHash('sha256')
        .update(await readFile(artifactPath))
        .digest('hex');
      if (digest !== artifact.sha256) {
        errors.push(`${id}: SHA-256 mismatch: ${artifact.path}`);
      }
    } catch {
      errors.push(`${id}: listed artifact missing: ${artifact.path}`);
    }
  }
}

for (const entry of entries) {
  if (!topLevel.includes(entry.id)) errors.push(`${entry.id}: not a top-level standard directory`);
}

const structuredFiles = [];
const sourceLayerFiles = [];
for (const filePath of await collectMarkdown(standardsRoot)) {
  const content = await readFile(filePath, 'utf8');
  if (/^00-(Standard|Research)-Source\.md$/.test(basename(filePath))) {
    sourceLayerFiles.push(filePath);
    const directoryEntry = entryMap.get(basename(dirname(filePath)));
    const isReferenceIndex = basename(filePath) === '00-Research-Source.md'
      && directoryEntry?.kind === 'reference';
    const requiredFields = isReferenceIndex
      ? ['## ISO 标准记录', '## NIST 流程状态', '## 原始论文和算法材料']
      : ['## 对应本地 PDF', '## 原文提取', 'pdftotext -layout'];
    for (const required of requiredFields) {
      if (!content.includes(required)) {
        errors.push(`${filePath}: source layer field missing: ${required}`);
      }
    }
  }
  // The schema document contains an example heading inside a fenced block;
  // do not count that example as a real structured entry.
  const documentContent = content.replace(/```[\s\S]*?```/g, '');
  if (!/^## 条目元数据$/m.test(documentContent)) continue;
  structuredFiles.push(filePath);
  const directoryEntry = entryMap.get(basename(dirname(filePath)));
  const requiredFields = ['| 原文证据 |', '| 原文位置 |', '## 原文定位与引用'];
  if (directoryEntry?.kind === 'reference') {
    if (!/^## 来源要点（转述，非逐字引用）$/m.test(documentContent)) {
      errors.push(`${filePath}: reference entry must label paraphrase as non-verbatim`);
    }
  } else if (!/^## 原文摘录$/m.test(documentContent)) {
    errors.push(`${filePath}: structured citation field missing: ## 原文摘录`);
  }
  for (const required of requiredFields) {
    if (!content.includes(required)) {
      errors.push(`${filePath}: structured citation field missing: ${required}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `STANDARD_METADATA_ERROR ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  const pdfCount = entries.reduce((count, entry) => count + entry.artifacts.length, 0);
  console.log(`STANDARD_METADATA_SUMMARY entries=${entries.length} directories=${topLevel.length} artifacts=${pdfCount} source_layers=${sourceLayerFiles.length} structured=${structuredFiles.length} errors=0`);
}
