---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "maintainability-02"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: open
---

# Finding 15：BlocklyEditor.vue 工具箱样式选择器指向 Blockly ≤11 类名，12.5.1 下全部失效

## 速答

`:deep(.blocklyToolboxDiv)`（重复两次）、`:deep(.blocklyTreeRow)`、`:deep(.blocklyTreeSelected)` 在 Blockly 12.5.1 下不匹配任何元素（实际类为 `blocklyToolbox` / `blocklyToolboxCategory*`）——工具箱背景/悬停/选中样式静默失效。

## 关键证据

- `src/components/BlocklyEditor.vue:143,173` — `:deep(.blocklyToolboxDiv)` 重复定义
- `src/components/BlocklyEditor.vue:149` — `:deep(.blocklyTreeRow)`；`:160` — `:deep(.blocklyTreeSelected)`
- `node_modules/blockly/blockly_compressed.js:1764` — 实际容器类 `blocklyToolbox`；:1737 `blocklyToolboxCategory/blocklyToolboxSelected/blocklyToolboxCategoryContainer`；全文件 grep 无 `blocklyToolboxDiv`/`blocklyTreeRow`
- 与 cs-issue 2026-07-31-page-zoom-chrome review REV-001 同源

## 影响

维护者改样式无从感知（渲染器主题兜底外观）；同选择器重复定义加剧混淆。已沉淀于 `.codestable/compound/2026-07-31-blockly-12-toolbox-classnames.md`。

## 修复方向

选择器改为 12.5 实际类名（blocklyToolbox / blocklyToolboxCategory 等），去重。

## 建议动作

`cs-refactor`，因为是死代码清理。
