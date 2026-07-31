---
doc_type: issue-analysis
issue: 2026-07-31-security-hardening
status: draft
root_cause_type: config
related: [security-hardening-report.md]
tags: [security, tauri, capabilities, validation]
---

# 安全纵深加固（3 类）根因分析

## 1. 问题定位

| 关键位置 | 说明 |
|---|---|
| `src-tauri/capabilities/default.json:9-16` | `fs:allow-write-text-file` 允许 `$HOME/**` + `$DOWNLOAD` + `$DESKTOP` + `$DOCUMENT`——`$HOME/**` 过宽 |
| `src-tauri/tauri.conf.json:12` | `withGlobalTauri: true` 暴露 `window.__TAURI__`（前端实际用模块 import，需核验无全局依赖） |
| `src/utils/workspace/serialization.ts:75-90` | `lastExportPath` 缓存 → 后续导出**跳过保存对话框**直接 `writeTextFile` 覆写 |
| `src/blocks/symmetric/modes/blocks.ts:26` | ECB tooltip 纯陈述，无安全警告 |
| `src/generators/{js,py}/symmetric/modes/helpers.ts` | AES 模式函数无 key/IV 长度校验（仅 `cipher_key_from_seed` 有） |

## 2. 失败路径还原

**正常路径**：用户经保存对话框选择路径 → 写权限内写入；ECB 教学有提示；错误长度输入有引导报错。

**失败路径**：
1. 前端注入（CSP/DOMPurify 已缓解但非消除）→ `window.__TAURI__` + `$HOME/**` 写权限 + `lastExportPath` 无确认覆写 → 静默改写任意家目录文本文件
2. ECB 块无警示 → 教学用户可能用于真实数据
3. KEY 接 5 字节 → 生成代码运行报错（无引导性错误信息）

**分叉点**：1 为纵深防御链（当前 CSP/净化已缓解）；2/3 为确定缺失。

## 3. 根因

**根因类型**：config（+ missing-guard）

**根因描述**：
1. 写权限声明过宽（`$HOME/**`）+ 导出覆写免确认——纵深防御缺口
2. ECB 教学提示缺失；key/IV 长度守卫缺失

**是否有多个根因**：是（三个独立成因）。

## 4. 影响面

- **影响范围**：Tauri 桌面端安全边界；symmetric 块教学正确性
- **潜在受害模块**：导出/导入流程（权限收紧需回归）、mode 块生成代码
- **数据完整性风险**：权限场景下存在（XSS 链），当前缓解中
- **严重程度复核**：维持 P2

## 5. 修复方案

### 方案 A（推荐）：权限收敛 + 导出确认 + 提示与校验

- **做什么**：
  1. capabilities 移除 `$HOME/**`，保留 `$DOWNLOAD/$DESKTOP/$DOCUMENT`（用户可见目录）
  2. `serialization.ts` 移除 `lastExportPath` 快速覆写——每次导出经保存对话框（对话框选择即用户授权）；核验 `window.__TAURI__` 无直接使用后 `withGlobalTauri: false`
  3. ECB tooltip 加 ⚠️ 教学警告
  4. JS/PY 生成器 mode 函数加 key=16 / iv=16 / nonce=16 运行时校验（throw / raise ValueError）
- **优点**：根治三条缺口；导出行为回归"每经用户确认"
- **缺点 / 风险**：权限收紧后保存到白名单外目录会失败（对话框提示，可接受的教学/桌面场景）；需回归导出/导入流程
- **影响面**：`src-tauri/capabilities/default.json`、`src-tauri/tauri.conf.json`、`src/utils/workspace/serialization.ts`、`src/blocks/symmetric/modes/blocks.ts`、双生成器 helpers

### 方案 B：最小（仅权限 + 提示）

- **做什么**：只做 1 + 3；保留 lastExportPath 快速覆写、不做 key/IV 校验
- **优点**：改动小
- **缺点 / 风险**：免确认覆写缺口仍在；key/IV 无引导
- **影响面**：同上（少 2 文件）

### 推荐方案

**推荐方案 A**：三条缺口全治；行为变化明确（导出每经对话框、白名单目录、校验报错），回归验证简单。
