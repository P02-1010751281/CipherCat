---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "performance-01"
nature: performance
severity: P2
confidence: high
suggested_action: cs-refactor
status: open
---

# Finding 10：语言切换触发 refreshBlocks 全量序列化重建 + updateToolbox 双重建（旧 #25 未关）

## 速答

`changeBlocklyLocale` 每次调用 `updateToolbox()` + `refreshBlocks()`；后者执行 完整 XML 导出 → 清空工作区 → 重新解析 → 逐个重渲染所有块。refreshBlocks 全项目仅此一个调用点，整个机制只为语言切换存在，且与 updateToolbox 的 toolbox 重建叠加。

## 关键证据

- `src/App.vue:288-289` — `blocklyEditor.value?.updateToolbox(); blocklyEditor.value?.refreshBlocks();`
- `src/utils/workspace/index.ts:162-172` — `refreshBlocks = exportXml → workspace.clear() → loadXml`
- 旧审计 full-project #25 open

## 影响

工作区块数多时切换语言出现可感知冻结；清空/重载丢失撤销历史与滚动位置。

## 修复方向

改为就地重渲染：setLocale 后遍历块刷新文本/工具提示，或仅重建 toolbox；删除 serialize→clear→load 路径。

## 建议动作

`cs-refactor`，因为是结构性重写而非缺陷修复。
