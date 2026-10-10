/**
 * 生成用户文档「分步拼装」指南：docs/build/*.md（中英各一份）。
 *
 * 数据来源全部是仓库内的真实工作区与登记证据：
 *   demos/*.json                顶层原子工作区
 *   demos/procedures/*.json     Procedure 封装工作区
 *   demos/evidence.json         每个工作区的证据类别与参数集
 *   demos/tests.json            双语言核对入口与期望值
 *   docs/blocks/*.md            块 ID → 中文/英文说明
 *
 * 输出只描述「拖哪些块、按什么顺序、接到哪个输入」，不写测试命令或源码路径。
 */
import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outDir = resolve(root, 'docs/build');
const checkOnly = process.argv.includes('--check');
const stale = [];

function emit(path, content) {
  if (checkOnly) {
    const existing = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (existing !== content) stale.push(path.replace(`${root}/`, ''));
    return;
  }
  writeFileSync(path, content);
}

const FAMILIES = [
  {
    id: 'symmetric',
    zh: '对称密码与工作模式',
    en: 'Symmetric ciphers and modes',
    introZh: '分组密码、工作模式与认证加密：先按标准轮/模式拼出链，再用接口块或模式块做组合。',
    introEn: 'Block ciphers, modes, and authenticated encryption: assemble round/mode chains from primitives, then compose them with interface or mode blocks.',
    files: [
      'AES-Atomic-Round.json',
      'Procedure-AES-Round.json',
      'procedures/AES-Round.json',
      'procedures/AES-LastRound.json',
      'SM4-Atomic-Round.json',
      'Procedure-SM4-Round.json',
      'procedures/SM4-Round.json',
      'procedures/SM4-Sbox.json',
      'procedures/Mode-ECB.json',
      'procedures/Mode-CBC.json',
      'procedures/Mode-CTR.json',
      'procedures/GCM-Encrypt.json',
      'procedures/CCM-Encrypt.json',
      'procedures/XTS-Encrypt.json',
      'procedures/ASCON.json',
      'procedures/ASCON-Extended.json',
    ],
  },
  {
    id: 'hash',
    zh: '哈希、XOF 与消息认证',
    en: 'Hashing, XOF, and message authentication',
    introZh: '填充、压缩、海绵与 HMAC：这一族最接近“从原语拼出完整接口”，也是理解块链的最佳起点。',
    introEn: 'Padding, compression, sponge, and HMAC: this family is the closest thing to assembling a full interface from primitives and is the best place to learn block chains.',
    files: [
      'SHA256-Atomic-Hash.json',
      'procedures/SHA224-Hash.json',
      'procedures/SHA256-Hash.json',
      'procedures/SHA384-Hash.json',
      'procedures/SHA512-Hash.json',
      'procedures/SHA3-Hash.json',
      'procedures/SM3-Hash.json',
      'procedures/HMAC-SHA256.json',
    ],
  },
  {
    id: 'kdf',
    zh: '密钥派生与口令处理',
    en: 'Key derivation and password processing',
    introZh: 'HKDF/PBKDF2/Argon2 目前以接口块为主，本页说明每个块的输入含义与拼装方式。',
    introEn: 'HKDF, PBKDF2, and Argon2 are currently interface blocks; this page explains each block’s inputs and how it is assembled.',
    files: [
      'procedures/HKDF-SHA256.json',
      'procedures/PBKDF2.json',
      'procedures/PBKDF2-SHA256.json',
      'procedures/PBKDF2-SM3.json',
      'procedures/ARGON2.json',
    ],
  },
  {
    id: 'rng',
    zh: '随机数生成',
    en: 'Random-bit generation',
    introZh: '确定性随机比特生成的教学链与固定回归，随机性测评本身由平台后端执行。',
    introEn: 'Teaching chains and fixed regressions for deterministic random-bit generation; the randomness assessment itself runs on the platform backend.',
    files: ['procedures/DRBG.json', 'procedures/GM-RNG.json'],
  },
  {
    id: 'rsa',
    zh: 'RSA',
    en: 'RSA',
    introZh: 'RSA 目前以接口块提供：密钥生成、加解密和签名验签各一个块，块内是教学用 PKCS#1 v1.5 流程。',
    introEn: 'RSA is provided as interface blocks: one each for key generation, encryption/decryption, and sign/verify, using a teaching PKCS#1 v1.5 flow.',
    files: ['procedures/RSA-Encrypt.json', 'procedures/RSA-Sign.json'],
  },
  {
    id: 'sm2',
    zh: 'SM2',
    en: 'SM2',
    introZh: 'SM2 的点乘与密钥交换可以逐原语拼出，加密和签名由接口块承担。',
    introEn: 'SM2 point multiplication and key exchange can be assembled from primitives; encryption and signature are interface blocks.',
    files: [
      'procedures/SM2-PointMul.json',
      'procedures/SM2-KeyExchange.json',
      'procedures/SM2-Encrypt.json',
      'procedures/SM2-Sign.json',
    ],
  },
  {
    id: 'ecc',
    zh: '椭圆曲线与标识密码',
    en: 'Elliptic curves and identity-based cryptography',
    introZh: 'ECDH、X25519、ECDSA、EdDSA 与 SM9：曲线参数、点运算和协议链的组合方式。',
    introEn: 'ECDH, X25519, ECDSA, EdDSA, and SM9: how curve parameters, point operations, and protocol chains are composed.',
    files: [
      'procedures/ECDH.json',
      'procedures/X25519.json',
      'procedures/ECDSA.json',
      'procedures/EDDSA.json',
      'procedures/SM9-Sign.json',
    ],
  },
  {
    id: 'zuc',
    zh: 'ZUC 序列密码',
    en: 'ZUC stream cipher',
    introZh: 'ZUC 状态变换、密钥流与消息认证：EEA3 与 EIA3 两条链。',
    introEn: 'ZUC state transformation, keystream, and message authentication: the EEA3 and EIA3 chains.',
    files: ['procedures/EEA3.json', 'procedures/EIA3.json'],
  },
  {
    id: 'pq-lattice',
    zh: '后量子密码（格基与共享构件）',
    en: 'Post-quantum cryptography (lattice-based and shared components)',
    introZh: 'ML-KEM 的封装链完全由原语拼出；ML-DSA 的签名接口是单块，底层原语另有示例。',
    introEn: 'The ML-KEM encapsulation chain is assembled entirely from primitives; ML-DSA signing is an interface block with separate primitive examples.',
    files: [
      'ML-KEM-Atomic.json',
      'procedures/ML-KEM-Encaps.json',
      'procedures/ML-DSA-NTT.json',
      'procedures/ML-DSA-Primitives.json',
      'procedures/ML-DSA-Sign.json',
    ],
  },
  {
    id: 'pq-hash',
    zh: '后量子密码（哈希基教学构件）',
    en: 'Post-quantum cryptography (hash-based teaching components)',
    introZh: '哈希链、Merkle 树与 FORS 的教学组合；这些是结构构件，不是 FIPS 205 的兼容实现。',
    introEn: 'Teaching compositions of hash chains, Merkle trees, and FORS; these are structural components, not FIPS 205-compatible implementations.',
    files: [
      'procedures/Hash-Based-Structures.json',
      'procedures/Tree-Index.json',
      'procedures/FORS-Sign.json',
    ],
  },
  {
    id: 'code-based',
    zh: '纠错码、多变量与共享数学构件',
    en: 'Code-based, multivariate, and shared math components',
    introZh: 'GF(2)、GF(2^m)、Goppa 码、多变量与通用数学构件：为多种算法提供可组合的原语。',
    introEn: 'GF(2), GF(2^m), Goppa codes, multivariate, and general math components that other algorithms compose.',
    files: [
      'procedures/Code-Based-Math.json',
      'procedures/GF2m-Poly.json',
      'procedures/Goppa-Decode.json',
      'procedures/Multivariate-Math.json',
      'procedures/PQC-Gaps.json',
      'procedures/Research-Math.json',
      'procedures/Wrap-Up-Math.json',
    ],
  },
];

