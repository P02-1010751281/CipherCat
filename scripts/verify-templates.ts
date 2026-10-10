/**
 * 模板（Crypto Templates / proc_* / crypto_*_func）注入正确性 + 可执行性验证
 *
 * 用法:
 *   node dist-verify/verify-templates.js            # 全部 29 模板
 *   node dist-verify/verify-templates.js <name>     # 单个（如 proc_sm4_round）
 *
 * 模板 = _makeTemplateBlock 创建的「单参数教学起点」块：创建时由 onchange 处理器读取
 * TEMPLATE_PREFILL 并注入 RETURN 原子链（buildReturnChain：variables_get → ... → 根块）。
 * 链末块的部分输入（rk/key/iv/B 等）设计上留空待用户补全 —— 模板不是完整算法，
 * 本 harness 只验证预填结构、代码生成/执行和显式配置的输出断言，不证明算法正确性或标准符合性；
 * 实际算法证据由适用的独立测试或 Demo 提供，二者不要求同名。验证内容包括：
 *   1. 调用实际 onchange 预填处理器，核对创建出的 RETURN/BODY 块链和参数骨架
 *   2. 生成代码可执行（空输入走默认值不崩溃）
 *   3. 对显式配置期望值的模板，执行结果与该期望值一致
 */
import { JSDOM } from 'jsdom';
import type * as BlocklyCore from 'blockly/core';
import {
  MLKEM_ENCAPS_BODY_STATE,
  MLKEM_ENCAPS_RETURN_STATE,
} from '@/blocks/procedure/encaps-prefill';

const DRIVER_TIMEOUT_MS = 30_000;

interface TemplateCase {
  name: string;
  paramName: string;
  paramType?: string;
  additionalParams?: Array<{ name: string; type: string }>;
  returnChain: string[];
  chainFields?: Record<string, Record<string, string>>;
  // 执行验证：driver 附加代码 + 期望输出（空 = 仅验证生成与可执行）
  pyDriver?: string;
  pyExpect?: string;
  jsDriver?: string;
  jsExpect?: string;
  /** 多语句 body 预填（ML-KEM-Encaps 等）：注入后形态的 STACK 链 + RETURN state */
  bodyState?: unknown;
  returnState?: unknown;
  /** 迭代骨架模板的实际 BODY 次数 */
  bodyTimes?: string;
}

