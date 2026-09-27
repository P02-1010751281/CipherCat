import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const standardsRoot = join(root, 'docs', 'standards');
const errors = [];
let pages = 0;
let fields = 0;
let codeBlocks = 0;
let noIndependentUnit = 0;
let sourceEvidencePages = 0;

for (const directoryEntry of await readdir(standardsRoot, { withFileTypes: true })) {
  if (!directoryEntry.isDirectory() || directoryEntry.name === 'papers') continue;
  const directoryPath = join(standardsRoot, directoryEntry.name);

  for (const file of await readdir(directoryPath)) {
    if (!file.endsWith('.md') || /^README(?:\.en)?\.md$/.test(file) || file.startsWith('00-')) continue;
    pages += 1;
    const text = await readFile(join(directoryPath, file), 'utf8');
    const marker = file.endsWith('.en.md')
      ? '## Formula or Pseudocode\n'
      : '## 公式或伪代码\n';
    const start = text.indexOf(marker);
    if (start < 0) {
      errors.push(`${directoryEntry.name}/${file}: missing formula/pseudocode field`);
      continue;
    }
    fields += 1;
    const section = text.slice(start + marker.length).split('\n## ')[0].trim();
    if (!section) {
      errors.push(`${directoryEntry.name}/${file}: empty formula/pseudocode field`);
      continue;
    }
    const isSourceEvidence = /RFC `?\.txt`? 证据层条目|RFC .*证据层条目/.test(section);
    if (isSourceEvidence) sourceEvidencePages += 1;
    if ((section.match(/^```/gm) || []).length >= 2) {
      codeBlocks += 1;
    } else if (isSourceEvidence) {
      // The complete RFC text is the source artifact linked by this page.
    } else if (/无独立公式|没有独立归属的公式|不定义独立公式|没有可核对的独立公式|没有可直接核对的单一标准原件|没有从.*完整恢复|只定义.*参数边界|只说明.*职责|没有在本页给出.*具体算法|只保存 AES 标准向量|检测体系总览|检测项目的索引|后端执行边界|Ascon 算法族总览|15 项检测的索引|分组密码操作模式总览/.test(section)
      || /no independently verifiable formula|no independent formula|does not define an independent formula/i.test(section)) {
      noIndependentUnit += 1;
    } else if (!/[=⊕→←∑∏]/.test(section)) {
      errors.push(`${directoryEntry.name}/${file}: formula/pseudocode field has no code block, explicit boundary, or formula symbol`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `STANDARD_FORMULA_ERROR ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`STANDARD_FORMULA_SUMMARY pages=${pages} fields=${fields} markdown_code_blocks=${codeBlocks} source_evidence_pages=${sourceEvidencePages} explicit_non_formula=${noIndependentUnit}`);
}
