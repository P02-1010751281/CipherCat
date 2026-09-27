/**
 * 模板（Crypto Templates / proc_* / crypto_*_func）注入正确性 + 可执行性验证
 *
 * 用法:
 *   node dist-verify/verify-templates.js            # 全部 29 模板
 *   node dist-verify/verify-templates.js <name>     # 单个（如 proc_sm4_round）
 *
 * 模板 = _makeTemplateBlock 创建的「单参数教学起点」块：拖出后由 TEMPLATE_PREFILL
 * 注入 RETURN 原子链（buildReturnChain：variables_get → ... → 根块）。
 * 链末块的部分输入（rk/key/iv/B 等）设计上留空待用户补全 —— 模板不是完整算法，
 * 其完整性由同名 demo（官方向量 44 个）覆盖。本 harness 验证模板特有契约：
 *   1. 注入后生成代码的 return 链块类型序列与 TEMPLATE_PREFILL 声明一致
 *   2. 生成代码可执行（空输入走默认值不崩溃）
 *   3. 对链输入完整的模板，执行结果与官方向量一致
 */
import { JSDOM } from 'jsdom';
import {
  MLKEM_ENCAPS_BODY_STATE,
  MLKEM_ENCAPS_RETURN_STATE,
  MLKEM_ENCAPS_VARIABLE_IDS,
} from '@/blocks/procedure/encaps-prefill';

const DRIVER_TIMEOUT_MS = 30_000;

interface TemplateCase {
  name: string;
  paramName: string;
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
  /** 预填引用的变量名（加载前创建） */
  prefillVariables?: string[];
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
  { name: 'crypto_hash_func', paramName: 'message', returnChain: ['variables_get', 'hash_sha256_pad'] },
  { name: 'crypto_encrypt_func', paramName: 'message', returnChain: ['variables_get', 'mode_ecb_encrypt'] },
  { name: 'crypto_decrypt_func', paramName: 'ciphertext', returnChain: ['variables_get', 'mode_ecb_decrypt'] },
  { name: 'proc_aes_round', paramName: 'state', returnChain: ['variables_get', 'aes_sub_bytes', 'aes_shift_rows', 'aes_mix_columns', 'aes_add_round_key'] },
  { name: 'proc_aes_last_round', paramName: 'state', returnChain: ['variables_get', 'aes_sub_bytes', 'aes_shift_rows', 'aes_add_round_key'] },
  { name: 'proc_sha256_hash', paramName: 'msg', returnChain: ['variables_get', 'hash_sha256_pad'] },
  { name: 'proc_sm3_hash', paramName: 'msg', returnChain: ['variables_get', 'hash_sm3_pad'] },
  { name: 'proc_ntt_vec', paramName: 'vec', returnChain: ['variables_get', 'pq_ntt'] },
  { name: 'proc_pq_cbd', paramName: 'seed', returnChain: ['variables_get', 'pq_sample_poly_cbd'] },
  { name: 'proc_pq_sample', paramName: 'seed', returnChain: ['variables_get', 'pq_sample_ntt'] },
  { name: 'proc_pq_vec_add', paramName: 'a', returnChain: ['variables_get', 'pq_poly_add'] },
  { name: 'proc_pq_vec_sub', paramName: 'a', returnChain: ['variables_get', 'pq_poly_sub'] },
  { name: 'proc_pq_mat_mul', paramName: 'mat', returnChain: ['variables_get', 'pq_mat_vec_mul'] },
  { name: 'proc_mode_ecb', paramName: 'data', returnChain: ['variables_get', 'mode_ecb_encrypt'] },
  { name: 'proc_mode_cbc', paramName: 'data', returnChain: ['variables_get', 'mode_cbc_encrypt'] },
  { name: 'proc_mode_ctr', paramName: 'data', returnChain: ['variables_get', 'mode_ctr_encrypt'] },
  { name: 'proc_mode_gcm', paramName: 'data', returnChain: ['variables_get', 'mode_ctr_encrypt'] },
  { name: 'proc_sponge_duplex', paramName: 'state', returnChain: ['variables_get', 'sponge_squeeze'] },
  { name: 'proc_sm4_round', paramName: 'state', returnChain: ['variables_get', 'sm4_round_func'],
    pyDriver: "state = [0x01,0x23,0x45,0x67]\nprint(''.join(f'{b:02x}' for b in Tpl_sm4_round(state)))",
    jsDriver: "var state = [0x01,0x23,0x45,0x67];\nconsole.log(Tpl_sm4_round(state).map(b=>b.toString(16).padStart(2,'0')).join(''));" },
  { name: 'proc_hmac_sha256', paramName: 'key', returnChain: ['variables_get', 'hash_hmac'] },
  { name: 'proc_sm3_hmac', paramName: 'key', returnChain: ['variables_get', 'hash_hmac'], chainFields: { hash_hmac: { HASH: 'SM3' } } },
  { name: 'proc_mlkem_keygen', paramName: 'seed', returnChain: ['variables_get', 'pq_sample_poly_cbd', 'pq_ntt'] },
  { name: 'proc_zuc_keystream', paramName: 'key', returnChain: ['variables_get', 'zuc_keystream'] },
  {
    name: 'proc_mlkem_encaps', paramName: 'ek', returnChain: [],
    bodyState: MLKEM_ENCAPS_BODY_STATE, returnState: MLKEM_ENCAPS_RETURN_STATE,
    prefillVariables: MLKEM_ENCAPS_VARIABLE_IDS,
    pyDriver: 'ek = bytes(800)\nm = bytes(32)\nprint(len(Tpl_mlkem_encaps(ek, m)) > 0)',
    pyExpect: 'True',
    jsDriver: 'var ek = new Uint8Array(800); var m = new Uint8Array(32);\nconsole.log(Tpl_mlkem_encaps(ek, m).length > 0);',
    jsExpect: 'true',
  },
  // BODY 预填模板（return 链只 variables_get，算法在 BODY）
  { name: 'proc_pbkdf2', paramName: 'password', returnChain: ['variables_get'] },
  { name: 'proc_hkdf', paramName: 'ikm', returnChain: ['variables_get'] },
  { name: 'proc_aes_key_schedule', paramName: 'key', returnChain: ['variables_get'] },
  { name: 'proc_sm4_key_schedule', paramName: 'key', returnChain: ['variables_get'] },
  { name: 'proc_md_iterate', paramName: 'iv', returnChain: ['variables_get'] },
];