const CLASS_LABEL = {
  'official-vector': { zh: '标准/官方用例', en: 'standards or official cases' },
  property: { zh: '代数或结构性质', en: 'algebraic or structural properties' },
  'fixed-regression': { zh: '项目固定回归（非官方向量）', en: 'project fixed regression (not an official vector)' },
  'cross-implementation': { zh: '与独立实现交叉核对', en: 'cross-checked with an independent implementation' },
};

const TEXTS = {
  zh: {
    h1: (name) => `# ${name}：分步拼装`,
    lead: '本页按工作区里的真实块链，逐步说明每个功能块怎么拖、接到哪里、最后得到什么。步骤顺序与对应工作区一致；块名后的括号是它在工具箱里的作用，“←”表示这个输入由谁提供——先拖出上游块，再把它的输出插头接到下游块对应的输入。',
    workspaces: '本页覆盖的工作区',
    evidence: '证据类别',
    params: '参数范围',
    basis: '依据',
    check: '核对入口',
    expect: '期望结果',
    steps: '拼装步骤',
    topLevel: '顶层块（按工作区顺序）',
    funcReturn: (n) => `函数 \`${n}\` 的返回值`,
    funcBody: (n) => `函数 \`${n}\` 的过程体（按顺序）`,
    emptyBody: '（该函数体为空，仅用于占位或后续扩展）',
    truncated: '（链路较长，其余步骤按同样方式重复或嵌套；完整块链见对应工作区文件）',
    uses: '该函数用到的算法块',
    constWord: '常量',
    varWord: '变量',
    callWord: '调用',
    numberWord: '数字',
    textWord: '文本',
    deeper: '…（更深层的输入见工作区）',
    sep: '：',
    sameType: (n) => `（同类块 ×${n}）`,
    after: (n) => `后续块 ×${n}（见工作区）`,
    wrap: (text) => `（${text}）`,
    sourceNote: '',
    indexTitle: '# 分步拼装指南',
    indexLead: '按算法家族列出每个工作区的拼装步骤。每个页面说明需要哪些块、按什么顺序连接、得到的期望结果，以及哪些接口目前只能整体调用。',
    indexNote: '本索引由仓库内的工作区与登记证据整理；逐步块链以这里为准，`docs/demos/` 各页只讲场景、输入输出与边界。块的作用说明见积木块参考。',
    back: '返回分步拼装指南',
  },
  en: {
    h1: (name) => `# ${name}: step-by-step assembly`,
    lead: 'This page walks through the real block chain in each workspace: which block to drag, where to connect it, and what it produces. Step order matches the workspace, the parenthesis after each block names its role in the toolbox, and “←” shows what feeds an input — drag the upstream block first, then plug its output into the downstream input.',
    workspaces: 'Workspaces on this page',
    evidence: 'Evidence class',
    params: 'Parameter scope',
    basis: 'Basis',
    check: 'Check',
    expect: 'Expected result',
    steps: 'Assembly steps',
    topLevel: 'Top-level blocks (workspace order)',
    funcReturn: (n) => `Return value of \`${n}\``,
    funcBody: (n) => `Body of \`${n}\` (in order)`,
    emptyBody: '(the body is empty; this function is a placeholder or extension point)',
    truncated: '(the chain is long; the remaining steps repeat or nest the same way — see the workspace file for the complete chain)',
    uses: 'Algorithm blocks used by this function',
    constWord: 'constant',
    varWord: 'variable',
    callWord: 'call',
    numberWord: 'number',
    textWord: 'text',
    deeper: '… (deeper inputs live in the workspace)',
    sep: ': ',
    sameType: (n) => ` (×${n} of the same block)`,
    after: (n) => `${n} following blocks (see the workspace)`,
    wrap: (text) => ` (${text})`,
    sourceNote: '（source text in Chinese）',
    indexTitle: '# Step-by-step assembly guide',
    indexLead: 'Each algorithm family lists the assembly steps for its workspaces: which blocks are needed, how they connect, what result to expect, and which interfaces can only be called as a whole today.',
    indexNote: 'This index is built from the workspaces and registered evidence in the repository. Step-by-step block chains are authoritative here; the pages under `docs/demos/` only cover scenarios, inputs/outputs, and boundaries. Block roles are described in the block reference.',
    back: 'Back to the assembly guide',
  },
};

