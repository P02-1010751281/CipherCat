import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const standardsRoot = join(root, 'docs', 'standards');
const errors = [];
const results = [];

function sourceAlgorithmHeading(line) {
  const match = line.match(/^\s*Algorithm\s+(\d+)(?::\s*|[^\n]*\()/);
  if (!match || line.includes('. . .')) return null;
  return Number(match[1]);
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
      if (index === startIndex && sourceAlgorithmHeading(pageText) !== null) {
        block.push(pageText);
        continue;
      }
      if (returnSeen) break;
      continue;
    }
    const line = cleanSourceLine(pageText);
    if (line === null) continue;

    const trimmed = line.trim();
    if (returnSeen && trimmed && !isNumberedStep(line) && !isControlLine(trimmed)) {
      break;
    }
    if (
      (stepSeen || closingControlSeen) &&
      !returnSeen &&
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

function canonicalAlgorithmBlock(block) {
  return block
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/[‐‑‒–—−]/g, '-')
        .replace(/…/g, '...')
        .replace(/\s*([()[\],;])\s*/g, '$1')
        .replace(/\s*([/*+])\s*/g, '$1')
        .replace(/\s*-\s*/g, '-')
        .replace(/[ \t]+/g, ' '),
    )
    .filter(Boolean)
    .filter((line) => !/^(?:NIST Special Publication 800-38D|FIPS 202|FIPS 203|FIPS 204|FIPS 205)\b/.test(line))
    .filter((line) => !/^\d+\.\s+(?!For\b|Let\b|If\b|Return\b|Then\b|Else\b)[A-Z]/.test(line))
    .join('\n');
}

function containsCanonicalBlock(expected, excerpt) {
  const expectedLines = canonicalAlgorithmBlock(expected).split('\n');
  const excerptLines = canonicalAlgorithmBlock(excerpt).split('\n');
  let cursor = 0;
  for (const expectedLine of expectedLines) {
    const found = excerptLines.indexOf(expectedLine, cursor);
    if (found < 0) return false;
    cursor = found + 1;
  }
  return true;
}

function sectionBody(text, heading) {
  const start = text.indexOf(`## ${heading}\n`);
  if (start < 0) return '';
  const contentStart = start + heading.length + 4;
  const nextHeading = text.slice(contentStart).search(/^##\s+/m);
  const end = nextHeading < 0 ? text.length : contentStart + nextHeading;
  return text.slice(contentStart, end);
}

function fenceForAlgorithm(body, number) {
  const fences = [...body.matchAll(/```[^\n]*\n([\s\S]*?)\n```/g)].map((match) => match[1]);
  return fences.find((fence) => new RegExp(`^\\s*Algorithm\\s+${number}\\b`, 'm').test(fence)) ?? null;
}

const directories = (await readdir(standardsRoot, { withFileTypes: true }))
  .filter((item) => item.isDirectory() && item.name !== 'papers')
  .map((item) => item.name)
  .sort();

for (const directory of directories) {
  const directoryPath = join(standardsRoot, directory);
  const sourcePath = join(directoryPath, '00-Standard-Source.md');
  let source;
  try {
    source = await readFile(sourcePath, 'utf8');
  } catch {
    continue;
  }

  // Numbered algorithm headings are the machine-checkable split unit. This
  // intentionally excludes prose such as “Algorithm 3 below ...” and TOCs.
  const algorithms = [];
  const sourceLines = source.split('\n');
  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    const number = sourceAlgorithmHeading(line);
    if (number === null) continue;
    if (!algorithms.some((algorithm) => algorithm.number === number)) {
      algorithms.push({ number, heading: line.trim(), line: index + 1 });
    }
  }
  if (algorithms.length === 0) continue;

  const files = (await readdir(directoryPath, { withFileTypes: true }))
    .filter(
      (item) =>
        item.isFile() &&
        item.name.endsWith('.md') &&
        item.name !== '00-Standard-Source.md' &&
        item.name !== 'README.md',
    )
    .map((item) => item.name);
  const entries = await Promise.all(
    files.map(async (file) => ({ file, text: await readFile(join(directoryPath, file), 'utf8') })),
  );

  for (const algorithm of algorithms) {
    const matches = entries.filter((entry) => new RegExp(`^#\\s+Algorithm\\s+${algorithm.number}\\b`, 'm').test(entry.text));
    if (matches.length !== 1) {
      errors.push(
        `${directory}: Algorithm ${algorithm.number} must have exactly one primary entry (found ${matches.length})`,
      );
      continue;
    }

    const entry = matches[0];
    const fences = [...entry.text.matchAll(/```[\s\S]*?```/g)].map((match) => match[0]);
    const fencedAlgorithms = [
      ...new Set(
        fences.flatMap((fence) =>
          [...fence.matchAll(/Algorithm\s+(\d+)/g)].map((match) => Number(match[1])),
        ),
      ),
    ];
    const foreignAlgorithms = fencedAlgorithms.filter((number) => number !== algorithm.number);
    if (foreignAlgorithms.length > 0) {
      errors.push(
        `${directory}: Algorithm ${algorithm.number} entry contains other algorithms in a code fence (${foreignAlgorithms.join(', ')})`,
      );
    }
    if (!entry.text.includes('原文摘录') || !entry.text.includes(`Algorithm ${algorithm.number}`)) {
      errors.push(`${directory}: Algorithm ${algorithm.number} has no structured entry (${algorithm.heading})`);
    }
    const requiredSections = [
      '## 标准定义',
      '## 原文定位与引用',
      '## 原文摘录',
      '## 公式或伪代码',
      '## 输入与输出',
      '## 项目映射',
      '## 核验与缺项',
    ];
    const missingSections = requiredSections.filter((section) => !entry.text.includes(section));
    if (missingSections.length > 0) {
      errors.push(
        `${directory}: Algorithm ${algorithm.number} is missing structured sections (${missingSections.join(', ')})`,
      );
    }
    if (!entry.text.includes('完整原文算法块')) {
      errors.push(`${directory}: Algorithm ${algorithm.number} does not declare a complete source algorithm block`);
    }
    if (!entry.text.includes(`#L${algorithm.line}`)) {
      errors.push(
        `${directory}: Algorithm ${algorithm.number} entry does not point to source line ${algorithm.line}`,
      );
    }

    const expectedBlock = extractAlgorithm(sourceLines, sourceLines.findIndex((line) => sourceAlgorithmHeading(line) === algorithm.number));
    const leakedHeadings = expectedBlock.split('\n').filter(isSubsectionHeading);
    if (leakedHeadings.length > 0) {
      errors.push(
        `${directory}: Algorithm ${algorithm.number} source block crosses subsection boundary (${leakedHeadings[0].trim()})`,
      );
    }
    const excerptBlock = fenceForAlgorithm(sectionBody(entry.text, '原文摘录'), algorithm.number);
    const formulaSection = sectionBody(entry.text, '公式或伪代码');
    const formulaBlock = fenceForAlgorithm(formulaSection, algorithm.number);
    if (!excerptBlock || !containsCanonicalBlock(expectedBlock, excerptBlock)) {
      errors.push(`${directory}: Algorithm ${algorithm.number} 原文摘录与 source 算法块不一致或不完整`);
    }
    // A formula field may reference the complete validated excerpt instead of duplicating it.
    const formulaReferencesExcerpt = /\]\(#原文摘录\)/.test(formulaSection);
    if (!formulaReferencesExcerpt && (!formulaBlock || !containsCanonicalBlock(expectedBlock, formulaBlock))) {
      errors.push(`${directory}: Algorithm ${algorithm.number} 公式/伪代码与 source 算法块不一致或不完整`);
    }
  }
  results.push({ directory, algorithms: algorithms.length });
}

if (errors.length > 0) {
  console.error(errors.map((error) => `STANDARD_SPLIT_ERROR ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  const algorithmCount = results.reduce((sum, result) => sum + result.algorithms, 0);
  console.log(`STANDARD_SPLIT_SUMMARY directories=${results.length} algorithms=${algorithmCount} uncovered=0`);
  for (const result of results) console.log(`STANDARD_SPLIT ${result.directory} algorithms=${result.algorithms}`);
}