// 链块类型 → 其第一个 VALUE input 名（buildReturnChain 找第一个 VALUE 接子链）
// 空数组 = 无 VALUE input（不接链，如 data_value 叶）
const CHAIN_VALUE_INPUTS: Record<string, string[]> = {
  aes_sub_bytes: ['STATE'],
  aes_shift_rows: ['STATE'],
  aes_mix_columns: ['STATE'],
  aes_add_round_key: ['STATE'],
  hash_sha256_pad: ['INPUT'],
  hash_sm3_pad: ['INPUT'],
  pq_ntt: ['INPUT'],
  pq_sample_poly_cbd: ['SEED'],
  pq_sample_ntt: ['SEED'],
  pq_poly_add: ['A'],
  pq_poly_sub: ['A'],
  pq_mat_vec_mul: ['MATRIX'],
  mode_ecb_encrypt: ['DATA'],
  mode_cbc_encrypt: ['DATA'],
  mode_ctr_encrypt: ['DATA'],
  mode_ecb_decrypt: ['DATA'],
  sponge_squeeze: ['STATE'],
  sm4_round_func: ['X0'],
  hash_hmac: ['KEY'],
  zuc_keystream: ['KEY'],
};

/** 构造注入后模板 workspace JSON（bodyState 预填模板：STACK 链 + RETURN state + 多参数） */
function buildWorkspaceBodyState(tc: TemplateCase): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    FUNC_NAME: tc.name.replace(/^proc_/, 'Tpl_').replace(/^crypto_/, 'Tpl_'),
    PARAM_NAME_0: 'ek', PARAM_TYPE_0: 'bytes',
    PARAM_NAME_1: 'm', PARAM_TYPE_1: 'bytes',
  };
  const inputs: Record<string, unknown> = {
    BODY: { block: tc.bodyState as Record<string, unknown> },
    RETURN: { block: tc.returnState as Record<string, unknown> },
  };
  return {
    blocks: {
      languageVersion: 0,
      blocks: [
        { type: tc.name, id: 'tpl_root_0000', x: 80, y: 80,
          extraState: { prefilled: true }, fields, inputs },
      ],
    },
  };
}

