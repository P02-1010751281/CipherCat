---
doc_type: issue-report
issue: 2026-07-31-security-hardening
status: draft
issue_path: standard
severity: P2
summary: 文件系统写权限过宽 + ECB 无安全警告 + AES/SM4 无 key/IV 长度校验（安全纵深三缺口）
tags: [security, tauri, capabilities, ecb, validation]
---

# 安全纵深加固（3 类）Issue Report

> 来源：审计 finding-07/08/09（.codestable/audits/2026-07-31-procedure-system/），owner 批准全部修复。

## 1. 问题现象

1. **文件系统写权限过宽**：capabilities 允许 `fs:allow-write-text-file` 到 `$HOME/**`（含 DOWNLOAD/DESKTOP/DOCUMENT），配合 `withGlobalTauri: true` 暴露 `window.__TAURI__`，且前端 `lastExportPath` 缓存使后续导出**跳过保存对话框直接覆写**——XSS 场景下可静默覆写任意家目录文件（纵深防御缺口）
2. **ECB 模式块无安全警告**：`mode_ecb_encrypt` tooltip 纯陈述，未提示 ECB 语义泄露风险（教学平台应显式标注）
3. **AES/SM4 无运行时 key/IV 长度校验**：错误长度输入生成无法运行或静默错误的代码（仅 `cipher_key_from_seed` 有 16 字节检查）

## 2. 复现步骤

1. 权限：导出一次工作区（`lastExportPath` 缓存）→ 后续导出不弹对话框直接覆写原路径；`$HOME/**` 写权限在 capabilities 中声明
2. ECB 警告：拖出 `mode_ecb_encrypt` → 查看 tooltip → 无风险提示
3. key/IV：mode 块 KEY 输入接错误长度（如 5 字节）→ 生成代码 → 运行报错无引导提示

复现频率：稳定（静态声明 + 确定路径）。

## 3. 期望 vs 实际

**期望行为**：
1. 写权限收敛到应用数据目录；导出每次经用户确认（或明确授权路径）
2. ECB 块 tooltip 显式提示"仅教学演示，勿用于真实加密"
3. 生成器对 key/IV 长度做运行时校验并给出引导性报错

**实际行为**：
1. `$HOME/**` 可写 + `lastExportPath` 无确认覆写
2. tooltip 纯陈述（"每个明文块独立用 AES-128 加密"）
3. 无长度守卫（`javascript/index.ts:51-54` 仅 cipher_key_from_seed 有）

## 4. 环境信息

- 涉及模块 / 功能：src-tauri capabilities / serialization 导出路径 / symmetric 块与生成器
- 相关文件 / 函数：
  - `src-tauri/capabilities/default.json:9-15`（FS 写权限）、`src-tauri/tauri.conf.json`（withGlobalTauri）
  - `src/utils/workspace/serialization.ts`（lastExportPath）
  - `src/blocks/symmetric/modes/blocks.ts:26`（ECB tooltip）
  - `src/generators/{javascript,python}/symmetric/modes/helpers.ts`（AES 模式函数）
- 运行环境：dev / 生产构建均含
- 其他上下文：审计 finding-07（medium）/ 08（medium）/ 09（low）；CSP + DOMPurify 已启用（旧 #2/#3 修复），本条属纵深防御

## 5. 严重程度

**P2** — 安全纵深加固：当前注入链已缓解（CSP/净化），缺口在"若前端漏洞被利用"场景；ECB 警告与 key/IV 校验为教学正确性。快速通道判定：fix points > 2、跨 src-tauri + src/ → 标准路径。

## 备注

- 修复方向：写权限收敛到 `$APPDATA`/`$DOCUMENT` 白名单 + `lastExportPath` 移除无确认覆写 + 评估关闭 `withGlobalTauri`；ECB tooltip 加 ⚠️；双生成器加 key/IV 长度校验
