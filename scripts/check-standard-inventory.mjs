import process from 'node:process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';

const root = process.cwd();
const standardsRoot = join(root, 'docs', 'standards');
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');
const inventoryFiles = [
  join(standardsRoot, 'SOURCE-SPLIT-INVENTORY.md'),
  join(standardsRoot, 'SOURCE-SPLIT-INVENTORY.en.md'),
];

async function collectFiles(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const filePath = join(directory, item.name);
    if (item.isDirectory()) files.push(...(await collectFiles(filePath)));
    else if (item.isFile() && item.name.endsWith('.md')) files.push(filePath);
  }
  return files;
}

function field(content, name) {
  const value = (content.match(new RegExp(`\\| ${name} \\| ([^\\n]*)`)) || [])[1];
  return value?.replace(/\s*\|\s*$/, '').trim() || '';
}

function escapeCell(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function rewriteEntryLinks(value, entryFile) {
  const entryDirectory = dirname(entryFile);
  return value.replace(/\]\((<?)\.\/([^)#>]+)(#[^)>]*)?(>?)\)/g, (_match, opener, target, anchor = '', closer) => {
    const inventoryTarget = join(entryDirectory, target).replaceAll('\\', '/');
    return `](${opener}./${inventoryTarget}${anchor}${closer})`;
  });
}

function sourceKind(content, hasSource) {
  const evidence = field(content, '原文证据');
  const location = field(content, '原文位置');
  if (/项目架构说明（非标准条款）/.test(content)) return 'project architecture note (non-normative)';
  if (/RFC `?\.txt`? 证据层条目/.test(content)) return 'RFC .txt evidence';
  if (/00-Research-Source\.md/.test(content)) {
    return 'research bibliography link';
  }
  // Prefer an exact physical PDF page when both it and a source line are
  // present; generic "page must be checked" text is not a page anchor.
  if (/(?:物理第\s*\d+|#page=\d+|PDF\s+(?:physical\s+)?page\s*\d+)/i.test(location)) {
    return 'source PDF page anchor';
  }
  if (/00-(Standard|Research)-Source\.md#L\d+/.test(content)) return 'source line anchor';
  if (/00-(Standard|Research)-Source\.md/.test(content)) return 'source section anchor';
  if (/扫描\s*PDF|scanned\s+PDF/i.test(location)) return 'scanned PDF extraction gap';
  if (!hasSource && /https?:\/\/(?:openstd|std)\.samr\.gov\.cn/i.test(evidence)) {
    return 'official source record only';
  }
  return 'missing source link';
}

const directories = (await readdir(standardsRoot, { withFileTypes: true }))
  .filter((item) => item.isDirectory() && item.name !== 'papers')
  .map((item) => item.name)
  .sort();

const inventory = [];
const errors = [];
let englishStructuredEntries = 0;
for (const directory of directories) {
  const directoryPath = join(standardsRoot, directory);
  const files = await collectFiles(directoryPath);
  const sourcePath = files.find((filePath) => /00-(Standard|Research)-Source\.md/.test(basename(filePath)));
  const hasStandardSource = files.some((filePath) => basename(filePath) === '00-Standard-Source.md');
  const hasResearchSource = files.some((filePath) => basename(filePath) === '00-Research-Source.md');
  const entries = [];
  for (const filePath of files) {
    if (basename(filePath) === 'README.md' || basename(filePath) === '00-Standard-Source.md') continue;
    const content = await readFile(filePath, 'utf8');
    const documentContent = content.replace(/```[\s\S]*?```/g, '');
    // The inventory counts canonical Chinese entries once; `.en.md` files are
    // checked as translations but are not separate standard entries.
    if (!/^## 条目元数据$/m.test(documentContent)) continue;
    const standardPosition = field(content, '标准定位');
    const evidence = field(content, '原文证据');
    const location = field(content, '原文位置');
    const kind = sourceKind(content, Boolean(sourcePath));
    if (!standardPosition || !evidence || !location) {
      errors.push(`${relative(root, filePath)}: structured citation field is incomplete`);
    }
    if (sourcePath && kind === 'missing source link') {
      errors.push(`${relative(root, filePath)}: source-backed entry has no source link`);
    }
    entries.push({
      file: relative(standardsRoot, filePath),
      position: standardPosition.replace(/^# /, ''),
      location,
      kind,
    });
    const englishPath = filePath.replace(/\.md$/, '.en.md');
    if (englishPath !== filePath && files.includes(englishPath)) {
      const englishContent = await readFile(englishPath, 'utf8');
      if (/^## Entry Metadata$/m.test(englishContent)) englishStructuredEntries += 1;
    }
  }
  inventory.push({ directory, hasSource: Boolean(sourcePath), hasStandardSource, hasResearchSource, entries });
}

const entries = inventory.flatMap((item) => item.entries);
const standardSourceDirectories = inventory.filter((item) => item.hasStandardSource).length;
const researchReferenceDirectories = inventory.filter((item) => item.hasResearchSource && !item.hasStandardSource).length;
const sourceLineEntries = entries.filter((entry) => entry.kind === 'source line anchor').length;
const sourcePdfEntries = entries.filter((entry) => entry.kind === 'source PDF page anchor').length;
const rfcEntries = entries.filter((entry) => entry.kind === 'RFC .txt evidence').length;
const researchReferenceEntries = entries.filter((entry) => entry.kind === 'research bibliography link').length;
const projectNoteEntries = entries.filter((entry) => entry.kind === 'project architecture note (non-normative)').length;
const officialSourceRecordEntries = entries.filter((entry) => entry.kind === 'official source record only').length;
const scannedPdfGapEntries = entries.filter((entry) => entry.kind === 'scanned PDF extraction gap').length;
const sectionEntries = entries.filter((entry) => entry.kind === 'source section anchor').length;
const missingSourceEntries = entries.filter((entry) => entry.kind === 'missing source link').length;

function render(language, checkedAt = new Date().toLocaleDateString('sv-SE')) {
  const english = language === 'en';
  const lines = [
    english ? '# Standard Source-to-Entry Inventory' : '# 标准原文到结构化条目清单',
    '',
    english ? `Checked: ${checkedAt}` : `核对日期：${checkedAt}`,
    '',
    english
      ? '> Generated from every structured entry metadata block. This is an evidence index, not a claim that every standard clause has been transcribed.'
      : '> 本清单由所有结构化条目的元数据块生成，是证据索引，不代表每一份标准的全部条款都已逐字转录。',
    '',
    ...(english
      ? ['> The ' + entries.length + ' canonical entries are listed once; ' + englishStructuredEntries + ' currently have structured English counterparts. Labels are translated, while entry titles and source-location details remain in the canonical entry language where no translation exists. This is not a fully localized entry-by-entry index.', '']
      : []),
    english ? '## Summary' : '## 汇总',
    '',
    english ? `- Directories: **${directories.length}**; standard-source directories: **${standardSourceDirectories}**; research-reference directories: **${researchReferenceDirectories}**.` : `- 目录：**${directories.length}** 个；含标准原文提取层：**${standardSourceDirectories}** 个；仅含研究/参考索引：**${researchReferenceDirectories}** 个。`,
    english ? `- Structured entries: **${entries.length}**; entries with standard-source evidence: **${sourceLineEntries + sourcePdfEntries + sectionEntries}**; RFC text evidence: **${rfcEntries}**; bibliography-only links: **${researchReferenceEntries}**; official-record-only entries: **${officialSourceRecordEntries}**; scanned-PDF extraction gaps: **${scannedPdfGapEntries}**; non-normative project notes: **${projectNoteEntries}**; entries without a source link: **${missingSourceEntries}**.` : `- 结构化条目：**${entries.length}** 个；有标准原文锚点：**${sourceLineEntries + sourcePdfEntries + sectionEntries}** 个；RFC 文本证据：**${rfcEntries}** 个；仅回链研究书目：**${researchReferenceEntries}** 个；仅有官方记录：**${officialSourceRecordEntries}** 个；扫描 PDF 提取缺项：**${scannedPdfGapEntries}** 个；非规范性项目说明：**${projectNoteEntries}** 个；无来源回链：**${missingSourceEntries}** 个。`,
    english ? `- Standard-source line anchors: **${sourceLineEntries}**; exact PDF-page anchors: **${sourcePdfEntries}**; section-only anchors: **${sectionEntries}**.` : `- 标准原文行号锚点：**${sourceLineEntries}** 个；精确 PDF 页码锚点：**${sourcePdfEntries}** 个；仅章节级定位：**${sectionEntries}** 个。`,
    '',
    english ? '## Status semantics' : '## 状态含义',
    '',
    english ? '- `source line anchor`: the entry links to a local source extraction line range.' : '- `source line anchor`：条目回链到本地 source 提取稿的行号范围。',
    english ? '- `source PDF page anchor`: the entry identifies the exact physical PDF page(s), including a PDF page jump link.' : '- `source PDF page anchor`：条目标出原件 PDF 的物理页码，并提供页码跳转链接。',
    english ? '- `RFC .txt evidence`: the complete RFC Editor text is stored locally; the structured page is an index/summary and must not impersonate a full quotation.' : '- `RFC .txt evidence`：完整 RFC Editor 文本已本地保存；结构化页只作索引/摘要，不冒充完整逐字引文。',
    english ? '- `research bibliography link`: a local research index provides bibliographic/contextual evidence, not a normative-standard extraction.' : '- `research bibliography link`：本地研究索引提供书目或背景证据，不等于标准原文提取稿。',
    english ? '- `official source record only`: an official catalog record is linked, but no local normative text or clause-level citation is available.' : '- `official source record only`：已链接官方目录记录，但没有本地标准正文或条款级引文。',
    english ? '- `scanned PDF extraction gap`: a local scanned PDF is linked, but reliable searchable text or a page-level citation is not yet available.' : '- `scanned PDF extraction gap`：已链接本地扫描 PDF，但尚无可靠可检索文本或页码级引用。',
    english ? '- `source section anchor`: the entry links to the source layer but still needs a finer line range or PDF page when the section can be uniquely identified.' : '- `source section anchor`：条目已回链 source，但若章节可以唯一识别，仍应继续补充更细的行号或 PDF 页码。',
    english ? '- `missing source link`: allowed only for explicitly documented external, historical, or source-gap directories.' : '- `missing source link`：只允许出现在已明确记录为外部、历史或原件缺项的目录。',
    '',
    english ? '## Inventory by directory' : '## 按目录清单',
    '',
  ];
  for (const item of inventory) {
    const directoryStatus = item.hasStandardSource
      ? (english ? 'standard source present' : '有标准原文提取层')
      : item.hasResearchSource
        ? (english ? 'research reference only' : '仅有研究/参考索引')
        : (english ? 'source exception / gap' : 'source 例外或缺项');
    lines.push(`### \`${item.directory}\` — ${directoryStatus}`);
    lines.push('');
    if (!item.entries.length) {
      lines.push(english ? 'No structured entry pages.' : '没有结构化条目页。', '');
      continue;
    }
    lines.push(english ? '| Entry | Standard position | Source location | Evidence status |' : '| 条目 | 标准定位 | 原文位置 | 证据状态 |');
    lines.push('|---|---|---|---|');
    for (const entry of item.entries) {
      const link = `./${entry.file}`;
      lines.push(`| [${escapeCell(entry.file)}](${link}) | ${escapeCell(entry.position)} | ${escapeCell(rewriteEntryLinks(entry.location, entry.file))} | \`${entry.kind}\` |`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

if (errors.length) {
  console.error(errors.map((error) => `STANDARD_INVENTORY_ERROR ${error}`).join('\n'));
  process.exitCode = 1;
} else if (write) {
  await writeFile(join(standardsRoot, 'SOURCE-SPLIT-INVENTORY.md'), render('zh'));
  await writeFile(join(standardsRoot, 'SOURCE-SPLIT-INVENTORY.en.md'), render('en'));
  console.log(`STANDARD_INVENTORY_SUMMARY directories=${directories.length} standard_source_directories=${standardSourceDirectories} research_reference_directories=${researchReferenceDirectories} entries=${entries.length} standard_source_entries=${sourceLineEntries + sourcePdfEntries + sectionEntries} line_anchors=${sourceLineEntries} pdf_page_anchors=${sourcePdfEntries} rfc_evidence=${rfcEntries} research_reference_links=${researchReferenceEntries} official_record_only=${officialSourceRecordEntries} scanned_pdf_gaps=${scannedPdfGapEntries} non_normative_project_notes=${projectNoteEntries} section_anchors=${sectionEntries} missing_source_links=${missingSourceEntries}`);
} else if (check) {
  const existing = await Promise.all(inventoryFiles.map(async (filePath) => {
    try {
      return await readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  }));
  const checkedAt = existing[0]?.match(/^核对日期：([^\n]+)$/m)?.[1]
    || existing[1]?.match(/^Checked: ([^\n]+)$/m)?.[1]
    || '2026-09-13';
  const expected = [render('zh', checkedAt), render('en', checkedAt)];
  const stale = inventoryFiles.filter((filePath, index) => existing[index] !== expected[index]);
  if (stale.length) {
    console.error(stale.map((filePath) => `STANDARD_INVENTORY_STALE ${relative(root, filePath)}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`STANDARD_INVENTORY_CHECK_OK directories=${directories.length} entries=${entries.length} standard_source_entries=${sourceLineEntries + sourcePdfEntries + sectionEntries} line_anchors=${sourceLineEntries} pdf_page_anchors=${sourcePdfEntries} rfc_evidence=${rfcEntries} research_reference_links=${researchReferenceEntries} official_record_only=${officialSourceRecordEntries} scanned_pdf_gaps=${scannedPdfGapEntries} non_normative_project_notes=${projectNoteEntries} section_anchors=${sectionEntries} missing_source_links=${missingSourceEntries}`);
  }
} else {
  console.log(`STANDARD_INVENTORY_SUMMARY directories=${directories.length} standard_source_directories=${standardSourceDirectories} research_reference_directories=${researchReferenceDirectories} entries=${entries.length} standard_source_entries=${sourceLineEntries + sourcePdfEntries + sectionEntries} line_anchors=${sourceLineEntries} pdf_page_anchors=${sourcePdfEntries} rfc_evidence=${rfcEntries} research_reference_links=${researchReferenceEntries} official_record_only=${officialSourceRecordEntries} scanned_pdf_gaps=${scannedPdfGapEntries} non_normative_project_notes=${projectNoteEntries} section_anchors=${sectionEntries} missing_source_links=${missingSourceEntries}`);
}
