import { marked, Renderer, type Parser } from 'marked';
import DOMPurify from 'dompurify';
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
  // mermaid 块保留原始文本，渲染后由 mermaid.run 替换为 SVG
  if (language === 'mermaid') {
    return `<pre class="mermaid">${text}</pre>`;
  }
  let highlighted: string;
  try {
    highlighted = hljs.highlight(text, { language }).value;
  } catch {
    highlighted = hljs.highlight(text, { language: 'plaintext' }).value;
  }
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

renderer.table = function (token) {
  // 单元格用子 token 渲染（保留表格内的链接/行内格式），而不是 c.text 纯文本
  const renderCell = (c: { text: string; tokens?: unknown[] }) =>
    c.tokens && c.tokens.length
      ? (this as Renderer).parser.parseInline(c.tokens as Parameters<
          Renderer['parser']['parseInline']
        >[0])
      : c.text;
  const header = token.header.map((h) => `<th>${renderCell(h)}</th>`).join('');
  const rows = token.rows
    .map((row) => {
      const cells = row.map((c) => `<td>${renderCell(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  return `<div class="doc-table-wrapper"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
};

renderer.blockquote = function (token) {
  const inner = this.parser.parse(
    (token as { tokens: unknown[] }).tokens as Parameters<Parser['parse']>[0],
  );
  // 语言切换行（`> [English](./x.en.md) · [中文](./x.md)`）：单段纯链接 →
  // 渲染为普通链接行（.doc-lang-links），不使用引用框样式
  if (/^<p>(?:<a [^>]*>.*?<\/a>[\s·]*)+<\/p>$/.test(inner.trim())) {
    return `<div class="doc-lang-links">${inner.replace(/<\/?p>/g, '').trim()}</div>`;
  }
  return `<blockquote>${inner}</blockquote>`;
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(marked.parse(content, { async: false }) as string);
}

export interface DocFile {
  path: string;       // full path like /docs/standards/fips202-SHA3/01-Theta.md
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
  platform: { zh: '平台文档', en: 'Platform' },
  guides: { zh: '核心文档', en: 'Core Documentation' },
  demos: { zh: '演示搭建教程', en: 'Demos & Tutorials' },
  blocks: { zh: '积木块参考', en: 'Block Reference' },
  // 算法规范（34 类）
  'fips180-4-SHA2': { zh: 'FIPS 180-4 — SHA-2 哈希', en: 'FIPS 180-4 — SHA-2 Hash' },
  'fips186-5-ecdsa': { zh: 'FIPS 186-5 — ECDSA', en: 'FIPS 186-5 — ECDSA' },
  'fips197-AES': { zh: 'FIPS 197 — AES', en: 'FIPS 197 — AES' },
  'fips198-1-hmac': { zh: 'FIPS 198-1 — HMAC', en: 'FIPS 198-1 — HMAC' },
  'fips202-SHA3': { zh: 'FIPS 202 — SHA-3 哈希函数', en: 'FIPS 202 — SHA-3 Hash' },
  'fips203-ML-KEM': { zh: 'FIPS 203 — ML-KEM 密钥封装', en: 'FIPS 203 — ML-KEM Key Encapsulation' },
  'fips204-ML-DSA': { zh: 'FIPS 204 — ML-DSA 数字签名', en: 'FIPS 204 — ML-DSA Digital Signature' },
  'gbt15852-mac': { zh: 'GB/T 15852 — 分组 MAC', en: 'GB/T 15852 — Block-cipher MAC' },
  'gbt17964-modes': { zh: 'GB/T 17964 — 分组模式', en: 'GB/T 17964 — Block Modes' },
  'gbt32905-SM3': { zh: 'GB/T 32905 — SM3 哈希', en: 'GB/T 32905 — SM3 Hash' },
  'gbt32907-SM4': { zh: 'GB/T 32907 — SM4', en: 'GB/T 32907 — SM4' },
  'gbt32915-randomness': { zh: 'GB/T 32915 — 随机性检测', en: 'GB/T 32915 — Randomness Testing' },
  'gbt32918-SM2': { zh: 'GB/T 32918 — SM2 椭圆曲线', en: 'GB/T 32918 — SM2 Elliptic Curve' },
  'gbt33133-ZUC': { zh: 'GB/T 33133 — ZUC 序列密码', en: 'GB/T 33133 — ZUC Stream Cipher' },
  'gbt36624-aead': { zh: 'GB/T 36624 — 认证加密', en: 'GB/T 36624 — AEAD' },
  'gbt38635-SM9': { zh: 'GB/T 38635 — SM9 标识密码', en: 'GB/T 38635 — SM9 Identity Crypto' },
  'gmt0091-kdf': { zh: 'GM/T 0091 — KDF', en: 'GM/T 0091 — KDF' },
  'gmt0103-rng': { zh: 'GM/T 0103 — 随机数发生器', en: 'GM/T 0103 — RNG' },
  'papers': { zh: '论文与参考资料', en: 'Papers & References' },
  'rfc2315-pkcs7': { zh: 'RFC 2315 — PKCS#7', en: 'RFC 2315 — PKCS#7' },
  'rfc4648-base64': { zh: 'RFC 4648 — Base64', en: 'RFC 4648 — Base64' },
  'rfc5869-hkdf': { zh: 'RFC 5869 — HKDF', en: 'RFC 5869 — HKDF' },
  'rfc7748-x25519': { zh: 'RFC 7748 — X25519/X448', en: 'RFC 7748 — X25519/X448' },
  'rfc8032-eddsa': { zh: 'RFC 8032 — EdDSA', en: 'RFC 8032 — EdDSA' },
  'rfc9106-argon2': { zh: 'RFC 9106 — Argon2', en: 'RFC 9106 — Argon2' },
  'sp800-132-pbkdf2': { zh: 'SP 800-132 — PBKDF2', en: 'SP 800-132 — PBKDF2' },
  'sp800-232-ascon': { zh: 'SP 800-232 — ASCON', en: 'SP 800-232 — ASCON' },
  'sp800-38a-modes': { zh: 'SP 800-38A — 分组模式', en: 'SP 800-38A — Block Modes' },
  'sp800-38b-cmac': { zh: 'SP 800-38B — CMAC', en: 'SP 800-38B — CMAC' },
  'sp800-38c-ccm': { zh: 'SP 800-38C — CCM', en: 'SP 800-38C — CCM' },
  'sp800-38d-gcm': { zh: 'SP 800-38D — GCM', en: 'SP 800-38D — GCM' },
  'sp800-38e-xts': { zh: 'SP 800-38E — XTS', en: 'SP 800-38E — XTS' },
  'sp800-90a-drbg': { zh: 'SP 800-90A — DRBG', en: 'SP 800-90A — DRBG' },
  'cnsa-pqc-tracking': { zh: 'CNSA PQC 迁移跟踪', en: 'CNSA PQC Migration Tracking' },
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
  // Fallback: extract from filename, removing number prefix and .md / .en.md
  return filename
    .replace(/^\d{2}-/, '')
    .replace(/\.en\.md$/, '')
    .replace(/\.md$/, '')
    .replace(/-/g, ' ');
}

export function parseOrder(filename: string): number {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}
