---
doc_type: approval-report
unit: .codestable/issues/2026-07-31-demos-broken-refs
status: approved
reason: other
approvals: {issue-report: approved, fix-plan: approved, issue-fix-completion: approved}
approval_groups: {}
created_at: 2026-07-31
---

# Approval Report

## Decision History

- 2026-07-31 — `issue-report`: **approved**（demos 损坏引用确认，16 文件修复 + 1 遗留）
- 2026-07-31 — `fix-plan`: **approved**（crypto_func_def → procedures_defreturn 转换 + data_text → data_value）
- 2026-07-31 — `issue-fix-completion`: **approved**（owner 确认，issue 关闭）

## Decision Needed

确认修复完成并关闭 issue（`demos-broken-refs-fix-note.md` + `demos-broken-refs-review.md` 已落盘）。

## Why Now

16 个损坏 demo 文件已修复（14 × crypto_func_def 转换 + 2 × data_text 替换），连带修复 def 块生成器 STACK 守卫缺陷（JS/Python 双生成器）。浏览器实测 6 个代表 demo 导入 0 警告 + 双语言生成成功；vue-tsc / eslint / vite build 全绿。

## Context

转换规则：`FUNC_NAME`→`NAME`、STACK→RETURN、参数 id 与 body 变量对齐（SM4 拆字特殊处理）；`data_text`→`data_value`（占位文本改合法 hex）。唯一遗留 `ML-KEM-Atomic.json` 的 `pq_*_vec` 块替换需语义决策，README 已标注。

## Options

1. **批准（Approved）** — 修复完成，关闭 issue；ML-KEM-Atomic 作为独立决策项跟踪
2. **修订（Revise）** / **拒绝（Rejected）**

## Recommendation

批准。修复范围覆盖审计遗留问题 1（demos 损坏引用），验证链完整（静态 + 浏览器 + 构建门禁）。

## Risks And Tradeoffs

- `data_value` 占位文本从教学占位符改为 hex 字面量（AES-Atomic-Round），教学语义由"输入 16 字节 state"变为具体示例值——更可执行
- SM4-Round 函数签名从 `(state, rk)` 变为 `(state_0..3, rk)`——忠实于 body 实际引用的变量（旧导出本身变量不一致）

## Non-Automatic Actions

修复已与 discussion_log 整理、approval 收尾一并提交（收尾询问已确认）。

## After You Answer

- Approved → issue 关闭；审计/discussion_log 遗留同步更新
