---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "bug-03"
nature: bug
severity: P2
confidence: medium
suggested_action: cs-issue
---

# Finding 03：模板函数改名后 call 块参数同步失效

## 速答

`TEMPLATE_REGISTRY` 条目以块类型名（`proc_*`）为 key，`buildCallOptions` 生成的下拉选项值也用块类型名。模板函数改名（FUNC_NAME 字段变更）后，call 块下拉的选项值仍为块类型名，参数同步（mutateCallers）失效 → 生成缺参调用。

## 关键证据

- `src/blocks/procedure/blocks.ts` — `TEMPLATE_REGISTRY`（882 行）key 为块类型；call 块下拉选项值取自 `buildCallOptions`（354-371 行）的 `wsTemplateNames`
- 改名路径（def 块 BLOCK_CHANGE）同步 call 参数依赖 `doValueUpdate_` + selectedOption 匹配（2026-07 修过），但模板类块的 NAME 与类型名绑定未覆盖

## 影响

用户拖出模板、改函数名后，调用块参数列表不跟随，生成的调用缺参或少参，Python/JS 运行时报错。低频但静默错误。

## 修复方向

模板改名路径单独处理：FUNC_NAME 变更时对引用该模板的 call 块做参数重建（与自定义 def 改名同路径）。

## 建议动作

`cs-issue`。