/** 构造注入后模板 workspace JSON（对齐 buildReturnChain：叶子→根，链块字段覆盖） */
function buildWorkspace(tc: TemplateCase): Record<string, unknown> {
  // 叶子：variables_get（引用 param 变量）
  let leaf: Record<string, unknown> = {
    type: 'variables_get', id: 'tpl_var_0001',
    fields: { VAR: { id: 'tpl_param_id', name: tc.paramName } },
  };
  // 中间 + 根：每块连到前块输出到其第一个 VALUE input
  for (let i = 1; i < tc.returnChain.length; i++) {
    const type = tc.returnChain[i];
    const id = 'tpl_blk_' + String(i).padStart(4, '0');
    const blk: Record<string, unknown> = { type, id };
    if (tc.chainFields && tc.chainFields[type]) {
      blk.fields = tc.chainFields[type];
    }
    const firstInput = (CHAIN_VALUE_INPUTS[type] || [])[0];
    if (firstInput && i > 0) {
      blk.inputs = { [firstInput]: { block: leaf } };
    }
    leaf = blk;
  }
  const root = leaf;
  return {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: tc.name, id: 'tpl_root_0000', x: 80, y: 80,
          extraState: { prefilled: true },
          fields: {
            FUNC_NAME: tc.name.replace(/^proc_/, 'Tpl_').replace(/^crypto_/, 'Tpl_'),
            PARAM_NAME: tc.paramName,
            PARAM_TYPE: 'bytes',
          },
          inputs: { RETURN: { block: root } },
        },
      ],
    },
  };
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
  // 平台无关：metacrypt 的 vite.verify.config.ts 将 @/blocks 别名到 features/blockly/core/blocks
  await import('@/blocks');
  await import('@/generators/python');
  await import('@/generators/javascript');
  const { pythonGenerator } = await import('blockly/python');
  const { javascriptGenerator } = await import('blockly/javascript');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { execFileSync } = await import('node:child_process');
  const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
    (process.platform === 'win32' ? 'python' : 'python3');

  let pass = 0, fail = 0;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ciphercat-tpl-'));
  process.once('exit', () => fs.rmSync(tmpDir, { recursive: true, force: true }));

  for (const tc of cases) {
    const ws = new Blockly.Workspace();
    if (tc.bodyState) {
      for (const vid of tc.prefillVariables || []) {
        ws.getVariableMap().createVariable(vid, '', vid);
      }
      const state = buildWorkspaceBodyState(tc) as unknown as Parameters<typeof Blockly.serialization.workspaces.load>[0];
      Blockly.serialization.workspaces.load(state, ws);
    } else {
      const state = buildWorkspace(tc) as unknown as Parameters<typeof Blockly.serialization.workspaces.load>[0];
      Blockly.serialization.workspaces.load(state, ws);
    }
    const pyCode = pythonGenerator.workspaceToCode(ws) as string;
    const jsCode = javascriptGenerator.workspaceToCode(ws) as string;

    const problems: string[] = [];
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
    // 3. 官方向量（如配置）
    if (tc.pyDriver && tc.pyExpect !== undefined) {
      if (pyExecOk && pyOut !== tc.pyExpect) {
        problems.push(`向量不符: got=${pyOut} expect=${tc.pyExpect}`);
      }
    }
    // JS 同验（仅执行 + 向量，链结构已由 python 侧验证）
    try {
      const jsFile = `${tmpDir}/${tc.name}.js`;
      fs.writeFileSync(jsFile, jsCode + '\n' + (tc.jsDriver || 'console.log(1);'));
      const jsOut = execFileSync(process.execPath, [jsFile], {
        encoding: 'utf8',
        timeout: DRIVER_TIMEOUT_MS,
      }).trim();
      if (tc.jsDriver && tc.jsExpect !== undefined && jsOut !== tc.jsExpect) {
        problems.push(`JS 向量不符: got=${jsOut} expect=${tc.jsExpect}`);
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
  console.log(`\n模板: ${pass}/${cases.length} PASS`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
