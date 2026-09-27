/**
 * Demo 官方向量验证 harness
 * 用法:
 *   node dist-verify/verify-demo.js <demo.json>            # 仅打印生成代码
 *   node dist-verify/verify-demo.js <demo.json> --exec     # 执行生成代码 + 对比官方向量
 *
 * 加载 Blockly workspace JSON → 生成 Python/JS 代码（headless + jsdom DOM 桩）
 * --exec 模式: 通过 demos/tests.json 注册表取每 demo 的 driver 片段与期望输出，
 * 附加到生成代码后执行（python3 / node），对比 stdout。
 */
import { JSDOM } from 'jsdom';

const DRIVER_TIMEOUT_MS = 25_000;

interface TestSpec {
  py: { driver: string; expect: string };
  js: { driver: string; expect: string };
}

type DemoGlobals = typeof globalThis & {
  document: unknown;
  window: unknown;
  DOMParser: unknown;
  XMLSerializer: unknown;
  Node: unknown;
  Element: unknown;
};

function errorDetail(error: unknown, field: 'message' | 'stderr'): string {
  if (error instanceof Error && field === 'message') return error.message;
  if (typeof error === 'object' && error !== null && field in error) {
    return String((error as Record<string, unknown>)[field] ?? '');
  }
  return String(error);
}

async function main() {
  const file = process.argv[2];
  const execMode = process.argv.includes('--exec');
  if (!file) {
    console.error('用法: node dist-verify/verify-demo.js <demo.json> [--exec]');
    process.exit(1);
  }

  // headless DOM 桩（必须在 import Blockly 前设置）
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost/' });
  const demoGlobals = globalThis as DemoGlobals;
  demoGlobals.document = dom.window.document;
  demoGlobals.window = dom.window;
  demoGlobals.DOMParser = dom.window.DOMParser;
  demoGlobals.XMLSerializer = dom.window.XMLSerializer;
  demoGlobals.Node = dom.window.Node;
  demoGlobals.Element = dom.window.Element;

  // 动态 import（确保 DOM 桩先于 Blockly 模块初始化）
  const Blockly = (await import('blockly/core')).default ?? await import('blockly/core');
  // headless 环境无 i18n 加载：setLocale 灌入官方英文消息（原生块 + FieldVariable 所需全部 Msg 键；
  // v13 的 msg/*.mjs 只导出常量不自动设置 Msg，必须显式 setLocale）
  const { setLocale } = await import('blockly/core');
  const enMsgs = await import('blockly/msg/en');
  setLocale(enMsgs);
  await import('blockly/blocks');
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

  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(json, ws);

  const defs = ws.getBlocksByType('procedures_defreturn', false);
  console.log('== def 函数:', defs.map((b) => b.getFieldValue('NAME')));

  const pyCode = pythonGenerator.workspaceToCode(ws) as string;
  const jsCode = javascriptGenerator.workspaceToCode(ws) as string;

  if (!execMode) {
    console.log('\n===== PYTHON =====');
    console.log(pyCode);
    console.log('\n===== JAVASCRIPT =====');
    console.log(jsCode);
    return;
  }

  // --exec: 读取测试注册表
  const registry: Record<string, TestSpec> = JSON.parse(
    fs.readFileSync('demos/tests.json', 'utf8'),
  );
  const normalizedFile = file.replaceAll('\\', '/');
  const demosMarker = '/demos/';
  const demosIndex = normalizedFile.lastIndexOf(demosMarker);
  const rel = demosIndex >= 0
    ? normalizedFile.slice(demosIndex + demosMarker.length)
    : normalizedFile.replace(/^demos\//, '');
  const spec = registry[rel];
  if (!spec) {
    console.error(`FAIL: demos/tests.json 缺 ${rel} 的测试规格`);
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ciphercat-verify-'));
  const results: Array<{ lang: string; pass: boolean; got: string; expect: string }> = [];

  // Python
  let pyFile = '';
  try {
    const pyDriver = `${pyCode}\n${spec.py.driver}\n`;
    pyFile = `${tmpDir}/demo.py`;
    fs.writeFileSync(pyFile, pyDriver);
    const stdout = execFileSync(pythonCommand, [pyFile], {
      encoding: 'utf8',
      timeout: DRIVER_TIMEOUT_MS,
    }).trim();
    const pass = stdout === spec.py.expect;
    results.push({ lang: 'Python', pass, got: stdout, expect: spec.py.expect });
  } catch (e: unknown) {
    results.push({ lang: 'Python', pass: false, got: `EXEC ERROR: ${errorDetail(e, 'message')} | stderr: ${errorDetail(e, 'stderr')} | file: ${pyFile}`, expect: spec.py.expect });
  }

  // JS
  let jsFile = '';
  try {
    const jsDriver = `${jsCode}\n${spec.js.driver}\n`;
    jsFile = `${tmpDir}/demo.js`;
    fs.writeFileSync(jsFile, jsDriver);
    const stdout = execFileSync(process.execPath, [jsFile], {
      encoding: 'utf8',
      timeout: DRIVER_TIMEOUT_MS,
    }).trim();
    const pass = stdout === spec.js.expect;
    results.push({ lang: 'JS', pass, got: stdout, expect: spec.js.expect });
  } catch (e: unknown) {
    results.push({ lang: 'JS', pass: false, got: `EXEC ERROR: ${errorDetail(e, 'message')} | stderr: ${errorDetail(e, 'stderr')} | file: ${jsFile}`, expect: spec.js.expect });
  }

  let allPass = true;
  for (const r of results) {
    console.log(`\n[${r.lang}] ${r.pass ? 'PASS' : 'FAIL'}`);
    if (!r.pass) {
      allPass = false;
      console.log(`  expect: ${r.expect}`);
      console.log(`  got:    ${r.got}`);
    }
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(allPass ? '\n=== ALL VECTORS PASS ===' : '\n=== VECTOR MISMATCH ===');
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
