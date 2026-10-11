/**
 * 给 docs/standards/<dir>/README.md 补“标准内容 + 实现与验证映射”正文。
 *
 * 只有链接和块名的标准页对读者没有信息量；这里用仓库内既有的证据生成正文：
 *   - 结构化条目页的 `标准定位` / `类型` / `项目状态`
 *   - COVERAGE.md 的块 / Demo / 模板 / 指南映射
 *   - CONFORMANCE-INVENTORY.md 的规范语义范围与边界
 * 生成内容包在 <!-- standard-body:start --> 标记内，可重复运行。
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const standardsRoot = resolve(root, 'docs/standards');
const checkOnly = process.argv.includes('--check');
const stale = [];

function read(path) {
  return readFileSync(path, 'utf8');
}

function field(text, name) {
  const match = new RegExp(`^\\|\\s*${name}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, 'm').exec(text);
  if (!match) return '';
  return match[1].replace(/^#\s*/, '').trim();
}

function h1(text) {
  const match = /^#\s+(.+)$/m.exec(text);
  return match ? match[1].trim() : '';
}

/** 读者页不放仓库内部链接：把 [文本](路径) 降级为纯文本。 */
function stripLinks(text) {
  return (
    text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 链接 → 链接文字
      .replace(/https?:\/\/\S+/g, '') // 裸 URL 去掉
      .replace(/\s{2,}/g, ' ')
      .trim() || '—'
  );
}

const coverageRows = new Map();
for (const line of read(join(standardsRoot, 'COVERAGE.md')).split('\n')) {
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 8) continue;
  const dir = cells[2].replace(/^`|`$/g, '').replace(/\/$/, '');
  if (!dir) continue;
  coverageRows.set(dir, { blocks: cells[3], demos: cells[4], templates: cells[5], guide: cells[6] });
}

const inventoryRows = new Map();
for (const line of read(join(standardsRoot, 'CONFORMANCE-INVENTORY.md')).split('\n')) {
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 6) continue;
  const block = /^`([a-z0-9_]+)`$/.exec(cells[1]);
  if (!block) continue;
  inventoryRows.set(block[1], {
    semantics: stripLinks(cells[2]),
    evidence: stripLinks(cells[3]),
    boundary: stripLinks(cells[cells.length - 2] || ''),
  });
}

const list = (cell) =>
  cell && !cell.startsWith('—')
    ? cell
        .split('·')
        .map((item) => item.trim().replace(/`/g, ''))
        .filter(Boolean)
    : [];

let updated = 0;
for (const dir of readdirSync(standardsRoot).sort()) {
  const dirPath = join(standardsRoot, dir);
  const readmePath = join(dirPath, 'README.md');
  if (!existsSync(readmePath) || !readdirSync(dirPath).includes('README.md')) continue;

  const entries = readdirSync(dirPath)
    .filter((f) => f.endsWith('.md') && !f.startsWith('README') && !f.startsWith('00-'))
    .sort();
  const structured = entries.map((file) => {
    const text = read(join(dirPath, file));
    return {
      file,
      title: h1(text) || file.replace(/\.md$/, ''),
      kind: field(text, '类型'),
      position: field(text, '标准定位'),
      status: field(text, '项目状态'),
    };
  });

  const row = coverageRows.get(dir);
  const blocks = list(row?.blocks ?? '');
  const demos = list(row?.demos ?? '');
  const templates = list(row?.templates ?? '');
  const guide = row?.guide && !row.guide.startsWith('—') ? stripLinks(row.guide) : '';
  const title = h1(read(readmePath)).replace(/^#\s*/, '');

  const lines = ['<!-- standard-body:start -->', '', '## 标准内容', ''];
  const positions = [...new Set(structured.map((s) => s.position).filter(Boolean))];
  const scope =
    positions.slice(0, 4).map((position) => `「${position}」`).join('、') +
    (positions.length > 4 ? ' 等' : '');
  lines.push(
    structured.length
      ? `本目录对应 **${title}**，按标准条款拆分为 ${structured.length} 个结构化条目${
          scope ? `，覆盖 ${scope}` : ''
        }。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。`
      : `本目录对应 **${title}**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。`,
    '',
  );
  if (structured.length) {
    lines.push('| 结构化条目 | 内容 | 项目状态 |', '|---|---|---|');
    for (const s of structured) {
      lines.push(`| [${s.title}](./${s.file}) | ${s.position || '—'} | ${s.status || '—'} |`);
    }
    lines.push('');
  }

  lines.push('## 实现与验证映射', '');
  if (blocks.length) {
    lines.push('| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |', '|---|---|---|---|');
    for (const block of blocks) {
      const id = /^[a-z0-9_]+/.exec(block)?.[0] ?? block;
      const qualifier = block.slice(id.length);
      const inv = inventoryRows.get(id);
      lines.push(
        `| \`${id}\`${qualifier} | ${inv?.semantics ?? '—'} | ${inv?.evidence ?? '—'} | ${inv?.boundary ?? '—'} |`,
      );
    }
    lines.push('');
  } else {
    lines.push('本目录当前没有直接映射的积木块：它作为标准依据或索引存在，实现映射见覆盖矩阵。', '');
  }
  const mapping = [];
  if (demos.length) {
    mapping.push(
      `示例工作区：${demos
        .map((d) => (d.startsWith('demos/') ? d : `demos/${d}`))
        .map((d) => `\`${d}\``)
        .join('、')}`,
    );
  }
  if (templates.length) mapping.push(`Procedure 模板：${templates.map((t) => `\`${t}\``).join('、')}`);
  if (guide) mapping.push(`搭建指南：${guide}`);
  lines.push(mapping.length ? `${mapping.join('；')}。` : '暂无示例工作区、模板或搭建指南。', '');
  lines.push(
    '以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。',
    '',
    '<!-- standard-body:end -->',
  );
  const body = `${lines.join('\n')}\n`;

  const original = read(readmePath);
  const withBody = /<!-- standard-body:start -->[\s\S]*?<!-- standard-body:end -->\n?/.test(original)
    ? original.replace(/<!-- standard-body:start -->[\s\S]*?<!-- standard-body:end -->\n?/, body)
    : `${original.trimEnd()}\n\n${body}`;

  if (checkOnly) {
    if (withBody !== original) stale.push(`docs/standards/${dir}/README.md`);
  } else if (withBody !== original) {
    writeFileSync(readmePath, withBody);
    updated += 1;
  }
}

if (checkOnly && stale.length) {
  console.error(`STANDARD_README_STALE files=${stale.length}`);
  for (const file of stale) console.error(file);
  process.exit(1);
}
console.log(
  `STANDARD_README_OK updated=${updated} mode=${checkOnly ? 'check' : 'write'}`,
);