type DemoGlobals = typeof globalThis & {
  document: unknown;
  window: unknown;
  DOMParser: unknown;
  XMLSerializer: unknown;
  Node: unknown;
  Element: unknown;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// 与 src/blocks/procedure/blocks.ts TEMPLATE_PREFILL 对齐（29 模板）
// returnChain 顺序：叶子 → 根（buildReturnChain 语义）
const TEMPLATES: TemplateCase[] = [
  { name: 'crypto_hash_func', paramName: 'message', paramType: 'message', returnChain: ['variables_get', 'hash_sha256_pad'] },
  { name: 'crypto_encrypt_func', paramName: 'message', paramType: 'message', returnChain: ['variables_get', 'mode_ecb_encrypt'] },
  { name: 'crypto_decrypt_func', paramName: 'ciphertext', paramType: 'message', returnChain: ['variables_get', 'mode_ecb_decrypt'] },
  { name: 'proc_aes_round', paramName: 'state', paramType: 'int_list', returnChain: ['variables_get', 'aes_sub_bytes', 'aes_shift_rows', 'aes_mix_columns', 'aes_add_round_key'] },
  { name: 'proc_aes_last_round', paramName: 'state', paramType: 'int_list', returnChain: ['variables_get', 'aes_sub_bytes', 'aes_shift_rows', 'aes_add_round_key'] },
  { name: 'proc_sha256_hash', paramName: 'msg', paramType: 'message', returnChain: ['variables_get', 'hash_sha256_pad'] },
  { name: 'proc_sm3_hash', paramName: 'msg', paramType: 'message', returnChain: ['variables_get', 'hash_sm3_pad'] },
  { name: 'proc_ntt_vec', paramName: 'vec', paramType: 'int_list', returnChain: ['variables_get', 'pq_ntt'] },
  { name: 'proc_pq_cbd', paramName: 'seed', paramType: 'seed', returnChain: ['variables_get', 'pq_sample_poly_cbd'] },
  { name: 'proc_pq_sample', paramName: 'seed', paramType: 'seed', returnChain: ['variables_get', 'pq_sample_ntt'] },
  { name: 'proc_pq_vec_add', paramName: 'a', paramType: 'int_list', returnChain: ['variables_get', 'pq_poly_add'] },
  { name: 'proc_pq_vec_sub', paramName: 'a', paramType: 'int_list', returnChain: ['variables_get', 'pq_poly_sub'] },
  { name: 'proc_pq_mat_mul', paramName: 'mat', paramType: 'int_list', returnChain: ['variables_get', 'pq_mat_vec_mul'] },
  { name: 'proc_mode_ecb', paramName: 'data', returnChain: ['variables_get', 'mode_ecb_encrypt'] },
  { name: 'proc_mode_cbc', paramName: 'data', returnChain: ['variables_get', 'mode_cbc_encrypt'] },
  { name: 'proc_mode_ctr', paramName: 'data', returnChain: ['variables_get', 'mode_ctr_encrypt'] },
  // Intentionally a CTR-only starting scaffold, not a GCM implementation.
  { name: 'proc_mode_gcm', paramName: 'data', returnChain: ['variables_get', 'mode_ctr_encrypt'] },
  { name: 'proc_sponge_duplex', paramName: 'state', paramType: 'int_list', returnChain: ['variables_get', 'sponge_squeeze'] },
  { name: 'proc_sm4_round', paramName: 'state', paramType: 'int_list', returnChain: ['variables_get', 'sm4_round_func'],
    pyDriver: "state = [0x01,0x23,0x45,0x67]\nprint(''.join(f'{b:02x}' for b in Tpl_sm4_round(state)))",
    jsDriver: "var state = [0x01,0x23,0x45,0x67];\nconsole.log(Tpl_sm4_round(state).map(b=>b.toString(16).padStart(2,'0')).join(''));" },
  { name: 'proc_hmac_sha256', paramName: 'key', returnChain: ['variables_get', 'hash_hmac'] },
  { name: 'proc_sm3_hmac', paramName: 'key', returnChain: ['variables_get', 'hash_hmac'], chainFields: { hash_hmac: { HASH: 'SM3' } } },
  { name: 'proc_mlkem_keygen', paramName: 'seed', paramType: 'seed', returnChain: ['variables_get', 'pq_sample_poly_cbd', 'pq_ntt'] },
  { name: 'proc_zuc_keystream', paramName: 'key', returnChain: ['variables_get', 'zuc_keystream'] },
  {
    name: 'proc_mlkem_encaps', paramName: 'ek', paramType: 'bytes',
    additionalParams: [{ name: 'm', type: 'bytes' }], returnChain: [],
    bodyState: MLKEM_ENCAPS_BODY_STATE, returnState: MLKEM_ENCAPS_RETURN_STATE,
    pyDriver: 'ek = bytes(800)\nm = bytes(32)\nprint(len(Tpl_mlkem_encaps(ek, m)) > 0)',
    pyExpect: 'True',
    jsDriver: 'var ek = new Uint8Array(800); var m = new Uint8Array(32);\nconsole.log(Tpl_mlkem_encaps(ek, m).length > 0);',
    jsExpect: 'true',
  },
  // BODY 预填模板（return 链只 variables_get，算法在 BODY）
  { name: 'proc_pbkdf2', paramName: 'password', returnChain: ['variables_get'], bodyTimes: '1000' },
  { name: 'proc_hkdf', paramName: 'ikm', returnChain: ['variables_get'], bodyTimes: '2' },
  { name: 'proc_aes_key_schedule', paramName: 'key', returnChain: ['variables_get'], bodyTimes: '10' },
  { name: 'proc_sm4_key_schedule', paramName: 'key', returnChain: ['variables_get'], bodyTimes: '32' },
  { name: 'proc_md_iterate', paramName: 'iv', paramType: 'int_list', returnChain: ['variables_get'], bodyTimes: '16' },
];

// Independent structural expectation for the ML-KEM encapsulation template.
// Keep this separate from MLKEM_ENCAPS_BODY_STATE so a production-state change
// cannot silently change both the fixture and its expected result.
const MLKEM_ENCAPS_BODY = [
  ['H', 'sponge_squeeze'], ['G', 'sponge_squeeze'], ['Kp', 'pq_bytes_slice'],
  ['r', 'pq_bytes_slice'], ['rho', 'pq_bytes_slice'], ['t0', 'pq_byte_decode'],
  ['t1', 'pq_byte_decode'], ['A00', 'pq_sample_ntt'], ['A01', 'pq_sample_ntt'],
  ['A10', 'pq_sample_ntt'], ['A11', 'pq_sample_ntt'], ['s0', 'pq_sample_poly_cbd'],
  ['s1', 'pq_sample_poly_cbd'], ['e1_0', 'pq_sample_poly_cbd'],
  ['e1_1', 'pq_sample_poly_cbd'], ['e2', 'pq_sample_poly_cbd'],
  ['sh0', 'pq_ntt'], ['sh1', 'pq_ntt'], ['u0', 'pq_poly_add'],
  ['u1', 'pq_poly_add'], ['v', 'pq_poly_add'], ['mu', 'pq_decompress'],
  ['c1a', 'pq_byte_encode'], ['c1b', 'pq_byte_encode'], ['c1', 'pq_byte_concat'],
  ['c2', 'pq_byte_encode'], ['c', 'pq_byte_concat'], ['ret', 'pq_byte_concat'],
] as const;

const PYTHON_PARAMETER_TYPES: Record<string, string> = {
  bytes: 'bytes', int: 'int', int_list: 'list[int]', poly: 'list[int]',
  seed: 'bytes', key: 'bytes', message: 'bytes',
};
const JAVASCRIPT_PARAMETER_TYPES: Record<string, string> = {
  bytes: 'Uint8Array', int: 'number', int_list: 'number[]', poly: 'number[]',
  seed: 'Uint8Array', key: 'Uint8Array', message: 'Uint8Array',
};

function collectStateBlockTypes(state: unknown, types: string[] = []): string[] {
  if (Array.isArray(state)) {
    state.forEach((value) => collectStateBlockTypes(value, types));
  } else if (state && typeof state === 'object') {
    const record = state as Record<string, unknown>;
    if (typeof record.type === 'string') types.push(record.type);
    Object.values(record).forEach((value) => collectStateBlockTypes(value, types));
  }
  return types;
}

function readValueChain(root: BlocklyCore.Block | null, valueInputType: number): string[] {
  const rootFirst: string[] = [];
  let current = root;
  while (current) {
    rootFirst.push(current.type);
    const input = current.inputList.find((item) =>
      item.type === valueInputType && item.connection?.targetBlock(),
    );
    current = input?.connection?.targetBlock() ?? null;
  }
  return rootFirst.reverse();
}

function templateFunctionName(name: string): string {
  return name.replace(/^proc_/, 'Tpl_').replace(/^crypto_/, 'Tpl_');
}

function expectedTemplateParameters(tc: TemplateCase): Array<{ name: string; type: string }> {
  return [
    { name: tc.paramName, type: tc.paramType || 'bytes' },
    ...(tc.additionalParams || []),
  ];
}

function readTemplateParameters(block: BlocklyCore.Block): Array<{ name: string; type: string }> {
  if (block.getField('PARAM_NAME_0')) {
    const parameters: Array<{ name: string; type: string }> = [];
    for (let i = 0; ; i++) {
      const name = block.getFieldValue(`PARAM_NAME_${i}`);
      if (typeof name !== 'string') break;
      const type = block.getFieldValue(`PARAM_TYPE_${i}`);
      if (typeof type !== 'string') throw new Error(`${block.type}: 参数 ${i} 缺少类型`);
      parameters.push({ name, type });
    }
    return parameters;
  }

  const name = block.getFieldValue('PARAM_NAME');
  const type = block.getFieldValue('PARAM_TYPE');
  if (typeof name !== 'string' || typeof type !== 'string') {
    throw new Error(`${block.type}: 缺少单参数定义`);
  }
  return [{ name, type }];
}

async function main() {
  const filter = process.argv[2];
  const cases = filter ? TEMPLATES.filter((t) => t.name === filter) : TEMPLATES;
  if (!cases.length) { console.error(`未知模板: ${filter}`); process.exit(1); }

  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost/' });
  const demoGlobals = globalThis as DemoGlobals;
  demoGlobals.document = dom.window.document;
  demoGlobals.window = dom.window;
  demoGlobals.DOMParser = dom.window.DOMParser;
  demoGlobals.XMLSerializer = dom.window.XMLSerializer;
  demoGlobals.Node = dom.window.Node;
  demoGlobals.Element = dom.window.Element;

  const Blockly = (await import('blockly/core')).default ?? await import('blockly/core');
  // headless 环境无 i18n 加载：setLocale 灌入官方英文消息（原生块 + FieldVariable 所需全部 Msg 键；
  // v13 的 msg/*.mjs 只导出常量不自动设置 Msg，必须显式 setLocale）
  const { setLocale } = await import('blockly/core');
  const enMsgs = await import('blockly/msg/en');
  setLocale(enMsgs);
  await import('blockly/blocks');
  // 记录 Blockly 内置块身份：此后新出现的类型都来自本项目，可据此发现未登记的“影子身份”。
  const nativeBlockTypes = new Set(Object.keys(Blockly.Blocks));
  // 平台无关：metacrypt 的 vite.verify.config.ts 将 @/blocks 别名到 features/blockly/core/blocks
  const { ALL_BLOCK_TYPES, COMPAT_BLOCK_TYPES } = await import('@/blocks');
  const { TEMPLATE_TYPES } = await import('@/blocks/procedure/blocks');
  await import('@/generators/python');
  await import('@/generators/javascript');
  const { pythonGenerator } = await import('blockly/python');
  const { javascriptGenerator } = await import('blockly/javascript');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { execFileSync } = await import('node:child_process');
  const inventoryPath = path.resolve(process.cwd(), 'docs/standards/CONFORMANCE-INVENTORY.md');
  const inventory = fs.readFileSync(inventoryPath, 'utf8');
  const blockSection = inventory.split('## Blockly 块清单与适用类别\n')[1]?.split('\n## Procedure 模板身份')[0];
  const compatSection = inventory.split('## 兼容与已废弃注册身份\n')[1]?.split('\n## Blockly 块清单与适用类别')[0];
  const templateSection = inventory.split('## Procedure 模板身份\n')[1]?.split('\n## Demo 身份与关系')[0];
  const demoSection = inventory.split('## Demo 身份与关系\n')[1]?.split('\n## 当前映射边界与待补证据')[0];
  const noDemoSection = inventory.split('### 尚未出现在 Demo 工作区的块\n')[1]?.split('\n## 维护规则')[0];
  if (!blockSection || !compatSection || !templateSection || !demoSection || !noDemoSection) {
    throw new Error('符合性对象清单缺少必需章节');
  }

  const listedBlocks = blockSection.split('\n')
    .filter((line) => line.startsWith('| `'))
    .flatMap((line) => [...(line.split('|')[3] || '').matchAll(/`([a-z][a-z0-9_]*)`/g)].map((m) => m[1]));
  const listedTemplates = [...templateSection.matchAll(/^\| `((?:proc|crypto)_[^`]+)` \|/gm)].map((m) => m[1]);
  const listedCompat = [...compatSection.matchAll(/^\| `([a-z][a-z0-9_]*)` \|/gm)].map((m) => m[1]);
  const demoList = demoSection.split('```text\n')[1]?.split('\n```')[0]?.split('\n').filter(Boolean) || [];
  const demoBlockRows = new Map([...demoSection.matchAll(/^\| `([^`]+\.json)` \| (.*?) \|$/gm)]
    .map((m) => [m[1], [...m[2].matchAll(/`([a-z][a-z0-9_]*)`/g)].map((entry) => entry[1])]));
  const demoRegistry = Object.keys(JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'demos/tests.json'), 'utf8')));
  const sameSet = (actual: readonly string[], listed: readonly string[]) =>
    actual.length === listed.length && new Set(actual).size === actual.length &&
    actual.every((name) => listed.includes(name));
  if (!sameSet(ALL_BLOCK_TYPES, listedBlocks)) {
    throw new Error(`块清单与 ALL_BLOCK_TYPES 不一致（注册 ${ALL_BLOCK_TYPES.length}，清单 ${listedBlocks.length}）`);
  }
  if (!sameSet(COMPAT_BLOCK_TYPES, listedCompat)) {
    throw new Error(`兼容身份清单与 COMPAT_BLOCK_TYPES 不一致（注册 ${COMPAT_BLOCK_TYPES.length}，清单 ${listedCompat.length}）`);
  }
  const registeredBlockTypes = Object.keys(Blockly.Blocks);
  // 允许集合 = 194 活动块 + 26 个模板专有身份 + 已登记兼容身份；其余新注册类型都视为未登记的“影子身份”。
  const undocumentedBlockTypes = registeredBlockTypes.filter((type) =>
    !nativeBlockTypes.has(type) &&
    !(ALL_BLOCK_TYPES as readonly string[]).includes(type) &&
    !(TEMPLATE_TYPES as readonly string[]).includes(type) &&
    !(COMPAT_BLOCK_TYPES as readonly string[]).includes(type));
  const missingCompatBlocks = COMPAT_BLOCK_TYPES.filter((type) => !registeredBlockTypes.includes(type));
  const conflictingCompatBlocks = COMPAT_BLOCK_TYPES.filter((type) => (ALL_BLOCK_TYPES as readonly string[]).includes(type));
  const missingTemplateBlocks = TEMPLATE_TYPES.filter((type) => !registeredBlockTypes.includes(type) && !(ALL_BLOCK_TYPES as readonly string[]).includes(type));
  if (undocumentedBlockTypes.length || missingCompatBlocks.length || conflictingCompatBlocks.length || missingTemplateBlocks.length) {
    throw new Error([
      undocumentedBlockTypes.length ? `已注册但未登记的块身份: ${undocumentedBlockTypes.join(', ')}` : '',
      missingCompatBlocks.length ? `兼容身份未注册: ${missingCompatBlocks.join(', ')}` : '',
      conflictingCompatBlocks.length ? `兼容身份与活动清单冲突: ${conflictingCompatBlocks.join(', ')}` : '',
      missingTemplateBlocks.length ? `模板身份既未注册也未列入活动清单: ${missingTemplateBlocks.join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }
  const blockDocsDirectory = path.resolve(process.cwd(), 'docs/blocks');
  const blockDocNames = fs.readdirSync(blockDocsDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'INDEX.md' && name !== 'INDEX.en.md');
  const chineseBlockDocs = blockDocNames
    .filter((name) => !name.endsWith('.en.md'))
    .map((name) => fs.readFileSync(path.join(blockDocsDirectory, name), 'utf8'));
  const englishBlockDocs = blockDocNames
    .filter((name) => name.endsWith('.en.md'))
    .map((name) => fs.readFileSync(path.join(blockDocsDirectory, name), 'utf8'));
  const isDocumented = (type: string, documents: string[]) =>
    documents.some((document) => document.includes(`\`${type}\``));
  const missingChineseBlockDocs = ALL_BLOCK_TYPES.filter((type) => !isDocumented(type, chineseBlockDocs));
  const missingEnglishBlockDocs = ALL_BLOCK_TYPES.filter((type) => !isDocumented(type, englishBlockDocs));
  if (missingChineseBlockDocs.length || missingEnglishBlockDocs.length) {
    throw new Error([
      missingChineseBlockDocs.length ? `块缺少中文详细文档: ${missingChineseBlockDocs.join(', ')}` : '',
      missingEnglishBlockDocs.length ? `块缺少英文详细文档: ${missingEnglishBlockDocs.join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }
  const blockDefinitions = Blockly.Blocks as Record<string, unknown>;
  const missingBlockly = ALL_BLOCK_TYPES.filter((type) => !blockDefinitions[type]);
  const missingPython = ALL_BLOCK_TYPES.filter((type) => !pythonGenerator.forBlock[type]);
  const missingJavaScript = ALL_BLOCK_TYPES.filter((type) => !javascriptGenerator.forBlock[type]);
  if (missingBlockly.length || missingPython.length || missingJavaScript.length) {
    throw new Error([
      missingBlockly.length ? `Blockly 未注册: ${missingBlockly.join(', ')}` : '',
      missingPython.length ? `Python 生成器缺失: ${missingPython.join(', ')}` : '',
      missingJavaScript.length ? `JavaScript 生成器缺失: ${missingJavaScript.join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }
  const registryWorkspace = new Blockly.Workspace();
  Blockly.Events.disable();
  try {
    for (const type of ALL_BLOCK_TYPES) registryWorkspace.newBlock(type);
  } finally {
    Blockly.Events.enable();
    registryWorkspace.dispose();
  }
  // ITEM-1：逐块 I/O 契约底稿。直接从真实 Blockly 块提取端口/字段签名，作为“输入输出契约”的
  // 机器可核来源；`npm run block-io:write` 生成，默认运行则校验其与代码一致（防止契约漂移）。
  const blockIoContract: Record<string, unknown> = {};
  const contractWorkspace = new Blockly.Workspace();
  Blockly.Events.disable();
  try {
    for (const type of [...ALL_BLOCK_TYPES].sort()) {
      const block = contractWorkspace.newBlock(type);
      const inputs = block.inputList.map((input) => ({
        name: input.name,
        type: input.type,
        check: input.connection?.getCheck() ?? null,
      }));
      const fields = block.inputList.flatMap((input) => input.fieldRow
        .filter((field) => typeof field.name === 'string' && field.name)
        .map((field) => {
          const dropdown = field as unknown as { getOptions?: (useCache?: boolean) => unknown };
          let options: unknown = undefined;
          try {
            const raw = dropdown.getOptions?.(true);
            if (Array.isArray(raw) && raw.every((entry) => Array.isArray(entry))) options = raw;
          } catch {
            options = undefined; // 动态下拉（如变量列表）不纳入静态契约
          }
          return { name: field.name, fieldClass: field.constructor.name, options };
        }));
      blockIoContract[type] = {
        inputs,
        fields,
        outputCheck: block.outputConnection?.getCheck() ?? null,
        previousStatement: block.previousConnection?.getCheck() ?? null,
        nextStatement: block.nextConnection?.getCheck() ?? null,
      };
    }
  } finally {
    Blockly.Events.enable();
    contractWorkspace.dispose();
  }
  const contractPath = path.resolve(process.cwd(), 'docs/standards/BLOCK-IO-CONTRACT.json');
  const contractText = `${JSON.stringify(blockIoContract, null, 2)}\n`;
  if (process.env.WRITE_BLOCK_IO === '1') {
    fs.writeFileSync(contractPath, contractText);
  } else if (!fs.existsSync(contractPath)) {
    throw new Error('缺少 docs/standards/BLOCK-IO-CONTRACT.json（用 `npm run block-io:write` 生成）');
  } else if (fs.readFileSync(contractPath, 'utf8') !== contractText) {
    throw new Error('块 I/O 契约与代码不一致：请运行 `npm run block-io:write` 并复核差异');
  }
  if (!sameSet(TEMPLATE_TYPES, listedTemplates)) {
    throw new Error(`模板清单与 TEMPLATE_TYPES 不一致（注册 ${TEMPLATE_TYPES.length}，清单 ${listedTemplates.length}）`);
  }
  if (!sameSet(TEMPLATE_TYPES, TEMPLATES.map((template) => template.name))) {
    throw new Error(`模板注册表与验证用例不一致（注册 ${TEMPLATE_TYPES.length}，用例 ${TEMPLATES.length}）`);
  }
  const templateOverlap = TEMPLATE_TYPES.filter((type) => ALL_BLOCK_TYPES.includes(type as typeof ALL_BLOCK_TYPES[number]));
  if (templateOverlap.length !== 3 || !sameSet(templateOverlap, [
    'crypto_encrypt_func', 'crypto_decrypt_func', 'crypto_hash_func',
  ])) {
    throw new Error(`模板与基础块重合身份异常：${templateOverlap.join(', ')}`);
  }
  // 194 活动块 + 29 模板身份 − 3 重合 = 220 去重类型；文档必须写明该数字且与代码一致。
  const unionBlockTypeCount = new Set<string>([...ALL_BLOCK_TYPES, ...TEMPLATE_TYPES]).size;
  const unionMarker = `去重后共 **${unionBlockTypeCount} 个**`;
  if (!inventory.includes(unionMarker)) {
    throw new Error(`块与模板合并去重计数未同步（应为 ${unionBlockTypeCount} 个）`);
  }
  if (!sameSet(demoRegistry, demoList)) {
    throw new Error(`Demo 清单与 demos/tests.json 不一致（登记 ${demoRegistry.length}，清单 ${demoList.length}）`);
  }
  if (demoBlockRows.size !== demoList.length || !sameSet(demoList, [...demoBlockRows.keys()])) {
    throw new Error(`Demo 块映射表数量/身份不一致（Demo ${demoList.length}，映射 ${demoBlockRows.size}）`);
  }
  // Demo 证据说明覆盖：每个登记 Demo 都必须在双语 Demo 索引里出现，且索引里引用的 .json 必须真实存在。
  for (const readme of ['demos/README.md', 'demos/README.en.md']) {
    const readmeText = fs.readFileSync(path.resolve(process.cwd(), readme), 'utf8');
    const undocumented = demoList.filter((demo) => !readmeText.includes(`\`${demo}\``));
    if (undocumented.length) {
      throw new Error(`${readme} 缺少 Demo 证据说明: ${undocumented.join(', ')}`);
    }
    const referenced = [...new Set([...readmeText.matchAll(/`([A-Za-z0-9_/.-]+\.json)`/g)].map((m) => m[1]))];
    const dangling = referenced.filter((reference) =>
      !fs.existsSync(path.resolve(process.cwd(), 'demos', reference)) &&
      !fs.existsSync(path.resolve(process.cwd(), reference)));
    if (dangling.length) {
      throw new Error(`${readme} 引用了不存在的文件: ${dangling.join(', ')}`);
    }
  }
  // Demo 证据台账：每条登记 Demo 必须有唯一条目，类别受控，官方向量必须标注标准来源。
  const evidenceClasses = new Set(['official-vector', 'cross-implementation', 'property', 'fixed-regression']);
  const standardReference = /(FIPS|SP 800|GB\/T|GM\/T|RFC|IEEE|ISO\/IEC)/;
  const evidencePath = path.resolve(process.cwd(), 'demos/evidence.json');
  if (!fs.existsSync(evidencePath)) {
    throw new Error('缺少 demos/evidence.json 证据台账');
  }
  const evidenceLedger = JSON.parse(fs.readFileSync(evidencePath, 'utf8')) as Record<string, { class?: string; evidence?: string; parameterSet?: string }>;
  const ledgerKeys = Object.keys(evidenceLedger);
  if (!sameSet(demoList, ledgerKeys)) {
    const missing = demoList.filter((demo) => !ledgerKeys.includes(demo));
    const extra = ledgerKeys.filter((key) => !demoList.includes(key));
    throw new Error(`Demo 证据台账与登记不一致（缺 ${missing.length}: ${missing.join(', ')}；多 ${extra.length}: ${extra.join(', ')}）`);
  }
  for (const [demo, entry] of Object.entries(evidenceLedger)) {
    if (!entry.class || !evidenceClasses.has(entry.class)) {
      throw new Error(`Demo 证据台账类别无效: ${demo} → ${String(entry.class)}`);
    }
    if (!entry.evidence || !entry.evidence.trim()) {
      throw new Error(`Demo 证据台账缺少 evidence 说明: ${demo}`);
    }
    if (entry.class === 'official-vector' && !standardReference.test(entry.evidence)) {
      throw new Error(`官方向量条目必须标注标准来源: ${demo}`);
    }
    // 官方向量还必须给出可定位的条款/示例/用例，只有标准名不算可追溯。
    const vectorLocator = /(附录|Appendix|§|\bExample\b|示例|Test ?Case|\btcId\b|\btgId\b|\bTC\d|\bTEST ?\d|\bVector\b|\bA\.\d|\bF\.\d|\bC\.\d|\b\d+\.\d)/i;
    if (entry.class === 'official-vector' && !vectorLocator.test(entry.evidence)) {
      throw new Error(`官方向量条目必须给出条款/示例/用例定位: ${demo}`);
    }
    // ITEM-2：官方向量必须写明覆盖的参数集/变体，避免“某算法通过”被外推到其它参数集。
    if (entry.class === 'official-vector' && (!entry.parameterSet || !entry.parameterSet.trim())) {
      throw new Error(`官方向量条目必须声明参数集: ${demo}`);
    }
  }
  // 台账类别计数必须与 Inventory 的说明一致，避免文档计数与台账漂移。
  const classCounts = new Map<string, number>();
  for (const entry of Object.values(evidenceLedger)) {
    classCounts.set(entry.class!, (classCounts.get(entry.class!) || 0) + 1);
  }
  for (const className of evidenceClasses) {
    const expected = classCounts.get(className) || 0;
    if (!inventory.includes(`\`${className}\`（${expected}`)) {
      throw new Error(`证据类别计数未同步: \`${className}\` 应为 ${expected}`);
    }
  }
  // 官方向量必须对应到仓库已跟踪的标准目录（ITEM-2：端点↔标准来源可机检）。
  const manifest = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'docs/standards/standards-manifest.json'), 'utf8')) as {
    entries: Array<{ id: string; standard?: string }>;
  };
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const manifestIds = manifest.entries.map((entry) => normalize(entry.id));
  const manifestStandards = manifest.entries.map((entry) => normalize(entry.standard || ''));
  const MIN_SHARED_PREFIX = 6;
  const matchesTrackedStandard = (token: string) => {
    const normalized = normalize(token);
    if (normalized.length < MIN_SHARED_PREFIX) return false;
    for (let length = normalized.length; length >= MIN_SHARED_PREFIX; length -= 1) {
      const prefix = normalized.slice(0, length);
      if (manifestIds.some((id) => id.startsWith(prefix)) || manifestStandards.some((std) => std.includes(prefix))) {
        return true;
      }
    }
    return false;
  };
  const standardTokenPattern = /(FIPS\s?\d+[-\d]*|SP\s?800-\d+[A-Za-z]?|RFC\s?\d+|GB\/T\s?\d+(?:\.\d+)?|GM\/T\s?\d+|IEEE\s?\d+)/g;
  for (const [demo, entry] of Object.entries(evidenceLedger)) {
    if (entry.class !== 'official-vector') continue;
    const tokens = [...entry.evidence!.matchAll(standardTokenPattern)].map((match) => match[1]);
    if (!tokens.some(matchesTrackedStandard)) {
      throw new Error(`官方向量条目未对应到已跟踪的标准目录: ${demo}（识别到的标准: ${tokens.join(' | ') || '无'}）`);
    }
  }
  // ITEM-2：端点级矩阵。由已门禁的两份数据源（Inventory 的 Demo↔块映射表 + demos/evidence.json）
  // 生成，因此不存在手写漂移：每个登记 Demo 一行，列出它覆盖的块、证据类别、参数集与依据。
  const endpointRows = demoList.map((demo) => {
    const blocks = (demoBlockRows.get(demo) || []).filter((type) => (ALL_BLOCK_TYPES as readonly string[]).includes(type));
    const entry = evidenceLedger[demo];
    const gap = entry?.class === 'official-vector'
      ? '仅覆盖所列参数集/用例，非完整测试集'
      : entry?.class === 'cross-implementation'
        ? '独立实现交叉，非官方向量'
        : entry?.class === 'property'
          ? '性质/结构断言，非官方向量'
          : '项目固定回归，未登记官方来源';
    return `| \`${demo}\` | ${blocks.map((type) => `\`${type}\``).join(' · ') || '—'} | \`${entry?.class || '?'}\` | ${entry?.parameterSet || '—'} | ${(entry?.evidence || '—').replace(/\|/g, '/')} | ${gap} |`;
  });
  const endpointMatrix = [
    '# 端点级来源与参数范围矩阵（自动生成）',
    '',
    '> 本文件由 `npm run endpoint-matrix:write` 从 `docs/standards/CONFORMANCE-INVENTORY.md` 的 Demo↔块映射表与',
    '> `demos/evidence.json` 生成；`npm run verify:all` 会重算并逐字节比对，任一侧变更而未重新生成即失败。',
    '> 它回答 ITEM-2 的“每个标准化端点是否有适用测试来源与参数范围”，但**不代表**任何一项已通过官方验证或认证。',
    '',
    '| 端点（登记 Demo） | 覆盖块 | 证据类别 | 参数集/变体 | 依据 | 缺口（本行不能证明什么） |',
    '|---|---|---|---|---|---|',
    ...endpointRows,
    '',
  ].join('\n');
  const endpointMatrixPath = path.resolve(process.cwd(), 'docs/standards/ENDPOINT-MATRIX.md');
  if (process.env.WRITE_ENDPOINT_MATRIX === '1') {
    fs.writeFileSync(endpointMatrixPath, endpointMatrix);
  } else if (!fs.existsSync(endpointMatrixPath)) {
    throw new Error('缺少 docs/standards/ENDPOINT-MATRIX.md（用 `npm run endpoint-matrix:write` 生成）');
  } else if (fs.readFileSync(endpointMatrixPath, 'utf8') !== endpointMatrix) {
    throw new Error('端点级矩阵与证据台账/清单不一致：请运行 `npm run endpoint-matrix:write`');
  }
  const customBlockTypes = new Set<string>(ALL_BLOCK_TYPES);
  const usedByDemos = new Set<string>();
  for (const demo of demoList) {
    const workspace = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'demos', demo), 'utf8'));
    const used = new Set<string>();
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (typeof record.type === 'string' && customBlockTypes.has(record.type)) used.add(record.type);
        Object.values(record).forEach(visit);
      }
    };
    visit(workspace);
    used.forEach((type) => usedByDemos.add(type));
    const mapped = demoBlockRows.get(demo) || [];
    if (!sameSet([...used], mapped)) {
      throw new Error(`Demo ${demo} 的工作区块类型与清单不一致`);
    }
  }
  const listedWithoutDemo = noDemoSection.split('```text\n')[1]?.split('\n```')[0]?.split('\n').filter(Boolean) || [];
  const expectedWithoutDemo = ALL_BLOCK_TYPES.filter((type) => !usedByDemos.has(type));
  if (!sameSet(expectedWithoutDemo, listedWithoutDemo)) {
    throw new Error(`无 Demo 直接引用的块清单不一致（实际 ${expectedWithoutDemo.length}，清单 ${listedWithoutDemo.length}）`);
  }
  if (!noDemoSection.includes(`**${expectedWithoutDemo.length} 个**`)) {
    throw new Error(`无 Demo 直接引用块的计数说明未同步（应为 ${expectedWithoutDemo.length} 个）`);
  }
  // 单测字面量索引：只表示 tests/unit/ 中以字符串字面量出现该块类型；它不是行为覆盖证明。
  const unitTestSources = (function readTestSources(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return readTestSources(entryPath);
      return entry.name.endsWith('.ts') ? [fs.readFileSync(entryPath, 'utf8')] : [];
    });
  })(path.resolve(process.cwd(), 'tests/unit'));
  const hasUnitTestLiteral = (type: string) => unitTestSources.some((source) =>
    source.includes(`'${type}'`) || source.includes(`"${type}"`) || source.includes(`\`${type}\``));
  const withoutDirectEvidence = expectedWithoutDemo.filter((type) => !hasUnitTestLiteral(type));
  const noEvidenceSection = inventory.split('### 既无 Demo 也无单测字面量命中的块\n')[1]?.split('\n## ')[0];
  if (!noEvidenceSection) {
    throw new Error('符合性对象清单缺少“既无 Demo 也无单测字面量命中的块”章节');
  }
  // 允许空清单：用 '```' 而不是 '\n```' 截断，避免空代码块时把后续正文当作条目。
  const listedNoEvidence = noEvidenceSection.split('```text\n')[1]?.split('```')[0]?.split('\n').filter(Boolean) || [];
  if (!sameSet(withoutDirectEvidence, listedNoEvidence)) {
    throw new Error(`既无 Demo 也无单测字面量命中的块清单不一致（实际 ${withoutDirectEvidence.length}，清单 ${listedNoEvidence.length}）`);
  }
  if (!noEvidenceSection.includes(`**${withoutDirectEvidence.length} 个**`)) {
    throw new Error(`“既无 Demo 也无单测字面量命中”的计数说明未同步（应为 ${withoutDirectEvidence.length} 个）`);
  }
  // 证据入口覆盖：每个活动块必须要么在逐块证据表里有行，要么被已登记 Demo 执行覆盖。
  const perBlockEvidenceSection = inventory.split('### 已核对的逐块测试证据\n')[1]?.split('### 跨切面的运行时输出类型检查')[0];
  if (!perBlockEvidenceSection) {
    throw new Error('符合性对象清单缺少“已核对的逐块测试证据”章节');
  }
  const perBlockEvidenceTypes = new Set<string>();
  // 每行的“规范语义范围”必须要么给出标准族依据，要么明确标注无独立规范依据（ITEM-1 逐项要求）。
  const semanticsBasisPattern = /(FIPS|SP\s?800|GB\/T|GM\/T|RFC|ISO\/IEC|IEEE|通用|教学|研究|项目|非标准|自定|无独立|无直接|无标准)/;
  const lacksBasis: string[] = [];
  const danglingEvidence: string[] = [];
  for (const line of perBlockEvidenceSection.split('\n')) {
    if (!line.startsWith('| `')) continue;
    for (const match of (line.split('|')[1] || '').matchAll(/`([a-z][a-z0-9_]*)`/g)) {
      perBlockEvidenceTypes.add(match[1]);
    }
    if (!semanticsBasisPattern.test(line.split('|')[2] || '')) {
      lacksBasis.push((line.split('|')[1] || '').trim());
    }
    // 证据列里引用的测试文件/Demo 必须真实存在（ITEM-1 的“可追到验证证据”）。
    for (const reference of (line.split('|')[3] || '').matchAll(
      /(?:\.\.\/\.\.\/)?((?:tests\/unit\/[A-Za-z0-9._-]+\.test\.ts)|(?:demos\/[A-Za-z0-9._/-]+\.json))/g,
    )) {
      if (!fs.existsSync(path.resolve(process.cwd(), reference[1]))) {
        danglingEvidence.push(`${(line.split('|')[1] || '').trim()} → ${reference[1]}`);
      }
    }
  }
  if (danglingEvidence.length) {
    throw new Error(`逐块证据行引用了不存在的文件: ${danglingEvidence.join('; ')}`);
  }
  if (lacksBasis.length) {
    throw new Error(`逐块证据行的“规范语义范围”既无标准依据也未标注无独立依据: ${lacksBasis.join(', ')}`);
  }
  // 逐行引用的标准必须能对应到仓库已跟踪的标准目录（ITEM-1：规范语义可追溯）。
  const rowStandardTokens = (semantics: string) =>
    [...semantics.matchAll(/(FIPS\s?\d+[-\d]*|SP\s?800-\d+[A-Za-z]?|RFC\s?\d+|GB\/T\s?\d+(?:\.\d+)?|GM\/T\s?\d+|ISO\/IEC\s?\d+|IEEE\s?\d+)/g)].map((match) => match[1]);
  const unlinkedStandards: string[] = [];
  for (const line of perBlockEvidenceSection.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const semantics = line.split('|')[2] || '';
    const tokens = rowStandardTokens(semantics);
    if (!tokens.length) continue;
    const linked = tokens.some((token) => {
      const normalized = token.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (let length = normalized.length; length >= 6; length -= 1) {
        const prefix = normalized.slice(0, length);
        if (manifestIds.some((id) => id.startsWith(prefix))) return true;
      }
      return false;
    });
    // 只有整格没有可直接对应目录时才豁免；豁免词必须明确表示"没有独立标准依据"，
    // 不能用「通用/教学/研究/项目」这类描述词绕过标准目录核对。
    if (!linked && !/无独立|无直接|无标准|非标准|自定/.test(semantics)) {
      unlinkedStandards.push(`${(line.split('|')[1] || '').trim()} → ${tokens.join('|')}`);
    }
  }
  if (unlinkedStandards.length) {
    throw new Error(`逐块证据行引用的标准未对应到已跟踪目录: ${unlinkedStandards.join('; ')}`);
  }
  const documentedEvidenceTypes = ALL_BLOCK_TYPES.filter((type) => perBlockEvidenceTypes.has(type));
  const demoOnlyEvidenceTypes = ALL_BLOCK_TYPES.filter((type) => usedByDemos.has(type) && !perBlockEvidenceTypes.has(type));
  const withoutAnyEvidenceType = ALL_BLOCK_TYPES.filter((type) => !usedByDemos.has(type) && !perBlockEvidenceTypes.has(type));
  if (withoutAnyEvidenceType.length) {
    throw new Error(`既无逐块证据行也无 Demo 覆盖的块: ${withoutAnyEvidenceType.join(', ')}`);
  }
  for (const marker of [`**${documentedEvidenceTypes.length} 个**`, `**${demoOnlyEvidenceTypes.length} 个**`]) {
    if (!perBlockEvidenceSection.includes(marker)) {
      throw new Error(`证据入口覆盖计数的计数说明未同步（缺 ${marker}）`);
    }
  }

  const blockPrototype = Blockly.Block.prototype as unknown as {
    initSvg?: () => void;
    render?: () => void;
  };
  const originalInitSvg = blockPrototype.initSvg;
  const originalRender = blockPrototype.render;
  blockPrototype.initSvg = () => undefined;
  blockPrototype.render = () => undefined;
  const templateWorkspaces = new Map<string, Blockly.Workspace>();
  Blockly.Events.disable();
  try {
    for (const tc of TEMPLATES) {
      const workspace = new Blockly.Workspace();
      let keepWorkspace = false;
      try {
        const root = workspace.newBlock(tc.name);
        root.setFieldValue(templateFunctionName(tc.name), 'FUNC_NAME');
        const onchange = (root as unknown as { onchange?: (event: unknown) => void }).onchange;
        if (!onchange) throw new Error(`${tc.name}: 模板未注册 onchange 预填处理器`);
        onchange.call(root, { type: 'create', blockId: root.id });
        const actualParameters = readTemplateParameters(root);
        const expectedParameters = expectedTemplateParameters(tc);
        if (JSON.stringify(actualParameters) !== JSON.stringify(expectedParameters)) {
          throw new Error(`${tc.name}: 实际参数定义不符（${JSON.stringify(actualParameters)}）`);
        }
        const bodyRoot = root.getInput('BODY')?.connection?.targetBlock() ?? null;
        const returnRoot = root.getInput('RETURN')?.connection?.targetBlock() ?? null;
        const actualReturnChain = readValueChain(returnRoot, Blockly.inputs.inputTypes.VALUE);
        if (tc.returnChain.length && (actualReturnChain.length !== tc.returnChain.length ||
            actualReturnChain.some((type, index) => type !== tc.returnChain[index]))) {
          throw new Error(`${tc.name}: 实际 RETURN 链与预期不符（${actualReturnChain.join(' → ')}）`);
        }
        if ((tc.bodyState || tc.bodyTimes) && !bodyRoot) {
          throw new Error(`${tc.name}: 实际 BODY 未注入`);
        }
        if (tc.bodyTimes && (bodyRoot?.type !== 'ctrl_iterate' || String(bodyRoot.getFieldValue('TIMES')) !== tc.bodyTimes)) {
          throw new Error(`${tc.name}: BODY 循环次数错误`);
        }
        if (tc.returnState && !returnRoot) {
          throw new Error(`${tc.name}: 实际 RETURN 状态未注入`);
        }
        if (tc.name === 'proc_mlkem_encaps') {
          const actualStatements: string[] = [];
          let statement = bodyRoot;
          while (statement) {
            const name = statement.getField('VAR')?.getText();
            const valueType = statement.getInput('VALUE')?.connection?.targetBlock()?.type;
            actualStatements.push(`${name}:${valueType}`);
            statement = statement.getNextBlock();
          }
          const expectedStatements = MLKEM_ENCAPS_BODY.map(([name, valueType]) => `${name}:${valueType}`);
          if (actualStatements.length !== expectedStatements.length ||
              actualStatements.some((entry, index) => entry !== expectedStatements[index])) {
            throw new Error(`${tc.name}: BODY 语句顺序、赋值名或表达式根类型错误（实际 ${actualStatements.join(',')}；预期 ${expectedStatements.join(',')}）`);
          }
          if (returnRoot?.type !== 'variables_get' || returnRoot.getField('VAR')?.getText() !== 'ret') {
            throw new Error(`${tc.name}: RETURN 未连接到 ret 变量`);
          }
        }
        const expectedTypes = [
          tc.name,
          ...tc.returnChain,
          ...collectStateBlockTypes(tc.bodyState),
          ...collectStateBlockTypes(tc.returnState),
          ...(tc.bodyTimes ? ['ctrl_iterate'] : []),
        ].sort();
        const actualTypes = workspace.getAllBlocks(false).map((block) => block.type).sort();
        if (expectedTypes.length !== actualTypes.length || expectedTypes.some((type, index) => type !== actualTypes[index])) {
          throw new Error(`${tc.name}: 实际预填块集合与声明不一致`);
        }
        const stateBeforeRepeat = JSON.stringify(Blockly.serialization.workspaces.save(workspace));
        onchange.call(root, { type: 'create', blockId: root.id });
        const stateAfterRepeat = JSON.stringify(Blockly.serialization.workspaces.save(workspace));
        if (stateAfterRepeat !== stateBeforeRepeat) {
          throw new Error(`${tc.name}: 重复触发 onchange 后工作区状态发生变化`);
        }
        templateWorkspaces.set(tc.name, workspace);
        keepWorkspace = true;
      } finally {
        if (!keepWorkspace) workspace.dispose();
      }
    }
  } finally {
    Blockly.Events.enable();
    if (originalInitSvg) blockPrototype.initSvg = originalInitSvg;
    else delete blockPrototype.initSvg;
    if (originalRender) blockPrototype.render = originalRender;
    else delete blockPrototype.render;
  }

  const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
    (process.platform === 'win32' ? 'python' : 'python3');

  let pass = 0, fail = 0;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ciphercat-tpl-'));
  process.once('exit', () => fs.rmSync(tmpDir, { recursive: true, force: true }));

  for (const tc of cases) {
    const ws = templateWorkspaces.get(tc.name);
    if (!ws) throw new Error(`${tc.name}: 未保留实际模板工作区`);
    const pyCode = pythonGenerator.workspaceToCode(ws) as string;
    const jsCode = javascriptGenerator.workspaceToCode(ws) as string;

    const problems: string[] = [];
    const params = expectedTemplateParameters(tc);
    const functionName = templateFunctionName(tc.name);
    const pySignature = `def ${functionName}(${params.map(({ name, type }) =>
      `${name}: ${PYTHON_PARAMETER_TYPES[type] || type}`).join(', ')})`;
    const jsSignature = `function ${functionName}(${params.map(({ name }) => name).join(', ')}) {`;
    if (!pyCode.includes(pySignature)) problems.push('Python 函数签名未反映模板参数名/类型');
    if (!jsCode.includes(jsSignature)) problems.push('JavaScript 函数签名未反映模板参数名');
    for (const { name, type } of params) {
      if (!jsCode.includes(`@param {${JAVASCRIPT_PARAMETER_TYPES[type] || type}} ${name}`)) {
        problems.push(`JavaScript 参数类型注释错误: ${name}:${type}`);
      }
    }
    if (tc.bodyState) {
      fs.writeFileSync(`${tmpDir}/${tc.name}.dump.py`, pyCode);
      fs.writeFileSync(`${tmpDir}/${tc.name}.dump.js`, jsCode);
      // 多语句模板：验证 def 签名（双参数 ek/m）+ RETURN 引用 ret 变量 + 语句链注入
      if (!pyCode.includes('def Tpl_mlkem_encaps(ek: bytes, m: bytes)')) {
        problems.push('def 签名非双参数 ek/m');
      }
      if (!pyCode.includes('return ret')) {
        problems.push('RETURN 未引用 ret');
      }
      const stmtCount = (pyCode.match(/ = /g) || []).length;
      if (stmtCount < 10) {
        problems.push('BODY 语句注入不足: ' + stmtCount);
      }
    }
    // 1. 注入契约：return 表达式存在且引用 param 变量（variables_get 注入成功）
    const pyReturnLine = pyCode.split('\n').filter((l) => l.trim().startsWith('return ')).join(' ');
    const jsReturnLine = jsCode.split('\n').filter((l) => l.trim().startsWith('return ')).join(' ');
    const pyHasParam = pyReturnLine.includes(tc.paramName) && pyReturnLine.length > 'return '.length;
    const jsHasParam = jsReturnLine.includes(tc.paramName) && jsReturnLine.length > 'return '.length;
    if (!tc.bodyState && !pyHasParam && !jsHasParam) {
      problems.push('return 链未注入 param 变量');
    }
    // 链块数检查：return 表达式应含至少一个链块调用（非裸变量）
    const pyChainLen = (pyReturnLine.match(/[a-z_]+\s*\(/g) || []).length;
    if (!tc.bodyState && tc.returnChain.length > 1 && pyChainLen < 1) {
      problems.push('return 链无块调用');
    }
    // 2. 生成代码可执行（Python 编译 + 执行不崩；空输入走默认值）
    let pyExecOk = false, pyOut = '';
    try {
      const pyFile = `${tmpDir}/${tc.name}.py`;
      fs.writeFileSync(pyFile, pyCode + '\n' + (tc.pyDriver || 'pass\n'));
      pyOut = execFileSync(pythonCommand, [pyFile], {
        encoding: 'utf8',
        timeout: DRIVER_TIMEOUT_MS,
      }).trim();
      pyExecOk = true;
    } catch (e: unknown) {
      problems.push(`Python 执行失败: ${errorMessage(e).split('\n').slice(-2).join(' ')}`);
    }
    // 3. 配置的期望输出（如有）
    if (tc.pyDriver && tc.pyExpect !== undefined) {
      if (pyExecOk && pyOut !== tc.pyExpect) {
        problems.push(`期望输出不符: got=${pyOut} expect=${tc.pyExpect}`);
      }
    }
    // JS 同验（仅执行 + 期望输出，链结构由实际 Blockly 工作区验证）
    try {
      const jsFile = `${tmpDir}/${tc.name}.js`;
      fs.writeFileSync(jsFile, jsCode + '\n' + (tc.jsDriver || 'console.log(1);'));
      const jsOut = execFileSync(process.execPath, [jsFile], {
        encoding: 'utf8',
        timeout: DRIVER_TIMEOUT_MS,
      }).trim();
      if (tc.jsDriver && tc.jsExpect !== undefined && jsOut !== tc.jsExpect) {
        problems.push(`JS 期望输出不符: got=${jsOut} expect=${tc.jsExpect}`);
      }
    } catch (e: unknown) {
      problems.push(`JS 执行失败: ${errorMessage(e).split('\n').slice(-2).join(' ')}`);
    }

    if (problems.length) {
      fail++;
      console.log(`FAIL  ${tc.name}: ${problems.join('; ')}`);
    } else {
      pass++;
      console.log(`PASS  ${tc.name}`);
    }
  }
  for (const workspace of templateWorkspaces.values()) workspace.dispose();
  console.log(`\n模板: ${pass}/${cases.length} PASS`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
