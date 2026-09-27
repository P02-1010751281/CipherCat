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
  if (!['tracked', 'not-listed'].includes(entry.errata_status)) {
    errors.push(`${id}: invalid errata_status ${entry.errata_status}`);
  }
  if ((entry.errata_url ? 'tracked' : 'not-listed') !== entry.errata_status) {
    errors.push(`${id}: errata_status does not match errata_url`);
  }
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
  const localPdfs = (await readdir(join(standardsRoot, id), { withFileTypes: true }))
    .filter((item) => item.isFile() && item.name.toLowerCase().endsWith('.pdf'))
    .map((item) => item.name)
    .sort();
  for (const file of localPdfs) {
    const artifact = artifacts.get(file);
    if (!artifact) {
      errors.push(`${id}: PDF missing from manifest: ${file}`);
      continue;
    }
    const digest = createHash('sha256')
      .update(await readFile(join(standardsRoot, id, file)))
      .digest('hex');
    if (digest !== artifact.sha256) {
      errors.push(`${id}: SHA-256 mismatch: ${file}`);
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
      await readFile(artifactPath);
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
