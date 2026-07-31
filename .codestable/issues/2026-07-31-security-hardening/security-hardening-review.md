---
doc_type: issue-review
issue: 2026-07-31-security-hardening
status: passed
reviewer: subagent
reviewed: 2026-07-31
round: 1
lane_a_state: completed
lane_a_ref: ReviewInteractionSecurity
lane_a_reason: ""
lane_b_state: unavailable
lane_b_reason: 安全配置/校验改动，OCR CLI 未启用
---

# 安全纵深加固修复 代码审查报告

## 1. Scope And Inputs

- Report: `security-hardening-report.md`（confirmed, standard）
- Analysis: `security-hardening-analysis.md`（confirmed，方案 A）
- Fix-note: `security-hardening-fix-note.md`
- Diff basis: `git diff`（capabilities、tauri.conf、serialization.ts、modes/blocks.ts、双生成器 helpers）
- Review mode: initial

### Independent Review

- 环节 A: independent-agent reviewer（ReviewInteractionSecurity）— 与 Issue A 同批审查
  - capabilities 收敛 + withGlobalTauri:false（全仓无 __TAURI__ 直用）+ lastExportPath 零残留 + key/iv/nonce 校验位于任何状态写入前 + Events.disable 平衡：**全部核验通过**
  - 终检 verdict: No issues（0🔴 0🟡 0🔵）
- 环节 B OCR: unavailable

## 2. Diff Summary

- 修改：`src-tauri/capabilities/default.json`（去 $HOME/**）、`src-tauri/tauri.conf.json`（withGlobalTauri false）、`src/utils/workspace/serialization.ts`（删 lastExportPath）、`src/blocks/symmetric/modes/blocks.ts`（ECB ⚠️）、`src/generators/{js,py}/symmetric/modes/helpers.ts`（长度校验）

## 3. Adversarial Pass

- 攻击：删除 lastExportPath 后导出链路是否完整（对话框路径保留）、withGlobalTauri 关闭是否破坏前端调用（模块 import 不受影响）、校验位置是否在副作用前、白名单收敛是否破坏保存流程
- 结果：无击穿

## 4. Findings

### blocking / important / nit

none

## 5. Test And QA Focus

- cargo check ✅（tauri.conf/capabilities 变更编译通过）；grep lastExportPath/__TAURI__ 零残留；Chromium 生成代码含 key/IV 校验

## 6. Residual Risk

- 白名单外路径保存失败（对话框内选择超出 $DOWNLOAD/$DESKTOP/$DOCUMENT 时 writeTextFile 权限错误）——已记录 fix-note 遗留，教学场景可接受

## 7. Verdict

- Status: passed
- Next: issue 收尾——ConfirmFixCompletion 确认后关闭

## 8. Focused Closure

none
