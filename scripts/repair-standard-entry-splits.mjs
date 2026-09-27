import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const standardsRoot = join(root, 'docs', 'standards');
const writeChanges = process.argv.includes('--write');

function sourceAlgorithmHeading(line) {
  const match = line.match(/^\s*Algorithm\s+(\d+)(?::\s*|[^\n]*\()/);
  if (!match || line.includes('. . .')) return null;
  return Number(match[1]);
}

function findAlgorithms(source) {
  const lines = source.split('\n');
  const algorithms = new Map();
  lines.forEach((line, index) => {
    const number = sourceAlgorithmHeading(line);
    if (number !== null && !algorithms.has(number)) {
      algorithms.set(number, { line: index + 1, index });
    }
  });
  return { lines, algorithms };
}

function cleanSourceLine(line) {
  if (line.includes('\f')) return null;
  if (/^\s*\d+\s*$/.test(line)) return null;
  return line;
}

function isNumberedStep(line) {
  const trimmed = line.trim();
  // A subsection such as "5.1 WOTS+ ..." is a boundary, not step 5.
  if (/^\d+(?:\.\d+)+\s+\S/.test(trimmed)) return false;
  return /^\d+\s*[:.]\s*/.test(trimmed);
}

function isSubsectionHeading(line) {
  return /^\d+(?:\.\d+)+\s+\S/.test(line.trim());
}

function isControlLine(line) {
  return /^(?:else|end\s+(?:if|for|while)|if\b|while\b|for\b)/i.test(line);
}

function isClosingControlLine(line) {
  return /^(?:\d+\s*[:.]\s*)?end\s+(?:if|for|while)\b/i.test(line);
}

function isReturnLine(line) {
  return /^(?:\d+\s*[:.]\s*)?return\b/i.test(line);
}

function extractAlgorithm(lines, startIndex) {
  const block = [];
  let returnSeen = false;
  let closingControlSeen = false;
  let stepSeen = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const original = lines[index];
    const pageText = original.replace(/^\f/, '');
    if (index > startIndex && sourceAlgorithmHeading(pageText) !== null) break;
    if (index > startIndex && isSubsectionHeading(pageText)) break;
    if (original.includes('\f')) {
      // pdftotext may attach the page break directly to the next algorithm
      // heading. Preserve that heading when it is the extraction start.
      if (index === startIndex && sourceAlgorithmHeading(pageText) !== null) {
        block.push(pageText);
        continue;
      }
      // A form-feed after the algorithm's return is page furniture. Before
      // the return, it can split a long algorithm across PDF pages.
      if (returnSeen) break;
      continue;
    }
    const line = cleanSourceLine(original);
    if (line === null) continue;

    const trimmed = line.trim();
    // PDF extraction commonly moves two-digit step numbers to column zero.
    // A numbered step is always part of the current algorithm, regardless of
    // indentation. Only an unindented non-step after a return can be prose.
    if (
      (stepSeen || returnSeen || closingControlSeen) &&
      trimmed &&
      !/^\s/.test(line) &&
      !isNumberedStep(line) &&
      !isControlLine(trimmed)
    ) {
      break;
    }
    if (closingControlSeen && isNumberedStep(line)) closingControlSeen = false;
    block.push(line);
    if (isNumberedStep(line)) stepSeen = true;
    if (isReturnLine(trimmed)) returnSeen = true;
    if (isClosingControlLine(trimmed)) closingControlSeen = true;
  }

  while (block.length > 0 && block.at(-1).trim() === '') block.pop();
  return block.join('\n');
}

