/**
 * 覆盖矩阵汇总计数门禁：COVERAGE.md / COVERAGE.en.md 里的汇总数字
 * 必须能由矩阵表本身重算出来，避免“计数只写在文档里”。
 *
 * 口径（与两页底部说明一致）：
 *   有覆盖 = 该列单元格不以 “—” 开头
 *   标准目录 = standards-manifest.json 的条目数
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const manifest = JSON.parse(
  readFileSync(resolve(root, 'docs/standards/standards-manifest.json'), 'utf8'),
);
const dirs = new Set(manifest.entries.map((entry) => entry.id));
// 研究材料目录不在覆盖矩阵表内，按目录是否存在判定。
const papers = existsSync(resolve(root, 'docs/standards/papers')) ? 1 : 0;

function parseMatrix(file) {
  const lines = readFileSync(resolve(root, file), 'utf8').split('\n');
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    if (/^\|\s*(标准|Standard)\s*\|/.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (!line.startsWith('|')) {
      if (rows.length) inTable = false;
      continue;
    }
    if (/^\|\s*-+/.test(line)) continue;
    const cells = line
      .split('|')
      .map((cell) => cell.trim());
    if (cells.length < 8) continue;
    const dir = cells[2].replace(/^`|`$/g, '').replace(/\/$/, '');
    rows.push({ dir, blocks: cells[3], demo: cells[4], template: cells[5], guide: cells[6] });
  }
  return rows;
}

const hasCoverage = (value) => Boolean(value) && !value.startsWith('—');

function referencedPaths(cell) {
  // 只取 Markdown 链接目标，避免把括号说明文字当成路径。
  return [...cell.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((match) => match[1])
    .filter((target) => /\.(json|md)$/.test(target) && !/^https?:/.test(target));
}

function resolveReference(target) {
  // 矩阵里的 Demo 引用相对仓库根写 `demos/...`，指南引用相对 `docs/standards/`。
  return target.startsWith('demos/')
    ? resolve(root, target)
    : resolve(root, 'docs/standards', target);
}

function summarize(file) {
  const rows = parseMatrix(file);
  const known = rows.filter((row) => dirs.has(row.dir));
  return {
    rows: rows.length,
    mapped: known.length,
    blocks: known.filter((row) => hasCoverage(row.blocks)).length,
    demo: known.filter((row) => hasCoverage(row.demo)).length,
    template: known.filter((row) => hasCoverage(row.template)).length,
    guide: known.filter((row) => hasCoverage(row.guide)).length,
  };
}

function declared(file) {
  const text = readFileSync(resolve(root, file), 'utf8');
  const pick = (key, patterns) => {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) return Number(match[1]);
    }
    missingSummaries.push(`${file}: ${key}`);
    return null;
  };
  const zh = file.endsWith('COVERAGE.md');
  return {
    dirs: pick('dirs', zh ? [/\*\*(\d+)\*\* 个标准与参考目录/] : [/Total standards directories: \*\*(\d+)\*\*/]),
    papers: pick('papers', zh ? [/研究材料目录：\*\*(\d+)\*\*/] : [/Research-material directories: \*\*(\d+)\*\*/]),
    blocks: pick('blocks', zh ? [/有原子块覆盖：\*\*(\d+)\*\*/] : [/With atomic-block coverage: \*\*(\d+)\*\*/]),
    demo: pick('demo', zh ? [/有 Demo：\*\*(\d+)\*\*/] : [/With demos: \*\*(\d+)\*\*/]),
    template: pick('template', zh ? [/有 `proc_\*` 模板：\*\*(\d+)\*\*/] : [/With `proc_\*` templates: \*\*(\d+)\*\*/]),
    guide: pick('guide', zh ? [/有搭建指南：\*\*(\d+)\*\*/] : [/With build guides: \*\*(\d+)\*\*/]),
  };
}

const problems = [];
const missingSummaries = [];
for (const file of ['docs/standards/COVERAGE.md', 'docs/standards/COVERAGE.en.md']) {
  const rows = parseMatrix(file);
  const actual = summarize(file);
  const stated = declared(file);
  const expected = {
    dirs: dirs.size,
    papers,
    blocks: actual.blocks,
    demo: actual.demo,
    template: actual.template,
    guide: actual.guide,
  };
  for (const key of Object.keys(expected)) {
    if (stated[key] !== expected[key]) {
      problems.push(`${file}: ${key} declared=${stated[key]} actual=${expected[key]}`);
    }
  }
  if (actual.mapped !== dirs.size) {
    problems.push(`${file}: matrix rows mapped to manifest=${actual.mapped}, manifest=${dirs.size}`);
  }
  // 每个标准目录必须恰好出现一次，且行内引用的 Demo/指南文件必须真实存在。
  const seen = new Map();
  for (const row of rows) {
    if (!dirs.has(row.dir)) continue;
    seen.set(row.dir, (seen.get(row.dir) ?? 0) + 1);
    for (const key of ['demo', 'guide']) {
      for (const target of referencedPaths(row[key])) {
        if (!existsSync(resolveReference(target))) {
          problems.push(`${file}: ${row.dir} ${key} reference missing: ${target}`);
        }
      }
    }
  }
  for (const [dir, count] of seen) {
    if (count !== 1) problems.push(`${file}: matrix row for ${dir} appears ${count} times`);
  }
  for (const dir of dirs) {
    if (!seen.has(dir)) problems.push(`${file}: matrix row missing for ${dir}`);
  }
}

if (missingSummaries.length) {
  console.error(`COVERAGE_SUMMARY_MISSING ${missingSummaries.length}`);
  for (const item of missingSummaries) console.error(item);
  process.exit(1);
}

if (problems.length) {
  console.error(`COVERAGE_COUNTS_MISMATCH ${problems.length}`);
  for (const problem of problems) console.error(problem);
  process.exit(1);
}

console.log(
  `COVERAGE_COUNTS_OK directories=${dirs.size} rows_per_page=${summarize('docs/standards/COVERAGE.md').rows}`,
);
