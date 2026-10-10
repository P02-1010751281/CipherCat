import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const harness = resolve(root, 'dist-verify/verify-demo.js');
// 每个 Demo 的 wall-clock 预算。实测：空载整轮 59 个 Demo 约 64s（均值 ~1.1s），
// 但 SM9/ML-KEM 等 BigInt 链单例可达数秒；在同时跑构建/测试的重载机器与较慢的外接盘上，
// 30s 预算曾出现 ETIMEDOUT 假失败（先后见于 ML-KEM-Atomic、SM9-Sign、AES-Atomic-Round）。
// 这里按“最慢单例 × 重载余量”校准为 120s；它只放宽等待预算，不改变任何期望值或断言，
// 超时仍与结果不符分开报告（见下方 HINT）。
const DEMO_TIMEOUT_MS = 120_000;
// demos/ 下的元数据文件不是工作区：tests.json 是登记表，evidence.json 是证据台账。
const DEMO_METADATA_FILES = new Set(['tests.json', 'evidence.json']);

function collectDemos(directory, prefix = '') {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectDemos(file, `${relative}/`));
    else if (entry.name.endsWith('.json') && !DEMO_METADATA_FILES.has(relative)) files.push(relative);
  }
  return files;
}

const registry = Object.keys(JSON.parse(readFileSync(resolve(root, 'demos/tests.json'), 'utf8')));
const demos = collectDemos(resolve(root, 'demos')).sort();
const missing = demos.filter((demo) => !registry.includes(demo));
const stale = registry.filter((demo) => !demos.includes(demo));
if (missing.length || stale.length) {
  if (missing.length) console.error(`未注册 demo: ${missing.join(', ')}`);
  if (stale.length) console.error(`注册表中的陈旧 demo: ${stale.join(', ')}`);
  process.exit(1);
}

if (!demos.length) {
  console.error('没有找到可验证的 demo');
  process.exit(1);
}

let passed = 0;
for (const demo of demos) {
  const result = spawnSync(process.execPath, [harness, resolve(root, 'demos', demo), '--exec'], {
    cwd: root,
    encoding: 'utf8',
    timeout: DEMO_TIMEOUT_MS,
  });
  if (result.status === 0) {
    passed += 1;
    continue;
  }
  console.error(`FAIL ${demo}`);
  if (result.error) {
    // ETIMEDOUT 是每个 Demo 的固定预算被超过，常见于机器同时跑构建/测试时的资源竞争。
    // 这里只做区分与提示，不放大超时，也不自动重试掩盖；请在空载下重跑确认。
    const timedOut = result.error.code === 'ETIMEDOUT' || /ETIMEDOUT/.test(result.error.message);
    console.error(result.error.message);
    if (timedOut) {
      console.error(`HINT ${demo}: 超过 ${DEMO_TIMEOUT_MS / 1000}s 预算（代码以退出码 1 结束，非结果不符）；`
        + '若空载重跑通过，记为负载相关偶发，不要据此放宽门限。');
    }
  }
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  if (output) console.error(output.slice(-2000));
}

console.log(`DEMO_SUMMARY total=${demos.length} pass=${passed} fail=${demos.length - passed}`);
process.exit(passed === demos.length ? 0 : 1);
