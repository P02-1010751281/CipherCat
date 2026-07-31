---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "performance-02"
nature: performance
severity: P2
confidence: medium
suggested_action: cs-refactor
status: open
---

# Finding 11：Function Manager 的 change listener 未按 visible 门控，每次事件全量扫描

## 速答

面板常驻挂载（App.vue 无 v-if），workspace watch 无条件挂 change listener；每个 Blockly 变更事件触发 `refreshWsFuncs()` 全量遍历（O(块数×30)），且 `cTypes` 每次重建、列表无条件新数组赋值——面板关闭时代价全程存在。

## 关键证据

- `src/components/CryptoFunctionPanel.vue:146-149` — watch workspace 无条件 `setupChangeListener()`（面板关闭也挂）
- `src/components/CryptoFunctionPanel.vue:118-132` — `refreshWsFuncs`：`ws.getAllBlocks(false)` + 每块线性 `cTypes.includes`（:120 每次重建 ~30 项）+ `wsFuncs.value = all` 无条件赋值
- `src/App.vue:250-254` — `<CryptoFunctionPanel>` 无 v-if，visible 仅控制内部显示

## 影响

拖拽/编辑期间每次事件 O(块数×30) 扫描与响应式写入；列表整体重渲染即使函数集合未变。

## 修复方向

cTypes 提为模块级常量；监听器仅在 visible=true 时挂载；按事件类型过滤（忽略 UI/BLOCK_MOVE）；无变化时不赋值；可加防抖。

## 建议动作

`cs-refactor`，因为是性能结构性优化。
