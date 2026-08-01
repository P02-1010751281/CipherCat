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

interface TestSpec {
  py: { driver: string; expect: string };
  js: { driver: string; expect: string };
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
  (globalThis as any).document = dom.window.document;
  (globalThis as any).window = dom.window;
  (globalThis as any).DOMParser = dom.window.DOMParser;
  (globalThis as any).XMLSerializer = dom.window.XMLSerializer;
  (globalThis as any).Node = dom.window.Node;
  (globalThis as any).Element = dom.window.Element;

  // 动态 import（确保 DOM 桩先于 Blockly 模块初始化）
  const Blockly = (await import('blockly/core')).default ?? await import('blockly/core');
  // headless 环境无 i18n 加载：补原生块所需 Msg 键（真实前端由 locale 提供）
  Blockly.Msg['VARIABLES_SET'] = '%1 = %2';
  Blockly.Msg['VARIABLES_GET'] = '%1';
  Blockly.Msg['VARIABLES_DEFAULT_NAME'] = 'item';
  await import('blockly/blocks');
  await import('@/blocks');
  await import('@/generators/python');
  await import('@/generators/javascript');
  const { pythonGenerator } = await import('blockly/python');
  const { javascriptGenerator } = await import('blockly/javascript');
  const fs = await import('node:fs');
  const { execFileSync } = await import('node:child_process');

  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(json, ws);

  const defs = ws.getBlocksByType('procedures_defreturn', false);
  console.log('== def 函数:', defs.map((b: any) => b.getFieldValue('NAME')));

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
  const rel = file.replace(/^demos\//, '');
  const spec = registry[rel];
  if (!spec) {
    console.error(`FAIL: demos/tests.json 缺 ${rel} 的测试规格`);
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync('/tmp/ciphercat-verify-');
  const results: Array<{ lang: string; pass: boolean; got: string; expect: string }> = [];

  // Python
  let pyFile = '';
  try {
    const pyDriver = `${pyCode}\n${spec.py.driver}\n`;
    pyFile = `${tmpDir}/demo.py`;
    fs.writeFileSync(pyFile, pyDriver);
    const stdout = execFileSync('python3', [pyFile], { encoding: 'utf8' }).trim();
    const pass = stdout === spec.py.expect;
    results.push({ lang: 'Python', pass, got: stdout, expect: spec.py.expect });
  } catch (e: any) {
    results.push({ lang: 'Python', pass: false, got: `EXEC ERROR: ${e.message} | stderr: ${e.stderr} | file: ${pyFile}`, expect: spec.py.expect });
  }

  // JS
  let jsFile = '';
  try {
    const jsDriver = `${jsCode}\n${spec.js.driver}\n`;
    jsFile = `${tmpDir}/demo.js`;
    fs.writeFileSync(jsFile, jsDriver);
    const stdout = execFileSync('node', [jsFile], { encoding: 'utf8' }).trim();
    const pass = stdout === spec.js.expect;
    results.push({ lang: 'JS', pass, got: stdout, expect: spec.js.expect });
  } catch (e: any) {
    results.push({ lang: 'JS', pass: false, got: `EXEC ERROR: ${e.message} | stderr: ${e.stderr} | file: ${jsFile}`, expect: spec.js.expect });
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
  console.log(allPass ? '\n=== ALL VECTORS PASS ===' : '\n=== VECTOR MISMATCH ===');
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
