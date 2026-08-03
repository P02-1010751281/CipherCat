---
doc_type: feature-design
feature: 2026-08-03-js-sandbox
status: draft
summary: 编辑器「运行」支持 JavaScript 生成代码——Web Worker + Blob URL 沙箱，console.log 捕获进现有输出面板，执行超时可终止死循环；实现仓库 metacrypt_server
tags: [metacrypt, blockly, sandbox, javascript, feature]
---

# JS 沙箱（浏览器内执行 JS 生成代码）

## 背景与目标

编辑器「运行」按钮（`frontend/src/features/blockly/views/EditorView.vue` `onRunCode`，379-423 行）目前仅支持 Python：Pyodide WASM 沙箱（`utils/run-code.ts` `runPythonInBrowser`，stdout/stderr batched 回调逐行进输出面板）。JS 分支在第 407-410 行直接输出 `runJsNotSupported` 后返回。

JS 生成代码目前只能「生成 + 复制」到外部执行，无浏览器内运行。这是 Session 15 登记的功能缺口（JS 沙箱排期：iframe sandbox / Web Worker + CSP / quickjs-wasm 三方案待选）。

**目标**：「运行」按钮在 `lang === 'javascript'` 时执行 JS 生成代码，输出进现有输出面板，与 Python 体验对齐（输出逐行、错误显示、超时提示）。

## 现状事实（代码取证）

- `run-code.ts`（67 行）：`getPyodide()` 单例（fetch + Blob URL 加载 `/pyodide/pyodide.mjs`）、`waitPyodideReady()` 45s 加载超时、`runPythonInBrowser(code, onOutput)` 捕获 stdout/stderr/返回值。
- `EditorView.vue`：`onRunCode` 用 `codePreviewerRef.generateRawCode()` 取含输出的原始代码（Python 侧临时关 print 过滤），非 python 语言直接 `runJsNotSupported` 返回；输出面板 `runOutputText`/`runOutputVisible` + 清空按钮。
- JS 生成器 text_print 块产出 `console.log(msg);\n`（`generators/javascript/index.ts:94`）——JS 生成代码**自带输出语句**，无需像 Python 那样做 print 过滤（Python 过滤是为后端 exec 干净代码，JS 无后端 exec 路径）。
- **全栈无 CSP**（`frontend/index.html` 无 meta、nginx 无头）→ `blob:` Worker 开箱可用；若未来加 CSP 需含 `worker-src blob:`。
- 后端 `randomness.py` 已有 `sequences` 直传（Python 沙箱预生成数据链路）——JS 纯浏览器执行，**不涉及后端**。

## 方案选型

| 方案 | 评价 |
|---|---|
| **Web Worker + Blob URL（选定）** | 独立线程 → `worker.terminate()` 可终止死循环（教学场景关键 UX）；Worker 无 DOM/window，生成代码是纯计算；console 捕获用 preamble 重定义 + `postMessage`；无 CSP 障碍 |
| iframe `sandbox="allow-scripts"` | **无法终止运行中的脚本**（remove iframe 不停止执行），死循环烧 CPU 且不可控；否决 |
| quickjs-wasm | 额外 ~1-2MB WASM 运行时、集成复杂；对教学输出场景过重；否决（未来如需强隔离再评估） |

## 契约

### `run-code.ts` 新增 `runJavaScriptInBrowser`

```ts
export async function runJavaScriptInBrowser(
  code: string,
  onOutput: (text: string) => void,
  options?: { timeoutMs?: number },
): Promise<RunResult>  // 复用现有 RunResult { ok, result?, error? }
```

- **worker 生命周期**：每次运行新建 `new Worker(blobUrl)`（用完 `terminate()`，不缓存单例——避免状态残留）；Blob URL 用完 `revokeObjectURL`。
- **worker 脚本（preamble + 用户代码）**：
  ```js
  const __post = (text) => self.postMessage({ type: 'output', text })
  self.console = { ...console, log: (...a) => __post(a.map(String).join(' ')),
                   error: (...a) => __post('[Error] ' + a.map(String).join(' ')),
                   warn: (...a) => __post(a.map(String).join(' ')) }
  self.onmessage = async (e) => {
    try {
      let result = (0, eval)(e.data.code)   // 间接 eval：顶层函数声明进 worker 全局，互相可调
      if (result instanceof Promise) result = await result  // HMAC-SHA256 等 async 生成器返回 Promise
      self.postMessage({ type: 'done' })   // 输出只走 console.log 捕获，不打印完成值（避免赋值语句意外输出）
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err?.message ?? err) })
    }
  }
  ```
