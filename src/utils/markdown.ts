import { marked, Renderer } from 'marked';
import hljs from 'highlight.js';

// Configure marked with highlight.js
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Custom renderer for better code blocks
const renderer = new Renderer();

renderer.code = ({ text, lang }) => {
  const language = lang || 'plaintext';
  let highlighted: string;
  try {
    highlighted = hljs.highlight(text, { language }).value;
  } catch {
    highlighted = hljs.highlight(text, { language: 'plaintext' }).value;
  }
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

renderer.table = (token) => {
  const header = token.header.map((h) => `<th>${h.text}</th>`).join('');
  const rows = token.rows
    .map((row) => {
      const cells = row.map((c) => `<td>${c.text}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  return `<div class="doc-table-wrapper"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

export interface DocFile {
  path: string;       // full path like /docs/fips202-SHA3/01-Theta.md
  category: string;   // fips202-SHA3
  filename: string;   // 01-Theta.md
  title: string;      // Theta (display title extracted from content or filename)
  order: number;      // extracted from filename prefix
}

export interface DocCategory {
  id: string;         // fips202-SHA3
  label: string;      // "FIPS 202 — SHA-3"
  files: DocFile[];
}

const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  'fips202-SHA3': { zh: 'FIPS 202 — SHA-3 哈希函数', en: 'FIPS 202 — SHA-3 Hash' },
  'fips203-ML-KEM': { zh: 'FIPS 203 — ML-KEM 密钥封装', en: 'FIPS 203 — ML-KEM Key Encapsulation' },
  'fips204-ML-DSA': { zh: 'FIPS 204 — ML-DSA 数字签名', en: 'FIPS 204 — ML-DSA Digital Signature' },
};

export function getCategoryLabel(catId: string, locale: string): string {
  return CATEGORY_LABELS[catId]?.[locale as 'zh' | 'en'] || catId;
}

export function parseDocTitle(filename: string, content?: string): string {
  // Try to extract title from content's first h1 or h2 heading
  if (content) {
    const match = content.match(/^#\s+(.+)$/m) || content.match(/^##\s+(.+)$/m);
    if (match) return match[1].trim();
  }
  // Fallback: extract from filename, removing number prefix and .md
  return filename
    .replace(/^\d{2}-/, '')
    .replace(/\.md$/, '')
    .replace(/-/g, ' ');
}

export function parseOrder(filename: string): number {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}