function buildDescriptionMap(lang) {
  const dir = resolve(root, 'docs/blocks');
  const map = new Map();
  for (const file of readdirSync(dir)) {
    const isEn = file.endsWith('.en.md');
    if (lang === 'en' ? !isEn : isEn) continue;
    const text = readFileSync(join(dir, file), 'utf8');
    for (const line of text.split('\n')) {
      const match = /^\|\s*`([a-z0-9_]+)`\s*\|(.+)\|\s*$/.exec(line);
      if (!match) continue;
      const id = match[1];
      const cells = match[2]
        .split('|')
        .map((cell) => cell.trim())
        .filter(Boolean);
      const desc = cells[cells.length - 1];
      // 只有最后一列是真正的「说明」才采纳；端口/类型列（含 →）不是说明。
      if (!desc || desc === '—' || desc.includes('→') || /^[-\d]+$/.test(desc)) continue;
      if (!map.has(id) || desc.length < map.get(id).length) map.set(id, desc);
    }
  }
  return map;
}

function truncate(value, limit = 64) {
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function fieldSummary(block, lang, ctx, t) {
  const fields = block.fields || {};
  const parts = [];
  const varField = fields.VAR;
  if (varField !== undefined) {
    const id = typeof varField === 'object' && varField !== null ? varField.id : varField;
    const direct = typeof varField === 'object' && varField !== null ? varField.name : undefined;
    const name = direct ?? ctx?.variables.get(id) ?? id;
    if (name) parts.push(`${t.varWord}=${truncate(name, 32)}`);
  }
  for (const [name, raw] of Object.entries(fields)) {
    if (name === 'NAME' && /^procedures_call/.test(block.type)) continue;
    if (name === 'VAR') continue;
    const value = typeof raw === 'object' && raw !== null ? raw.name ?? raw.id : raw;
    if (value === undefined || value === null || value === '') continue;
    parts.push(`${name}=${truncate(value, 40)}`);
  }
  return parts.slice(0, 3).join('，');
}

function hasCJK(text) {
  return /[\u3400-\u9fff]/.test(String(text));
}

function describeBlock(id, descriptions, lang, t) {
  const desc = descriptions.get(id);
  return desc ? `\`${id}\`${t.wrap(truncate(desc, 72))}` : `\`${id}\``;
}

function makeContext(workspace) {
  const variables = new Map();
  for (const entry of workspace.blocks?.variables ?? []) {
    variables.set(entry.id, entry.name);
  }
  return { variables, calls: new Map() };
}

function callTarget(block) {
  const mutation = block.mutation || block.extraState;
  const name = mutation?.name || block.fields?.NAME;
  const args = (mutation?.args ?? mutation?.params ?? []).map((arg) =>
    typeof arg === 'string' ? arg : arg.name,
  );
  return { name: name || '(未命名调用)', args };
}

function renderTree(block, ctx, descriptions, t, lang, pad, depth, lines, maxDepth = 3) {
  if (!block) return;
  const fields = fieldSummary(block, lang, ctx, t);

  if (block.type === 'variables_get') {
    const varField = block.fields?.VAR;
    const id = typeof varField === 'object' && varField !== null ? varField.id : varField;
    const direct = typeof varField === 'object' && varField !== null ? varField.name : undefined;
    const name = direct ?? ctx.variables.get(id) ?? id ?? '—';
    lines.push(`${pad}- ${t.varWord} \`${name}\``);
    return;
  }
  if (block.type === 'data_value') {
    lines.push(`${pad}- ${t.constWord} \`${truncate(block.fields?.NUM ?? '', 60)}\``);
    return;
  }
  if (/^procedures_call/.test(block.type)) {
    const { name, args } = callTarget(block);
    lines.push(`${pad}- ${t.callWord} \`${name}(${args.join(', ')})\``);
  } else if (/^math_number$/.test(block.type)) {
    lines.push(`${pad}- ${t.numberWord} \`${block.fields?.NUM ?? ''}\``);
  } else if (/^text$/.test(block.type)) {
    lines.push(`${pad}- ${t.textWord} \`${truncate(block.fields?.TEXT ?? '', 40)}\``);
  } else {
    lines.push(`${pad}- ${describeBlock(block.type, descriptions, lang, t)}${fields ? `${t.sep}${fields}` : ''}`);
  }

  if (depth >= maxDepth) {
    const inputs = Object.keys(block.inputs || {});
    if (inputs.length) lines.push(`${pad}  - ${t.deeper}`);
    return;
  }
  for (const [name, input] of Object.entries(block.inputs || {})) {
    const child = input?.block;
    if (!child) continue;
    lines.push(`${pad}  - \`${name}\` ←`);
    renderTree(child, ctx, descriptions, t, lang, `${pad}    `, depth + 1, lines);
  }
  const next = block.next?.block;
  if (next) renderTree(next, ctx, descriptions, t, lang, pad, depth, lines);
}

function statementSignature(block) {
  const fields = block.fields || {};
  const keys = Object.keys(fields).filter((name) => name !== 'NAME').sort();
  return `${block.type}|${keys.map((k) => `${k}=${JSON.stringify(fields[k])}`).join(',')}`;
}

function renderStatements(first, ctx, descriptions, t, lang, lines, budget) {
  const list = [];
  for (let node = first; node; node = node.next?.block) list.push(node);
  let index = 0;
  while (index < list.length) {
    if (lines.length > budget) {
      lines.push(`… ${t.truncated}`);
      return;
    }
    const block = list[index];
    const signature = statementSignature(block);
    let repeat = 1;
    while (index + repeat < list.length && statementSignature(list[index + repeat]) === signature) {
      repeat += 1;
    }
    const fields = fieldSummary(block, lang, ctx, t);
    const step = `${index + 1}. ${describeBlock(block.type, descriptions, lang, t)}${
      fields ? `${t.sep}${fields}` : ''
    }${repeat > 1 ? t.sameType(repeat) : ''}`;
    lines.push(step);
    const inputs = Object.entries(block.inputs || {}).filter(([, value]) => value?.block);
    for (const [name, input] of inputs) {
      lines.push(`    - \`${name}\` ←`);
      renderTree(input.block, ctx, descriptions, t, lang, '      ', 1, lines);
    }
    index += repeat;
  }
}

function workspaceLabel(path) {
  return path.replace(/^procedures\//, '').replace(/\.json$/, '');
}

function collectStatements(block) {
  const result = [];
  for (let node = block; node; node = node.next?.block) result.push(node);
  return result;
}

function collectTypes(block, result = new Set()) {
  if (!block) return result;
  result.add(block.type);
  for (const input of Object.values(block.inputs || {})) {
    if (input?.block) collectTypes(input.block, result);
  }
  if (block.next?.block) collectTypes(block.next.block, result);
  return result;
}

function renderWorkspace(path, ctxData, t, lang, descriptions) {
  const file = path;
  const workspace = JSON.parse(readFileSync(resolve(root, 'demos', file), 'utf8'));
  const ctx = makeContext(workspace);
  const evidence = ctxData.evidence[file];
  const test = ctxData.tests[file];
  const lines = [];

  lines.push(`### \`${workspaceLabel(file)}\``);
  lines.push('');
  const meta = [];
  if (evidence) {
    meta.push(`- ${t.evidence}${t.sep}${CLASS_LABEL[evidence.class]?.[lang] ?? evidence.class}`);
    if (evidence.parameterSet) {
      const note = lang === 'en' && hasCJK(evidence.parameterSet) ? t.sourceNote : '';
      meta.push(`- ${t.params}${t.sep}${truncate(evidence.parameterSet, 160)}${note}`);
    }
    if (evidence.evidence) {
      const note = lang === 'en' && hasCJK(evidence.evidence) ? t.sourceNote : '';
      meta.push(`- ${t.basis}${t.sep}${truncate(evidence.evidence, 160)}${note}`);
    }
  }
  if (test?.py?.driver) {
    const firstLine = test.py.driver
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#')) ?? '';
    meta.push(`- ${t.check}${t.sep}\`${truncate(firstLine, 90)}\``);
    if (test.py.expect) meta.push(`- ${t.expect}${t.sep}\`${truncate(test.py.expect, 90)}\``);
  }
  lines.push(...meta);
  lines.push('');
  lines.push(`#### ${t.steps}`);
  lines.push('');

  const tops = workspace.blocks?.blocks ?? [];
  const functions = tops.filter((block) => /^procedures_def/.test(block.type));
  const flat = tops.filter((block) => !/^procedures_def/.test(block.type));

  // 函数参数也参与变量名解析，避免把 `参数 msg` 显示成裸 ID。
  for (const fn of functions) {
    for (const param of fn.extraState?.params ?? fn.mutation?.params ?? []) {
      if (typeof param === 'object' && param?.id && param?.name) ctx.variables.set(param.id, param.name);
    }
  }

  for (const fn of functions) {
    const name = fn.fields?.NAME ?? '(未命名函数)';
    const params = (fn.extraState?.params ?? fn.mutation?.params ?? [])
      .map((param) => (typeof param === 'string' ? param : `${param.name}${param.type ? `: ${param.type}` : ''}`))
      .join(', ');
    const signature = `${name}(${params})`;
    const bodyFirst = fn.inputs?.STACK?.block;
    const returnBlock = fn.inputs?.RETURN?.block;

    if (bodyFirst) {
      lines.push(`**${t.funcBody(signature)}**`);
      lines.push('');
      renderStatements(bodyFirst, ctx, descriptions, t, lang, lines, 400);
      lines.push('');
    } else if (!returnBlock) {
      lines.push(`**${t.funcBody(signature)}**${t.sep}${t.emptyBody}`);
      lines.push('');
    }
    if (returnBlock) {
      lines.push(`**${t.funcReturn(signature)}**`);
      lines.push('');
      renderTree(returnBlock, ctx, descriptions, t, lang, '', 1, lines, 4);
      lines.push('');
    }
    const usedTypes = collectTypes(bodyFirst ?? returnBlock ?? null);
    const used = [...usedTypes]
      .filter((type) => !/^(math_number|text|variables_get|variables_set|data_value)$/.test(type))
      .sort();
    if (used.length) {
      lines.push(`**${t.uses}**${t.sep}${used.map((type) => `\`${type}\``).join(' · ')}`);
      lines.push('');
    }
  }

  if (flat.length) {
    lines.push(`**${t.topLevel}**`);
    lines.push('');
    let index = 0;
    while (index < flat.length) {
      const block = flat[index];
      const signature = statementSignature(block);
      let repeat = 1;
      while (index + repeat < flat.length && statementSignature(flat[index + repeat]) === signature) {
        repeat += 1;
      }
      const fields = fieldSummary(block, lang, ctx, t);
      lines.push(
        `${index + 1}. ${describeBlock(block.type, descriptions, lang, t)}${
          fields ? `${t.sep}${fields}` : ''
        }${repeat > 1 ? t.sameType(repeat) : ''}`,
      );
      for (const [name, input] of Object.entries(block.inputs || {})) {
        if (!input?.block) continue;
        lines.push(`    - \`${name}\` ←`);
        renderTree(input.block, ctx, descriptions, t, lang, '      ', 1, lines);
      }
      const nested = collectStatements(block.next?.block).length;
      if (nested) lines.push(`    - ${t.after(nested)}`);
      index += repeat;
    }
    lines.push('');
  }

  if (!functions.length && !flat.length) {
    lines.push(t.emptyBody);
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const tests = JSON.parse(readFileSync(resolve(root, 'demos/tests.json'), 'utf8'));
  const evidence = JSON.parse(readFileSync(resolve(root, 'demos/evidence.json'), 'utf8'));
  const ctxData = { tests, evidence };
  const allFiles = FAMILIES.flatMap((family) => family.files);
  const registered = Object.keys(tests);
  const missing = registered.filter((path) => !allFiles.includes(path));
  const unknown = allFiles.filter((path) => !registered.includes(path));
  if (missing.length || unknown.length) {
    console.error('FAMILY_MAPPING_MISMATCH', JSON.stringify({ missing, unknown }));
    process.exit(1);
  }

  if (!checkOnly) mkdirSync(outDir, { recursive: true });

  for (const lang of ['zh', 'en']) {
    const descriptions = buildDescriptionMap(lang);
    const t = TEXTS[lang];
    const indexLines = [t.indexTitle, '', t.indexLead, ''];

    for (const family of FAMILIES) {
      const body = [t.h1(lang === 'zh' ? family.zh : family.en), '', lang === 'zh' ? family.introZh : family.introEn, ''];
      body.push(`## ${t.workspaces}`, '');
      body.push('| | |', '|---|---|');
      for (const file of family.files) body.push(`| \`${workspaceLabel(file)}\` | \`demos/${file}\` |`);
      body.push('');
      for (const file of family.files) {
        body.push(renderWorkspace(file, ctxData, t, lang, descriptions));
      }
      const name = lang === 'zh' ? family.zh : family.en;
      const target = `./${family.id}${lang === 'en' ? '.en' : ''}.md`;
      indexLines.push(`- [${name}](${target})（${family.files.length}）`);
      emit(join(outDir, `${family.id}${lang === 'en' ? '.en' : ''}.md`), `${body.join('\n')}\n`);
    }
    indexLines.push('', t.indexNote, '');
    emit(join(outDir, `INDEX${lang === 'en' ? '.en' : ''}.md`), `${indexLines.join('\n')}\n`);
  }

  if (checkOnly && stale.length) {
    console.error(`BUILD_GUIDE_STALE files=${stale.length}`);
    for (const file of stale) console.error(file);
    process.exit(1);
  }
  console.log(
    `BUILD_GUIDE_OK families=${FAMILIES.length} workspaces=${allFiles.length} files=${FAMILIES.length * 2 + 2}${
      checkOnly ? ' mode=check' : ''
    }`,
  );
}

main();