function replaceSection(text, heading, replacement) {
  const start = text.indexOf(`${heading}\n`);
  if (start < 0) return text;
  const contentStart = start + heading.length + 1;
  const nextHeading = text.slice(contentStart).search(/^##\s+/m);
  const end = nextHeading < 0 ? text.length : contentStart + nextHeading;
  const suffix = text.slice(end);
  return `${text.slice(0, contentStart)}${replacement.trimEnd()}\n${suffix ? `\n${suffix}` : ''}`;
}

function updateSourceLocations(text, sourceLine) {
  return text
    .replace(/#L\d+/g, `#L${sourceLine}`)
    .replace(/第\s*\d+\s*行/g, `第 ${sourceLine} 行`);
}

function replaceAlgorithmFence(text, number, block) {
  const fencePattern = /```[\s\S]*?```/g;
  return text.replace(fencePattern, (fence) => {
    if (!new RegExp(`Algorithm\\s+${number}\\b`).test(fence)) return fence;
    return `\`\`\`text\n${block}\n\`\`\``;
  });
}

function replaceFirstFenceInSection(text, heading, block) {
  const marker = `${heading}\n`;
  const start = text.indexOf(marker);
  if (start < 0) return text;
  const contentStart = start + marker.length;
  const nextHeading = text.slice(contentStart).search(/^##\s+/m);
  const end = nextHeading < 0 ? text.length : contentStart + nextHeading;
  const section = text.slice(contentStart, end);
  const fence = section.match(/```[^\n]*\n[\s\S]*?\n```/);
  const replacement = `\`\`\`text\n${block}\n\`\`\``;
  const updated = fence
    ? section.replace(fence[0], replacement)
    : `\n${replacement}\n${section}`;
  return `${text.slice(0, contentStart)}${updated}${text.slice(end)}`;
}

function ensureAlgorithmSchema(text, block) {
  if (text.includes('## 标准定义')) return text;
  const sections = [
    '## 标准定义',
    '',
    '本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。',
    '',
    '## 公式或伪代码',
    '',
    '> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。',
    '',
    '```text',
    block,
    '```',
    '',
    '## 输入与输出',
    '',
    '输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。',
    '',
    '## 项目映射',
    '',
    '本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。',
    '',
    '## 核验与缺项',
    '',
    '已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。',
  ].join('\n');
  return `${text.trimEnd()}\n\n${sections}\n`;
}

const changes = [];
for (const directoryEntry of await readdir(standardsRoot, { withFileTypes: true })) {
  if (!directoryEntry.isDirectory() || directoryEntry.name === 'papers') continue;
  const directory = directoryEntry.name;
  const directoryPath = join(standardsRoot, directory);
  const sourcePath = join(directoryPath, '00-Standard-Source.md');

  let source;
  try {
    source = await readFile(sourcePath, 'utf8');
  } catch {
    continue;
  }

  const { lines, algorithms } = findAlgorithms(source);
  if (algorithms.size === 0) continue;

  for (const file of await readdir(directoryPath)) {
    if (!file.endsWith('.md') || file === 'README.md' || file === '00-Standard-Source.md') continue;
    const filePath = join(directoryPath, file);
    let text = await readFile(filePath, 'utf8');
    const title = text.match(/^#\s+Algorithm\s+(\d+)/m);
    if (!title) continue;

    const number = Number(title[1]);
    const sourceAlgorithm = algorithms.get(number);
    if (!sourceAlgorithm) continue;

    const block = extractAlgorithm(lines, sourceAlgorithm.index);
    const excerpt = [
      `> 以下为 source 中 Algorithm ${number} 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。`,
      '',
      '```text',
      block,
      '```',
    ].join('\n');

    text = updateSourceLocations(text, sourceAlgorithm.line);
    text = replaceSection(text, '## 原文摘录', excerpt);
    text = replaceAlgorithmFence(text, number, block);
    text = ensureAlgorithmSchema(text, block);
    text = replaceFirstFenceInSection(text, '## 公式或伪代码', block);

    const original = await readFile(filePath, 'utf8');
    if (text !== original) {
      changes.push(`${directory}/${file}: Algorithm ${number} → source L${sourceAlgorithm.line}`);
      if (writeChanges) await writeFile(filePath, text);
    }
  }
}

console.log(`${writeChanges ? 'STANDARD_SPLIT_REPAIRED' : 'STANDARD_SPLIT_PLAN'} files=${changes.length}`);
for (const change of changes) console.log(change);
