---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "maintainability-04"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: 59f4bb8f
---

# Finding 18：makeDefBlock / makeCallBlock 近 200 行重复逻辑

## 速答

`makeDefBlock`（247 行）与 `makeCallBlock`（210 行）两个工厂逐成员重复：domToMutation、saveExtraState、loadExtraState、getVars、getVarModels、renameVarById、updateVarName 主体逐行相同，仅 updateParams_ 与 updateShape_ 两个渲染函数不同。

## 关键证据

- `src/blocks/procedure/blocks.ts:91-338`（def）vs `:401-611`（call）
- 重复段：domToMutation（:164-184 vs :522-549）、saveExtraState（:219-231 vs :550-559）、loadExtraState（:232-252 vs :560-579）、getVars（:253-255 vs :580-582）、getVarModels（:256-258 vs :583-585）、renameVarById（:259-272 vs :586-597）、updateVarName（:273-288 vs :598-608）

## 影响

修 def 侧 bug（如 2026-07 的 mutateCallers 同步）忘改 call 侧则两类型块行为分叉；每次 procedure 修改回归风险翻倍。

## 修复方向

抽共享 mixin/工厂：serializeArgs/loadArgs/renameVar 等纯函数化，两个块定义只保留 init/形状差异。

## 建议动作

`cs-refactor`。
