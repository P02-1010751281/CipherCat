---
doc_type: refactor-scan
refactor: 2026-07-31-perf-optimizations
status: user-reviewed
scope: "App.vue 语言切换与拖拽、workspace/index.ts refreshBlocks、CryptoFunctionPanel listener"
summary: "3 条性能优化（来自审计 finding-10/11/12，用户'全部'批次已选）"
---

# 性能三连 scan

## 总览

- 扫描范围：`src/App.vue`（locale 切换 :286-299、split 拖拽 :528-570）、`src/utils/workspace/index.ts`（refreshBlocks :162-172）、`src/components/CryptoFunctionPanel.vue`（workspace watch :146-149、refreshWsFuncs :118-132）
- 发现 3 条：性能 3
- 风险：低 3
- 前置检查 7 条全过：✓（纯性能重构，行为等价；来源审计 finding-10/11/12）

## 条目

### [1] 语言切换移除 serialize→clear→load 全量重建，改为就地刷新块标签

- **位置**：`src/App.vue:288-289`、`src/utils/workspace/index.ts:162-172`
- **分类**：性能
- **现状**：`changeBlocklyLocale` 调 `updateToolbox()` + `refreshBlocks()`；refreshBlocks 执行 `exportXml → workspace.clear() → loadXml`（全量序列化往返 + 清空重载）
- **问题**：工作区块数多时切换语言可感知冻结；清空/重载**丢失撤销历史与滚动位置**；refreshBlocks 全项目仅此一个调用点
- **建议**：refreshBlocks 改为就地刷新——遍历块对全部字段 `markDirty()` + `render()`（Blockly 12 Field 有 markDirty），保留 updateToolbox；删除 serialize→clear→load 路径
- **建议映射的方法**：M-L4-01（Memoization / 避免重复昂贵操作——改为增量渲染）
- **风险**：低（markDirty+render 为 Blockly 官方字段刷新路径；tooltip 文本为定义时快照，不随切换更新——可接受）
- **验证**：AI 自证（vue-tsc + 浏览器切换语言：块标签更新、undo/滚动保留、块数不变）
- **范围**：约 20 行 / 2 文件

### [2] Panel 工作区监听按 visible 门控 + cTypes 模块级常量 + 事件过滤

- **位置**：`src/components/CryptoFunctionPanel.vue:118-132,146-149`
- **分类**：性能
- **现状**：`watch(workspace)` 无条件 `setupChangeListener()`（面板关闭也挂）；`refreshWsFuncs` 每次调用重建 `cTypes`（~27 项）并全量遍历 + 无条件赋值
- **问题**：面板关闭时代价全程存在；每次 Blockly 事件 O(块数×27) 扫描；`visible` watch 已有门控但 workspace watch 绕过它
- **建议**：workspace watch 仅 `visible` 时挂监听（visible watch 已有拆除）；`cTypes` 改为模块级常量（派生自 TEMPLATE_REGISTRY keys，静态）；handler 过滤 `ui`/`move`/`finished_loading` 事件；列表无变化不赋值
- **建议映射的方法**：M-L4-05（Index & Cache——常量缓存 + 避免重复计算）
- **风险**：低
- **验证**：AI 自证（vue-tsc + 浏览器：面板关闭时增删块不触发重扫——hook 计数）
- **范围**：约 25 行 / 1 文件

### [3] split 拖拽缓存 rect + 整个 handler rAF 节流

- **位置**：`src/App.vue:537-561`
- **分类**：性能
- **现状**：`onSplitDragMove` 每次 mousemove 调 `container.getBoundingClientRect()`（强制回流）+ 写响应式值；rAF 仅节流 resizeWorkspace
- **问题**：高刷新率设备 mousemove 120Hz+，每次强制回流 + 两次响应式更新；拖拽起点 rect 不变（可缓存）
- **建议**：拖拽起点缓存 rect；handler 体整体 rAF 节流（存最新 clientX/Y，rAF 内应用）
- **建议映射的方法**：M-L4-08（Loop Fusion / 合并重复工作——按帧合并 mousemove）
- **风险**：低
- **验证**：AI 自证（vue-tsc + 浏览器拖拽分隔条布局跟随正常）
- **范围**：约 20 行 / 1 文件
