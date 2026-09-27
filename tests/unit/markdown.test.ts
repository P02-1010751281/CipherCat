import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('dompurify', () => ({
  default: { sanitize: (html: string) => html },
}));

import {
  getCategoryLabel,
  getBlockDocCategories,
  getDocTitle,
  getGuideCategory,
  getStandardDocCategory,
  parseDocTitle,
  parseOrder,
  renderMarkdown,
} from '@/utils/markdown';

describe('markdown document metadata helpers', () => {
  it('prefers a heading when extracting a document title', () => {
    expect(parseDocTitle('01-example.md', '# Actual title\n\nBody')).toBe(
      'Actual title',
    );
  });

  it('falls back to a readable filename title', () => {
    expect(parseDocTitle('02-KECCAK-f.en.md')).toBe('KECCAK f');
  });

  it('sorts numbered documents before unnumbered documents', () => {
    expect(parseOrder('12-NTT.md')).toBe(12);
    expect(parseOrder('Appendix.md')).toBe(999);
  });

  it('returns localized labels and preserves unknown ids', () => {
    expect(getCategoryLabel('fips203-ML-KEM', 'zh')).toContain('ML-KEM');
    expect(getCategoryLabel('gmt0005-randomness', 'zh')).toContain('GM/T 0005');
    expect(getCategoryLabel('fips205-SLH-DSA', 'en')).toContain('SLH-DSA');
    expect(getCategoryLabel('mceliece-goppa', 'en')).toContain('Goppa');
    expect(getCategoryLabel('rfc-references', 'zh')).toContain('RFC');
    expect(getCategoryLabel('unknown-category', 'zh')).toBe('unknown-category');
  });

  it('keeps the FIPS 202 algorithm name KECCAK-p canonical', () => {
    expect(getDocTitle('07-KECCAK-p.md', 'zh')).toBe('KECCAK-p');
    expect(getDocTitle('07-KECCAK-p.en.md', 'en')).toBe('KECCAK-p');
  });

  it('renders an explicit language with a highlighted code block label', () => {
    const html = renderMarkdown('```python\ndef demo(value):\n    return value\n```');
    expect(html).toContain('data-language="Python"');
    expect(html).toContain('language-python');
    expect(html).toContain('hljs-keyword');
  });

  it('adds a source-line anchor to the block containing a cited line', () => {
    const source = '# Heading\n\nFirst paragraph.\nSecond paragraph.\n\n```text\nline 6\n```';
    const html = renderMarkdown(source, 4);
    expect(html).toContain('id="source-line-4"');
    expect(html.indexOf('id="source-line-4"')).toBeLessThan(
      html.indexOf('Second paragraph.'),
    );
  });

  it('adds stable Unicode and duplicate-safe heading IDs for document links', () => {
    const html = renderMarkdown(
      '## 组成变换索引\n\n## Hash / XOF: 摘要\n\n## Hash / XOF: 摘要\n\n## Hash / XOF: 摘要-1',
    );
    expect(html).toContain('id="组成变换索引"');
    expect(html).toContain('id="hash-xof-摘要"');
    expect(html).toContain('id="hash-xof-摘要-1"');
    expect(html).toContain('id="hash-xof-摘要-1-1"');
  });

  it('infers common shell blocks and keeps Mermaid as a diagram block', () => {
    const shell = renderMarkdown('```\nnpm run build\n```');
    const diagram = renderMarkdown('```mermaid\nflowchart LR\n  A --> B\n```');
    expect(shell).toContain('data-language="Bash"');
    expect(diagram).toContain('<pre class="mermaid">');
  });

  it('uses product labels for the setup guide', () => {
    expect(getDocTitle('SETUP.md', 'zh')).toBe('环境搭建与验收');
    expect(getDocTitle('SETUP.en.md', 'en')).toBe('Setup and acceptance');
    expect(getDocTitle('01-Extraction-Gap.md', 'zh')).toBe('原件提取缺项');
    expect(getDocTitle('01-Extraction-Gap.en.md', 'en')).toBe(
      'Original-text extraction gap',
    );
  });

  it('localizes all standard build-guide titles consistently', () => {
    const guides = [
      ['standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md', 'standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md'],
      ['standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-纯基础块.md', 'standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-pure-basic.md'],
      ['standards/fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md', 'standards/fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.en.md'],
      ['standards/gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md', 'standards/gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.en.md'],
    ] as const;

    for (const [chinesePath, englishPath] of guides) {
      const chineseFile = chinesePath.split('/').at(-1)!;
      const englishFile = englishPath.split('/').at(-1)!;
      const chineseMarkdown = readFileSync(new URL(`../../docs/${chinesePath}`, import.meta.url), 'utf8');
      const englishMarkdown = readFileSync(new URL(`../../docs/${englishPath}`, import.meta.url), 'utf8');
      const chineseTitle = getDocTitle(chineseFile, 'zh');
      const englishTitle = getDocTitle(englishFile, 'en');

      expect(chineseTitle).toBe(parseDocTitle(chineseFile, chineseMarkdown));
      expect(englishTitle).toBe(parseDocTitle(englishFile, englishMarkdown));
      expect(englishTitle).not.toMatch(/[\u3400-\u9fff]/);
    }
  });

  it('keeps setup and type-system guides in development docs', () => {
    expect(getGuideCategory('SETUP.md')).toBe('development-guides');
    expect(getGuideCategory('TYPE-SYSTEM.en.md')).toBe('development-guides');
    expect(getGuideCategory('TUTORIALS.md')).toBe('user-guides');
  });

  it('groups algorithm references together in the docs sidebar', () => {
    for (const filename of [
      'INDEX.en.md', 'symmetric.md', 'zuc.en.md', 'hash.md', 'ecc-sbox.md',
      'numtheory.md', 'post-quantum.en.md',
    ]) {
      expect(getBlockDocCategories(filename)).toEqual(['user-reference']);
    }
    expect(getBlockDocCategories('data-encoding.md')).toEqual(['user-reference-foundations']);
  });

  it('groups one-off RFC references together while retaining standard families', () => {
    for (const category of [
      'rfc2315-pkcs7', 'rfc4648-base64', 'rfc5869-hkdf', 'rfc5903-ecdh',
      'rfc7748-x25519', 'rfc8017-pkcs1', 'rfc8032-eddsa', 'rfc9106-argon2',
    ]) {
      expect(getStandardDocCategory(category)).toBe('rfc-references');
    }
    expect(getStandardDocCategory('china-pqc-tracking')).toBe('research');
    expect(getStandardDocCategory('fips203-ML-KEM')).toBe('fips203-ML-KEM');
  });
});