- **主线程消息契约**：只识别 `output` / `done` / `error` 三类消息（白名单，忽略其余）；`settled` 标志防重复 settle；`done`/`error` 到达后 `clearTimeout`（不空转计时器）。
- **超时**：默认 `timeoutMs = 10_000`（JS 无加载期，纯执行超时；覆盖 async 块等待）。超时 → `worker.terminate()` → 返回 `{ ok: false, errorCode: 'timeout' }`（**不硬编码文案**——EditorView 用 `ui('runTimeout')` 映射，避免与 i18n 键双源死键；超时后到达的 postMessage 被 settled guard 忽略）。
- **错误**：worker `error` 事件（含 eval 外崩溃、async rejection）与 `type:'error'` 消息都归为 `{ ok: false, error }`。
- **输出洪泛保护**：主线程累计行数超 1000 后丢弃后续输出并追加提示（防洪泛 `while(true){console.log}` 队列积压）。
- 输出文本进 `onOutput` 回调（与 Python 同通道）。

### `EditorView.vue`

- `onRunCode` 分支改为**显式三语言判断**：`lang === 'python' → runPythonInBrowser`；`lang === 'javascript' → runJavaScriptInBrowser`；**`mcl`（伪代码 DSL，非合法 JS）保留 `runJsNotSupported` 提示**——不得把 MCL 伪代码喂进 JS eval（SyntaxError UX 回归）。
- 输出/错误/清空/防重入（`running` ref）全部复用现有逻辑；`errorCode === 'timeout'` 时显示 `ui('runTimeout')`。

### i18n（zh/en 双端对齐）

- `runJsNotSupported` 键**保留**（MCL 分支仍用）；删 `runTimeout` 需同步：zh `执行超时（10s），已终止（可能是死循环）` / en `Execution timed out (10s), terminated (possible infinite loop)`。

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| 死循环/长时间运行 | Worker + terminate + 10s 默认超时（可配置）；编辑器主线程不受影响 |
| Worker 内 `eval` 作用域（函数互调） | 间接 `(0, eval)`：顶层函数声明进 worker 全局；实现时用多函数 demo 实测 |
| async 生成器（HMAC-SHA256 返回 Promise） | onmessage async + `await` Promise；rejection 走 error 通道 |
| **MCL 语言误入 JS eval** | 显式三语言分支，MCL 保留 `runJsNotSupported` 提示 |
| 网络访问 | Worker 可 fetch（无 CSP）——与 Python 侧一致，教学沙箱接受；不引入 CSP（超范围） |
| 消息注入/竞态 | 消息类型白名单（output/done/error）+ settled guard + clearTimeout |
| 输出洪泛 | 累计 1000 行上限后丢弃并提示 |
| worker 泄漏 | 用完即 terminate + revoke；`running` ref 防重入；超时后立即再次运行可用 |

## 范围（明确不做）

- 后端 sequences 直传扩展（JS 纯浏览器执行，无后端 exec）
- 引入 CSP（现有栈无 CSP；Worker 自身已隔离）
- Blockly v13 联动；双语言沙箱入口统一（现有按钮已统一，仅内部分支）

## 验收标准

1. JS 模式点「运行」：含 text_print 块（console.log）的 workspace 输出逐行显示在输出面板（仅 console.log 通道，不打印 eval 完成值）
2. 死循环代码：10s 内超时 → 面板显示 `ui('runTimeout')` 文案，编辑器响应正常（terminate 生效），**超时后立即再次运行可用**（running 复位）
3. 抛异常代码：面板显示 `[Error] <message>`
4. **async 块**（HMAC-SHA256）：运行正常输出摘要（Promise 被 await），不显示 `[object Promise]`
5. **MCL 模式**点运行：显示 `runJsNotSupported` 提示（不喂进 JS eval）
6. Python 路径回归：print 输出/错误/超时行为不变
7. 死键检查：`grep -rn runJsNotSupported` 仅 locale 定义 + MCL 分支引用（无其他残留）；`runTimeout` 双语言键存在且被使用
8. 门禁：vue-tsc 业务域 0 errors、vite build ✓
9. 浏览器实测（8080 生产）：JS 与 Python 双路径 + 五用例（正常/死循环/异常/async/MCL）

## 验证入口

- 浏览器：metacrypt 8080 → 编辑器 → 选 JavaScript 语言 → 拼 text_print/算法链 → 「运行」
- 门禁：`npx vue-tsc --noEmit`（features 域 0）+ `npx vite build`
- 回归：现有 vitest（668/668）不受影响（沙箱为浏览器运行时，无单测覆盖；行为验证走浏览器实测）
