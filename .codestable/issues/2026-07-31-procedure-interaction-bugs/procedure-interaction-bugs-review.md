---
doc_type: issue-review
issue: 2026-07-31-procedure-interaction-bugs
status: passed
reviewer: subagent
reviewed: 2026-07-31
round: 2
lane_a_state: completed
lane_a_ref: ReviewInteractionSecurity
lane_a_reason: ""
lane_b_state: unavailable
lane_b_reason: 交互/逻辑改动，OCR CLI 未启用
---

# Procedure 交互缺陷修复 代码审查报告

## 1. Scope And Inputs

- Report: `procedure-interaction-bugs-report.md`（confirmed, standard）
- Analysis: `procedure-interaction-bugs-analysis.md`（confirmed，方案 A）
- Fix-note: `procedure-interaction-bugs-fix-note.md`（含 review-fix 记录）
- Diff basis: `git diff`（blocks.ts + CryptoFunctionPanel.vue）
- Review mode: full-rereview（round 2，首轮 2🟡 修复后）

### Independent Review

- 环节 A: independent-agent reviewer（ReviewInteractionSecurity）round 1 + 聚焦复检 + 终检
  - round 1: 0🔴 2🟡（删除后 selectedOption 陈旧、导出变量泄漏）
  - 复检: fix 2 ✅ / fix 1 部分（其他函数存在时 '' 不在选项）
  - 终检: **No issues. totals: 0🔴 0🟡 0🔵**
- 环节 B OCR: unavailable

## 2. Diff Summary

- 修改：`src/blocks/procedure/blocks.ts`（identifierValidator、def onchange 改名传播、call onchange 删除兜底、惰性下拉、domToMutation 读 name、selectedOption 同步）、`src/components/CryptoFunctionPanel.vue`（serializeTemplate 隔离导出 + 变量快照清理）

## 3. Adversarial Pass

- 攻击：改名时 mutateCallers 按新名匹配落空（用 oldValue 直配）、def dispose 时 listener 先移除（删除兜底移至 call 侧）、FieldDropdown getOptions(true) 缓存陈旧（刷新）、'' 不在选项（selectedOption 显式对齐 + markDirty + queueRender）、导出变量表泄漏（快照差集清理）、Events.disable/enable 平衡
- 结果：全部核验；2🟡 修复后复审通过

## 4. Findings

### blocking / important / nit

none（2🟡 已闭环：REV-001 selectedOption 同步、REV-002 导出变量清理）

## 5. Test And QA Focus

- Chromium 实测：改名传播（def→call NAME 跟随）、删除自清（单函数/多函数场景 value='' + selectedOption=null + text=''）、标识符校验、导出 0 事件 + 0 变量泄漏、惰性下拉动态选项

## 6. Residual Risk

- 删除兜底依赖异步事件派发时序（def 已从工作区移除才自清）——与原生 Blockly 行为一致，不阻塞

## 7. Verdict

- Status: passed
- Next: issue 收尾——ConfirmFixCompletion 确认后关闭

## 8. Focused Closure

none（round 2 完整复审）
