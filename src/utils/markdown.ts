import { marked, Renderer, type Parser } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configure marked with highlight.js
marked.setOptions({
  breaks: true,
  gfm: true,
});

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  console: 'bash',
  text: 'plaintext',
  txt: 'plaintext',
};

function inferCodeLanguage(source: string): string {
  const text = source.trim();
  if (!text) return 'plaintext';

  if ((text.startsWith('{') || text.startsWith('['))) {
    try {
      JSON.parse(text);
      return 'json';
    } catch {
      // A code block can start with a bracket without being JSON.
    }
  }

  if (/^(?:\$\s*)?(?:npm|pnpm|yarn|node|python3?|cargo|git|podman|docker|cd|mkdir|export|chmod)\b/m.test(text)) {
    return 'bash';
  }
  if (/\b(?:def|elif|from\s+\S+\s+import|import\s+\S+|True|False|None)\b/.test(text)) {
    return 'python';
  }
  if (/\b(?:const|let|function|interface|type|export|import)\b|=>/.test(text)) {
    return 'typescript';
  }
  return 'plaintext';
}

function normalizeCodeLanguage(language: string | undefined, source: string): string {
  const requested = language?.trim().toLowerCase();
  if (!requested) return inferCodeLanguage(source);
  return LANGUAGE_ALIASES[requested] || requested;
}

function displayCodeLanguage(language: string): string {
  const labels: Record<string, string> = {
    bash: 'Bash',
    javascript: 'JavaScript',
    json: 'JSON',
    mermaid: 'Mermaid',
    plaintext: 'Text',
    python: 'Python',
    typescript: 'TypeScript',
  };
  return labels[language] || language;
}

// Custom renderer for better code blocks
const renderer = new Renderer();
const headingIds = new Set<string>();

