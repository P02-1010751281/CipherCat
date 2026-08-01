---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "performance-05"
nature: performance
severity: P2
confidence: medium
suggested_action: cs-refactor
---

# Finding 14：批量模板导出 30× initSvg+render + 每模板两次变量表全量扫描

## 速答

`handleExportAll` 一次性串行创建约 30 个模板块，每个都 `initSvg()`（创建 SVG DOM，Blockly 最贵操作）+ `render()` + `serialization.blocks.save` + dispose；且每模板前后各一次 `getAllVariables()` 全量扫描 + 逐变量 deleteVariable（O(V) 每模板）。单次点击累计 30×(SVG 初始化 + O(V))，大工作区数百 ms 卡顿。

## 关键证据

- `src/components/CryptoFunctionPanel.vue:247-256` — `for (const type of allTypes) { serializeTemplate(type) }`
- `src/components/CryptoFunctionPanel.vue:195-221` — 每模板 newBlock + initSvg + 变量表双扫 + deleteVariable

## 影响

"导出全部"按钮一次点击数百 ms 主线程卡顿；仅批导出路径，非热点但可感知。

## 修复方向

批量导出复用同一 tmpBlock 空间或跳过 initSvg（无 DOM 需求时只 initModel）；变量扫描合并为一次 diff。

## 建议动作

`cs-refactor`。
