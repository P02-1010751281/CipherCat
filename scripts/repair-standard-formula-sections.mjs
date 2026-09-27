import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const standardsRoot = join(root, 'docs', 'standards');
const writeChanges = process.argv.includes('--write');

const excluded = [
  '条目元数据',
  '标准定义',
  '原文定位与引用',
  '原文摘录',
  '输入与输出',
  '项目映射',
  '核验与缺项',
  '来源',
  '官方版本记录',
  '缺项',
  '当前缺项',
  '项目边界',
  '覆盖边界',
  '验证边界',
  'CipherCat 映射',
  'CipherCat 块实现',
  'CipherCat 覆盖',
  'CipherCat 覆盖边界',
];

function parseSections(text) {
  const matches = [...text.matchAll(/^##\s+(.+)\s*$/gm)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
    return {
      heading: match[1].trim(),
      start,
      end,
      body: text.slice(start + match[0].length, end),
    };
  });
}

function isExcluded(heading) {
  return excluded.some((entry) => heading === entry || heading.startsWith(`${entry} `));
}

function isFormulaSection(section) {
  if (isExcluded(section.heading)) return false;
  const heading = section.heading;
  const body = section.body;
  const hasAlgorithmName = /算法|计算|递推|公式|构造|流程|模式|轮函数|消息扩展|压缩|协议|签名|验签|密钥生成|整块|加密|解密|子密钥|状态|参数|定义|规则|函数|原语|完整哈希|派生块|Permutation|Sponge|Hash|AEAD|GCTR|GHASH|J0|LFSR|H1|H2|PKCS|Patterson|NTT|WOTS|FORS/i.test(heading);
  if (!hasAlgorithmName) return false;
  const hasCode = (body.match(/^```/gm) || []).length >= 2;
  const hasFormula = /(?:=|⊕|→|←|∑|∏|mod|CIPH|H\(|\bfor\b|\breturn\b|\bif\b|\bwhile\b)/i.test(body);
  return hasCode || hasFormula;
}

const inlineFormulaRanges = new Map([
  ['sp800-38a-modes/01-ECB.md', ['ECB 对每个分组独立处理：', 'ECB 不隐藏']],
  ['sp800-38a-modes/03-CFB.md', ['CFB 使用', '本项目暂未提供']],
  ['sp800-38a-modes/04-OFB.md', ['OFB 迭代', '本项目暂未提供']],
  ['sp800-38a-modes/05-CTR.md', ['令 `T_j`', 'CTR 可并行']],
]);

function insertBeforeHeading(text, heading, block) {
  const marker = `## ${heading}\n`;
  const index = text.indexOf(marker);
  if (index < 0) return `${text.trimEnd()}\n\n${block.trim()}\n`;
  return `${text.slice(0, index).trimEnd()}\n\n${block.trim()}\n\n${text.slice(index)}`;
}

function repair(text, relativePath) {
  const correctedWording = text.replaceAll(
    '以下完整保留本页已有的公式/伪代码规范单元；仅统一字段层级，不删减公式、步骤、符号或边界。',
    '以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。',
  );
  if (correctedWording.includes('## 公式或伪代码')) {
    return {
      text: correctedWording,
      changed: correctedWording !== text,
      kind: correctedWording === text ? 'existing' : 'wording',
    };
  }
  text = correctedWording;

  const sections = parseSections(text);
  const candidates = sections.filter(isFormulaSection);
  if (candidates.length === 0) {
    const range = inlineFormulaRanges.get(relativePath);
    if (range) {
      const [startMarker, endMarker] = range;
      const start = text.indexOf(startMarker);
      const end = text.indexOf(endMarker, start + startMarker.length);
      if (start >= 0 && end > start) {
        const formula = text.slice(start, end).trim();
        const field = [
          '## 公式或伪代码',
          '',
          '> 以下完整保留本页已有的公式规范单元；仅补充统一字段，不删减公式、步骤、符号或边界。',
          '',
          formula,
        ].join('\n');
        return {
          text: `${text.slice(0, start).trimEnd()}\n\n${field}\n\n${text.slice(end)}`,
          changed: true,
          kind: 'inline',
        };
      }
    }
    const block = [
      '## 公式或伪代码',
      '',
      '> 本条目无独立公式或伪代码规范单元：本页是导航、组合、参数边界或证据缺项页面。',
      `> 相关完整内容请按本页的原文定位回看 source；${relativePath} 不把项目摘要当作标准公式。`,
    ].join('\n');
    return {
      text: insertBeforeHeading(text, '核验与缺项', block),
      changed: true,
      kind: 'undefined',
    };
  }

  const firstCandidate = candidates[0];
  const candidateSet = new Set(candidates);
  const field = [
    '## 公式或伪代码',
    '',
    '> 以下完整保留本页已有的公式/伪代码规范单元；仅统一字段层级，不删减公式、步骤、符号或边界。',
    '',
    ...candidates.flatMap((section) => [
      `### ${section.heading}`,
      section.body.trimEnd(),
      '',
    ]),
  ].join('\n').trimEnd();

  let result = '';
  let cursor = 0;
  for (const section of sections) {
    if (section === firstCandidate) {
      result += text.slice(cursor, section.start);
      result += `${field}\n\n`;
    }
    if (!candidateSet.has(section)) result += text.slice(section.start, section.end);
    cursor = section.end;
  }
  result += text.slice(cursor);
  return { text: result.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', changed: true, kind: 'structured' };
}

const changes = [];
for (const directoryEntry of await readdir(standardsRoot, { withFileTypes: true })) {
  if (!directoryEntry.isDirectory() || directoryEntry.name === 'papers') continue;
  const directoryPath = join(standardsRoot, directoryEntry.name);
  for (const file of await readdir(directoryPath)) {
    if (!file.endsWith('.md') || file === 'README.md' || file.startsWith('00-')) continue;
    const filePath = join(directoryPath, file);
    const original = await readFile(filePath, 'utf8');
    const relativePath = `${directoryEntry.name}/${file}`;
    const result = repair(original, relativePath);
    if (!result.changed) continue;
    changes.push(`${relativePath}: ${result.kind}`);
    if (writeChanges) await writeFile(filePath, result.text);
  }
}

console.log(`${writeChanges ? 'STANDARD_FORMULA_REPAIRED' : 'STANDARD_FORMULA_PLAN'} files=${changes.length}`);
for (const change of changes) console.log(change);