function slugifyHeading(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[`*_~]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-') || 'section';
}

renderer.heading = function ({ tokens, depth, text }) {
  const baseId = slugifyHeading(text);
  let id = baseId;
  let suffix = 0;
  while (headingIds.has(id)) id = `${baseId}-${++suffix}`;
  headingIds.add(id);
  const content = this.parser.parseInline(tokens);
  return `<h${depth} id="${id}">${content}</h${depth}>`;
};

renderer.code = ({ text, lang }) => {
  const language = normalizeCodeLanguage(lang, text);
  // mermaid 块保留原始文本，渲染后由 mermaid.run 替换为 SVG
  if (language === 'mermaid') {
    return `<pre class="mermaid">${text}</pre>`;
  }
  let highlighted: string;
  try {
    highlighted = hljs.getLanguage(language)
      ? hljs.highlight(text, { language }).value
      : hljs.highlight(text, { language: 'plaintext' }).value;
  } catch {
    highlighted = hljs.highlight(text, { language: 'plaintext' }).value;
  }
  return `<pre class="doc-code" data-language="${displayCodeLanguage(language)}"><code class="hljs language-${language}">${highlighted}</code></pre>`;
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

export function renderMarkdown(content: string, sourceLine?: number): string {
  headingIds.clear();
  let html: string;
  if (sourceLine && sourceLine > 0) {
    const tokens = marked.lexer(content);
    let offset = 0;
    let anchorAdded = false;
    html = tokens
      .map((token) => {
        const start = content.indexOf(token.raw, offset);
        if (start < 0) return marked.parser([token]);
        const end = start + token.raw.length;
        offset = end;
        const firstLine = content.slice(0, start).split('\n').length;
        const lastLine = content.slice(0, end).split('\n').length;
        const anchor = !anchorAdded && token.type !== 'space' &&
          sourceLine >= firstLine && sourceLine <= lastLine;
        if (anchor) anchorAdded = true;
        return `${anchor ? `<span id="source-line-${sourceLine}" class="source-line-anchor"></span>` : ''}${marked.parser([token])}`;
      })
      .join('');
  } else {
    html = marked.parse(content, { async: false }) as string;
  }
  if (typeof DOMPurify.sanitize === 'function') return DOMPurify.sanitize(html);

  // In Node-based checks dompurify exports its factory until it receives a
  // window. The browser bundle takes the first branch; this keeps the same
  // renderer callable by the unit harness without adding a runtime shim.
  if (typeof DOMPurify === 'function' && typeof window !== 'undefined') {
    const purifier = DOMPurify(window);
    if (typeof purifier.sanitize === 'function') return purifier.sanitize(html);
  }

  return html;
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
  platform: { zh: '项目入口', en: 'Project index' },
  research: { zh: '研究报告', en: 'Research Reports' },
  'standards-index': { zh: '标准索引', en: 'Standards Index' },
  'user-guides': { zh: '用户文档', en: 'User documentation' },
  'development-guides': { zh: '开发文档', en: 'Development documentation' },
  'audit-reports': { zh: '审计报告', en: 'Audit reports' },
  'user-demos': { zh: '用户文档 · 演示教程', en: 'User docs · demos' },
  'user-reference': { zh: '密码分类与积木参考', en: 'Cryptographic families and block reference' },
  'user-reference-foundations': { zh: '通用原语 · 数学与数据编码', en: 'Shared primitives · math and encoding' },
  // 算法规范（37 类）
  'fips180-4-SHA2': { zh: 'FIPS 180-4 — SHA-2 哈希', en: 'FIPS 180-4 — SHA-2 Hash' },
  'fips186-5-ecdsa': { zh: 'FIPS 186-5 — ECDSA', en: 'FIPS 186-5 — ECDSA' },
  'fips197-AES': { zh: 'FIPS 197 — AES', en: 'FIPS 197 — AES' },
  'fips198-1-hmac': { zh: 'FIPS 198-1 — HMAC', en: 'FIPS 198-1 — HMAC' },
  'fips202-SHA3': { zh: 'FIPS 202 — SHA-3 哈希函数', en: 'FIPS 202 — SHA-3 Hash' },
  'fips203-ML-KEM': { zh: 'FIPS 203 — ML-KEM 密钥封装', en: 'FIPS 203 — ML-KEM Key Encapsulation' },
  'fips204-ML-DSA': { zh: 'FIPS 204 — ML-DSA 数字签名', en: 'FIPS 204 — ML-DSA Digital Signature' },
  'fips205-SLH-DSA': { zh: 'FIPS 205 — SLH-DSA 哈希签名', en: 'FIPS 205 — SLH-DSA Hash-Based Signature' },
  'gbt15852-mac': { zh: 'GB/T 15852 — 分组 MAC', en: 'GB/T 15852 — Block-cipher MAC' },
  'gbt17964-modes': { zh: 'GB/T 17964 — 分组模式', en: 'GB/T 17964 — Block Modes' },
  'gbt32905-SM3': { zh: 'GB/T 32905 — SM3 哈希', en: 'GB/T 32905 — SM3 Hash' },
  'gbt32907-SM4': { zh: 'GB/T 32907 — SM4', en: 'GB/T 32907 — SM4' },
  'gbt32918-SM2': { zh: 'GB/T 32918 — SM2 椭圆曲线', en: 'GB/T 32918 — SM2 Elliptic Curve' },
  'gbt33133-ZUC': { zh: 'GB/T 33133 — ZUC 序列密码', en: 'GB/T 33133 — ZUC Stream Cipher' },
  'gbt36624-aead': { zh: 'GB/T 36624 — 认证加密', en: 'GB/T 36624 — AEAD' },
  'gbt38635-SM9': { zh: 'GB/T 38635 — SM9 标识密码', en: 'GB/T 38635 — SM9 Identity Crypto' },
  'gmt0005-randomness': { zh: 'GM/T 0005 — 随机性检测', en: 'GM/T 0005 — Randomness Testing' },
  'gmt0091-kdf': { zh: 'GM/T 0091 — KDF', en: 'GM/T 0091 — KDF' },
  'gmt0103-rng': { zh: 'GM/T 0103 — 随机数发生器', en: 'GM/T 0103 — RNG' },
  'mceliece-goppa': { zh: 'Classic McEliece — Goppa 码', en: 'Classic McEliece — Goppa Codes' },
  'papers': { zh: '论文与参考资料', en: 'Papers & References' },
  'rfc-references': { zh: 'RFC 与协议参考', en: 'RFC and protocol references' },
  'sp800-132-pbkdf2': { zh: 'SP 800-132 — PBKDF2', en: 'SP 800-132 — PBKDF2' },
  'sp800-232-ascon': { zh: 'SP 800-232 — ASCON', en: 'SP 800-232 — ASCON' },
  'sp800-38a-modes': { zh: 'SP 800-38A — 分组模式', en: 'SP 800-38A — Block Modes' },
  'sp800-38b-cmac': { zh: 'SP 800-38B — CMAC', en: 'SP 800-38B — CMAC' },
  'sp800-38c-ccm': { zh: 'SP 800-38C — CCM', en: 'SP 800-38C — CCM' },
  'sp800-38d-gcm': { zh: 'SP 800-38D — GCM', en: 'SP 800-38D — GCM' },
  'sp800-38e-xts': { zh: 'SP 800-38E — XTS', en: 'SP 800-38E — XTS' },
  'sp800-90a-drbg': { zh: 'SP 800-90A — DRBG', en: 'SP 800-90A — DRBG' },
  'china-pqc-tracking': { zh: '中国抗量子密码进展', en: 'China PQC Progress' },
};

export function getCategoryLabel(catId: string, locale: string): string {
  const label = CATEGORY_LABELS[catId]?.[locale as 'zh' | 'en'] || catId;
  return locale === 'en' ? normalizeTitleCase(label) : label;
}

export function getStandardDocCategory(category: string): string {
  if (category.startsWith('rfc')) return 'rfc-references';
  if (category === 'china-pqc-tracking') return 'research';
  return category;
}

const GUIDE_CATEGORIES: Record<string, string> = {
  'USER-GUIDE': 'user-guides',
  TUTORIALS: 'user-guides',
  'BLOCKLY-GUIDE': 'user-guides',
  DEMO: 'user-guides',
  'CAPABILITY-MAP': 'user-guides',
  'TYPE-SYSTEM': 'development-guides',
  SETUP: 'development-guides',
  DEVELOPMENT: 'development-guides',
  ARCHITECTURE: 'development-guides',
  'AUDIT-REPORT': 'audit-reports',
};

function filenameStem(filename: string): string {
  return filename
    .replace(/^\d{2}-/, '')
    .replace(/\.en\.md$/, '')
    .replace(/\.md$/, '');
}

export function getGuideCategory(filename: string): string {
  return GUIDE_CATEGORIES[filenameStem(filename)] || 'user-guides';
}

const BLOCK_DOC_CATEGORIES: Record<string, string | string[]> = {
  INDEX: 'user-reference',
  symmetric: 'user-reference',
  zuc: 'user-reference',
  hash: 'user-reference',
  'ecc-sbox': 'user-reference',
  numtheory: 'user-reference',
  'post-quantum': 'user-reference',
  'bitwise-logic': 'user-reference-foundations',
  'data-encoding': 'user-reference-foundations',
};

export function getBlockDocCategories(filename: string): string[] {
  const category = BLOCK_DOC_CATEGORIES[filenameStem(filename)] || 'user-reference-foundations';
  return Array.isArray(category) ? category : [category];
}

export function getPlatformCategory(filename: string): string {
  const stem = filenameStem(filename);
  return stem === 'USAGE' || stem === 'INDEX'
    ? 'user-guides'
    : stem === 'README'
      ? 'platform'
      : 'development-guides';
}

const TITLE_LABELS: Record<string, { zh: string; en: string }> = {
  README: { zh: 'README', en: 'README' },
  // 用户侧入口：这些名称是产品标题，不从文件名机械推导。
  aes: { zh: 'AES', en: 'AES' },
  hash: { zh: '哈希', en: 'Hash' },
  'post-quantum': { zh: '后量子密码', en: 'Post-quantum cryptography' },
  sm2: { zh: 'SM2', en: 'SM2' },
  sm4: { zh: 'SM4', en: 'SM4' },
  INDEX: { zh: '索引', en: 'Index' },
  'bitwise-logic': { zh: '位运算与逻辑', en: 'Bitwise logic' },
  'data-encoding': { zh: '数据编码', en: 'Data encoding' },
  'ecc-sbox': { zh: '椭圆曲线与 S-box', en: 'Elliptic curves and S-boxes' },
  numtheory: { zh: '数论', en: 'Number theory' },
  symmetric: { zh: '对称密码', en: 'Symmetric cryptography' },
  zuc: { zh: 'ZUC', en: 'ZUC' },
  'USER-GUIDE': { zh: '用户指南', en: 'User guide' },
  TUTORIALS: { zh: '用户教程', en: 'User tutorials' },
  'BLOCKLY-GUIDE': { zh: 'Blockly 使用指南', en: 'Blockly usage guide' },
  DEMO: { zh: 'Demo 指南', en: 'Demo guide' },
  'CAPABILITY-MAP': { zh: '能力地图', en: 'Capability map' },
  'TYPE-SYSTEM': { zh: '类型系统', en: 'Type system' },
  SETUP: { zh: '环境搭建与验收', en: 'Setup and acceptance' },
  DEVELOPMENT: { zh: '开发指南', en: 'Development guide' },
  ARCHITECTURE: { zh: '系统架构', en: 'System architecture' },
  'AUDIT-REPORT': { zh: '审计报告', en: 'Audit report' },
  'Standard-Source': { zh: '标准原文', en: 'Standard source' },
  'Extraction-Gap': { zh: '原件提取缺项', en: 'Original-text extraction gap' },
  'ML-KEM-768-Encaps-build-guide': {
    zh: 'ML-KEM-768 Encaps — 高级复合块搭建指南',
    en: 'ML-KEM-768 Encaps — Advanced Composite Blocks Build Guide',
  },
  'ML-KEM-768-Encaps-搭建指南': {
    zh: 'ML-KEM-768 Encaps — 高级复合块搭建指南',
    en: 'ML-KEM-768 Encaps — Advanced Composite Blocks Build Guide',
  },
  'ML-KEM-768-Encaps-pure-basic': {
    zh: 'ML-KEM-768 Encaps — 纯基础块搭建指南',
    en: 'ML-KEM-768 Encaps — Pure Basic Blocks Build Guide',
  },
  'ML-KEM-768-Encaps-纯基础块': {
    zh: 'ML-KEM-768 Encaps — 纯基础块搭建指南',
    en: 'ML-KEM-768 Encaps — Pure Basic Blocks Build Guide',
  },
  'ML-DSA-Sign-搭建指南': {
    zh: 'ML-DSA-44 Sign — 原子原语链搭建指南',
    en: 'ML-DSA-44 Sign — Atomic Primitive Chain Build Guide',
  },
  'ZUC-KeyStream-搭建指南': {
    zh: 'ZUC 密钥流生成 — 搭建指南',
    en: 'ZUC Keystream Generation — Build Guide',
  },
  'K-PKE-KeyGen': { zh: 'K-PKE 密钥生成', en: 'K-PKE key generation' },
  'K-PKE-Encrypt': { zh: 'K-PKE 加密', en: 'K-PKE encryption' },
  'K-PKE-Decrypt': { zh: 'K-PKE 解密', en: 'K-PKE decryption' },
  'ML-KEM-KeyGen': { zh: 'ML-KEM 密钥生成', en: 'ML-KEM key generation' },
  'ML-KEM-KeyGen-internal': { zh: 'ML-KEM 内部密钥生成', en: 'ML-KEM internal key generation' },
  'ML-KEM-Encaps': { zh: 'ML-KEM 封装', en: 'ML-KEM encapsulation' },
  'ML-KEM-Encaps-internal': { zh: 'ML-KEM 内部封装', en: 'ML-KEM internal encapsulation' },
  'ML-KEM-Decaps': { zh: 'ML-KEM 解封装', en: 'ML-KEM decapsulation' },
  'ML-KEM-Decaps-internal': { zh: 'ML-KEM 内部解封装', en: 'ML-KEM internal decapsulation' },
  'ML-DSA.KeyGen': { zh: 'ML-DSA 密钥生成', en: 'ML-DSA key generation' },
  'ML-DSA.Sign': { zh: 'ML-DSA 签名', en: 'ML-DSA signing' },
  'ML-DSA.Verify': { zh: 'ML-DSA 验证', en: 'ML-DSA verification' },
  'ML-DSA.KeyGen_internal': { zh: 'ML-DSA 内部密钥生成', en: 'ML-DSA internal key generation' },
  'ML-DSA.Sign_internal': { zh: 'ML-DSA 内部签名', en: 'ML-DSA internal signing' },
  'ML-DSA.Verify_internal': { zh: 'ML-DSA 内部验证', en: 'ML-DSA internal verification' },
  'HashML-DSA.Sign': { zh: 'HashML-DSA 签名', en: 'HashML-DSA signing' },
  'HashML-DSA.Verify': { zh: 'HashML-DSA 验证', en: 'HashML-DSA verification' },
  SHA2: { zh: 'SHA-2', en: 'SHA-2' },
  SHA3: { zh: 'SHA-3', en: 'SHA-3' },
  SHAKE128example: { zh: 'SHAKE128 示例', en: 'SHAKE128 example' },
  ForExample: { zh: '示例', en: 'Example' },
  'KECCAK-p': { zh: 'KECCAK-p', en: 'KECCAK-p' },
  pad10star1: { zh: 'pad10*1', en: 'pad10*1' },
  h2b: { zh: 'h2b', en: 'h2b' },
  b2h: { zh: 'b2h', en: 'b2h' },
  RoundFunction: { zh: '轮函数', en: 'Round function' },
  'Expansion-Compression': { zh: '消息扩展与压缩', en: 'Expansion and compression' },
  'Hash-HMAC': { zh: '哈希与 HMAC', en: 'Hash and HMAC' },
  'SBox-Linear': { zh: 'S-box 与线性层', en: 'S-box and linear layer' },
  'F-and-LFSR': { zh: 'F 函数与 LFSR', en: 'F function and LFSR' },
  'EEA3-EIA3': { zh: 'EEA3 与 EIA3', en: 'EEA3 and EIA3' },
  'H1-H2-and-Parameters': { zh: 'H1、H2 与参数', en: 'H1, H2, and parameters' },
  'PRF-and-Block': { zh: 'PRF 与分组处理', en: 'PRF and block processing' },
  'Parameter-Boundaries': { zh: '参数边界', en: 'Parameter boundaries' },
  'Hash-XOF': { zh: '哈希与 XOF', en: 'Hash and XOF' },
  'AEAD-Limits': { zh: 'AEAD 限制', en: 'AEAD limits' },
  'GCTR-and-J0': { zh: 'GCTR 与 J0', en: 'GCTR and J0' },
  'Ascon-AEAD128-enc': { zh: 'Ascon-AEAD128 加密', en: 'Ascon-AEAD128 encryption' },
  'Ascon-AEAD128-dec': { zh: 'Ascon-AEAD128 解密', en: 'Ascon-AEAD128 decryption' },
  'Ascon-Hash256': { zh: 'Ascon-Hash256', en: 'Ascon-Hash256' },
  'Ascon-XOF128': { zh: 'Ascon-XOF128', en: 'Ascon-XOF128' },
  'Ascon-CXOF128': { zh: 'Ascon-CXOF128', en: 'Ascon-CXOF128' },
  'BLOCKLY-ARCHITECTURE': { zh: 'Blockly 架构', en: 'Blockly architecture' },
  DEPLOYMENT: { zh: '部署', en: 'Deployment' },
  'ENGINE-ORCHESTRATION': { zh: '引擎编排', en: 'Engine orchestration' },
  'IO-SPEC': { zh: 'I/O 规范', en: 'I/O specification' },
  USAGE: { zh: '使用说明', en: 'Usage guide' },
  MessageExpansion: { zh: '消息扩展', en: 'Message expansion' },
  'MixColumns-AddRoundKey': { zh: 'MixColumns 与 AddRoundKey', en: 'MixColumns and AddRoundKey' },
  KeyExpansion: { zh: '密钥扩展', en: 'Key expansion' },
  'INV-CIPHER': { zh: '逆密码', en: 'Inverse cipher' },
  'EQ-INV-CIPHER': { zh: '等价逆密码', en: 'Equivalent inverse cipher' },
  'KEY-EXPANSION-EIC': { zh: '等价逆密码密钥扩展', en: 'Equivalent inverse cipher key expansion' },
  rc: { zh: 'RC', en: 'RC' },
  'SHA3-functions': { zh: 'SHA-3 函数', en: 'SHA-3 functions' },
  BitsToBytes: { zh: '位到字节', en: 'Bits to bytes' },
  BytesToBits: { zh: '字节到位', en: 'Bytes to bits' },
  ByteEncode: { zh: '字节编码', en: 'Byte encode' },
  ByteDecode: { zh: '字节解码', en: 'Byte decode' },
  SampleNTT: { zh: 'NTT 采样', en: 'Sample NTT' },
  SamplePolyCBD: { zh: 'CBD 多项式采样', en: 'Sample polynomial with CBD' },
  MultiplyNTTs: { zh: 'NTT 乘法', en: 'Multiply NTTs' },
  BaseCaseMultiply: { zh: '基例乘法', en: 'Base-case multiply' },
  IntegerToBits: { zh: '整数到位', en: 'Integer to bits' },
  BitsToInteger: { zh: '位到整数', en: 'Bits to integer' },
  IntegerToBytes: { zh: '整数到字节', en: 'Integer to bytes' },
  CoeffFromThreeBytes: { zh: '从三个字节生成系数', en: 'Coefficient from three bytes' },
  CoeffFromHalfByte: { zh: '从半字节生成系数', en: 'Coefficient from half-byte' },
  SimpleBitPack: { zh: '简单位打包', en: 'Simple bit pack' },
  BitPack: { zh: '位打包', en: 'Bit pack' },
  SimpleBitUnpack: { zh: '简单位解包', en: 'Simple bit unpack' },
  BitUnpack: { zh: '位解包', en: 'Bit unpack' },
  HintBitPack: { zh: '提示位打包', en: 'Hint bit pack' },
  HintBitUnpack: { zh: '提示位解包', en: 'Hint bit unpack' },
  pkEncode: { zh: '公钥编码', en: 'Public-key encode' },
  pkDecode: { zh: '公钥解码', en: 'Public-key decode' },
  skEncode: { zh: '私钥编码', en: 'Secret-key encode' },
  skDecode: { zh: '私钥解码', en: 'Secret-key decode' },
  sigEncode: { zh: '签名编码', en: 'Signature encode' },
  sigDecode: { zh: '签名解码', en: 'Signature decode' },
  w1Encode: { zh: 'w1 编码', en: 'w1 encode' },
  Power2Round: { zh: '二的幂次舍入', en: 'Power-of-two round' },
  'NTT−1': { zh: 'NTT 逆变换', en: 'Inverse NTT' },
  BitRev8: { zh: '8 位反转', en: '8-bit reverse' },
  MontgomeryReduce: { zh: 'Montgomery 约减', en: 'Montgomery reduction' },
  ADRS: { zh: 'ADRS 地址格式', en: 'ADRS address format' },
  WOTS: { zh: 'WOTS+ 一次性签名', en: 'WOTS+ one-time signature' },
  FORS: { zh: 'FORS 少时签名', en: 'FORS few-time signature' },
  'SLH-DSA': { zh: 'SLH-DSA 完整签名方案', en: 'SLH-DSA full signature scheme' },
  gen_len2: { zh: 'WOTS+ 校验和链数', en: 'WOTS+ checksum length' },
  toInt: { zh: '字节串转整数', en: 'Byte string to integer' },
  toByte: { zh: '整数转字节串', en: 'Integer to byte string' },
  base_2b: { zh: 'base-2^b 消息拆分', en: 'base-2^b message split' },
  chain: { zh: 'WOTS+ 哈希链', en: 'WOTS+ hash chain' },
  wots_pkGen: { zh: 'WOTS+ 公钥生成', en: 'WOTS+ public-key generation' },
  wots_sign: { zh: 'WOTS+ 签名生成', en: 'WOTS+ signature generation' },
  wots_pkFromSig: { zh: 'WOTS+ 公钥恢复', en: 'WOTS+ public-key recovery' },
  xmss_node: { zh: 'XMSS 子树节点', en: 'XMSS subtree node' },
  xmss_sign: { zh: 'XMSS 签名生成', en: 'XMSS signature generation' },
  xmss_pkFromSig: { zh: 'XMSS 公钥恢复', en: 'XMSS public-key recovery' },
  ht_sign: { zh: '超树签名生成', en: 'Hypertree signature generation' },
  ht_verify: { zh: '超树签名验证', en: 'Hypertree signature verification' },
  fors_skGen: { zh: 'FORS 私钥值生成', en: 'FORS secret-key value generation' },
  fors_node: { zh: 'FORS 子树节点', en: 'FORS subtree node' },
  fors_sign: { zh: 'FORS 签名生成', en: 'FORS signature generation' },
  fors_pkFromSig: { zh: 'FORS 公钥恢复', en: 'FORS public-key recovery' },
  slh_keygen_internal: { zh: 'SLH-DSA 内部密钥生成', en: 'SLH-DSA internal key generation' },
  slh_sign_internal: { zh: 'SLH-DSA 内部签名生成', en: 'SLH-DSA internal signature generation' },
  slh_verify_internal: { zh: 'SLH-DSA 内部签名验证', en: 'SLH-DSA internal signature verification' },
  slh_keygen: { zh: 'SLH-DSA 密钥生成', en: 'SLH-DSA key generation' },
  slh_sign: { zh: 'SLH-DSA 签名生成', en: 'SLH-DSA signing' },
  hash_slh_sign: { zh: '预哈希 SLH-DSA 签名生成', en: 'Pre-hash SLH-DSA signing' },
  slh_verify: { zh: 'SLH-DSA 签名验证', en: 'SLH-DSA signature verification' },
  hash_slh_verify: { zh: '预哈希 SLH-DSA 签名验证', en: 'Pre-hash SLH-DSA verification' },
  Ecb: { zh: 'ECB', en: 'ECB' },
  Cbc: { zh: 'CBC', en: 'CBC' },
  Cfb: { zh: 'CFB', en: 'CFB' },
  Ofb: { zh: 'OFB', en: 'OFB' },
  Ctr: { zh: 'CTR', en: 'CTR' },
  SM9: { zh: 'SM9', en: 'SM9' },
  kdf: { zh: 'KDF', en: 'KDF' },
  rng: { zh: 'RNG', en: 'RNG' },
  Pbkdf2: { zh: 'PBKDF2', en: 'PBKDF2' },
  ASCON: { zh: 'ASCON', en: 'ASCON' },
  Ascon: { zh: 'ASCON', en: 'ASCON' },
  Aead: { zh: 'AEAD', en: 'AEAD' },
  Ghash: { zh: 'GHASH', en: 'GHASH' },
  Gctr: { zh: 'GCTR', en: 'GCTR' },
  'GCM-AE': { zh: 'GCM-AE', en: 'GCM-AE' },
  'GCM-AD': { zh: 'GCM-AD', en: 'GCM-AD' },
  Inc32: { zh: 'inc32', en: 'inc32' },
  Xts: { zh: 'XTS', en: 'XTS' },
  ECB: { zh: 'ECB', en: 'ECB' },
  CBC: { zh: 'CBC', en: 'CBC' },
  CFB: { zh: 'CFB', en: 'CFB' },
  OFB: { zh: 'OFB', en: 'OFB' },
  CTR: { zh: 'CTR', en: 'CTR' },
  PBKDF2: { zh: 'PBKDF2', en: 'PBKDF2' },
  AEAD: { zh: 'AEAD', en: 'AEAD' },
  GHASH: { zh: 'GHASH', en: 'GHASH' },
  GCTR: { zh: 'GCTR', en: 'GCTR' },
  XTS: { zh: 'XTS', en: 'XTS' },
  inc32: { zh: 'inc32', en: 'inc32' },
  'CBC-MAC': { zh: 'CBC-MAC', en: 'CBC-MAC' },
  SampleInBall: { zh: '球内采样', en: 'Sample in ball' },
  RejNTTPoly: { zh: 'NTT 多项式拒绝采样', en: 'Rejection-sample NTT polynomial' },
  RejBoundedPoly: { zh: '有界多项式拒绝采样', en: 'Rejection-sample bounded polynomial' },
  ExpandA: { zh: '展开 A', en: 'Expand A' },
  ExpandS: { zh: '展开 S', en: 'Expand S' },
  ExpandMask: { zh: '展开掩码', en: 'Expand mask' },
  HighBits: { zh: '高位', en: 'High bits' },
  LowBits: { zh: '低位', en: 'Low bits' },
  MakeHint: { zh: '生成提示', en: 'Make hint' },
  UseHint: { zh: '使用提示', en: 'Use hint' },
  AddNTT: { zh: '加法 NTT', en: 'Add NTT' },
  MultiplyNTT: { zh: '乘法 NTT', en: 'Multiply NTT' },
  AddVectorNTT: { zh: '向量加法 NTT', en: 'Add vector NTT' },
  ScalarVectorNTT: { zh: '标量向量 NTT', en: 'Scalar-vector NTT' },
  MatrixVectorNTT: { zh: '矩阵向量 NTT', en: 'Matrix-vector NTT' },
};

const PRESERVED_TERMS = new Set([
  'AES', 'API', 'ASCON', 'CCM', 'CNSA', 'CMAC', 'DRBG', 'ECDH', 'ECDSA', 'EdDSA',
  'FIPS', 'GCM', 'GB/T', 'GM/T', 'HMAC', 'HKDF', 'INTT', 'JSON', 'KDF', 'MAC',
  'McEliece', 'ML-KEM', 'ML-DSA', 'NIST', 'NTT', 'PKE', 'PKCS#1', 'PKCS#7', 'PQC',
  'README', 'RFC', 'RNG', 'RSA', 'SHA-2', 'SHA-3', 'SHAKE', 'SLH-DSA', 'SM2', 'SM3',
  'SM4', 'SM9', 'SP', '800-38A', '800-38B', '800-38C', '800-38D', '800-38E',
  '800-90A', 'AEAD', 'AES', 'Argon2', 'Base64', 'CBC', 'CCM', 'CFB', 'CTR', 'ECB',
  'Goppa', 'OFB', 'PBKDF2', 'X25519/X448', 'XOF', 'XTS', 'ZUC',
]);

function normalizeTitleCase(title: string): string {
  const normalized = title.replace(/\bML KEM\b/g, 'ML-KEM').replace(/\bML DSA\b/g, 'ML-DSA');
  if (/[\u3400-\u9fff]/.test(normalized)) return normalized;
  return normalized.split(/(\s+)/).map((part, index) => {
    if (/^\s+$/.test(part) || !part) return part;
    if (/[a-z][A-Z]/.test(part) || PRESERVED_TERMS.has(part)) return part;
    const lower = part.toLowerCase();
    return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  }).join('');
}

export function getDocTitle(filename: string, locale: string): string {
  const key = filenameStem(filename);
  const label = TITLE_LABELS[key];
  if (label) return label[locale as 'zh' | 'en'];
  return normalizeTitleCase(parseDocTitle(filename));
}

export function parseDocTitle(filename: string, content?: string): string {
  // Try to extract title from content's first h1 or h2 heading
  if (content) {
    const match = content.match(/^#\s+(.+)$/m) || content.match(/^##\s+(.+)$/m);
    if (match) return match[1].trim();
  }
  // Fallback: extract from filename, removing number prefix and .md / .en.md
  return filenameStem(filename).replace(/-/g, ' ');
}

export function parseOrder(filename: string): number {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}
