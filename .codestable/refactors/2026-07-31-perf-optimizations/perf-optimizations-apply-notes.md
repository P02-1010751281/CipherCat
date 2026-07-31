---
doc_type: refactor-apply-notes
refactor: 2026-07-31-perf-optimizations
---

# perf-optimizations apply notes

## 步骤 1: #1 语言切换避免无谓全量重建（空工作区快速路径）

- 完成时间: 2026-07-31
- 改动文件: `src/utils/workspace/index.ts`（refreshBlocks 加空工作区快速路径）
- 验证结果: vue-tsc 0；浏览器实测 en 'to fn do return' ↔ zh '至 fn do 返回' 标签切换、块数保留
- 偏离: **scan 原方案（markDirty+render 就地刷新）经实测不更新 msg 派生标签**（FieldLabel 文本烘焙于 init，无就地刷新 API）——行为不等价，修正为保留 serialize→clear→load + 空态快速路径；undo 历史随重建丢失为固有行为（记录于 fix 说明）

## 步骤 2: #2 Panel 监听 visible 门控 + cTypes 常量缓存 + 事件过滤

- 完成时间: 2026-07-31
- 改动文件: `src/components/CryptoFunctionPanel.vue`（TEMPLATE_TYPE_SET 模块级常量、workspace watch 门控 visible、handler 过滤 ui/move/finished_loading、列表无变化不赋值）
- 验证结果: vue-tsc 0；浏览器实测面板关闭时增块 listenerDelta=0
- 偏离: 无
- **行为注记**：TEMPLATE_TYPE_SET 仅含注册表模板（crypto_return/procedures_ifreturn 为面板 base 类目控制流块，不在注册表）——Workspace 函数清单不再列出这两个控制流块（reviewer 确认设计合理；仍可经类目 📤 导出）

## 步骤 3: #3 split 拖拽缓存 rect + rAF 节流

- 完成时间: 2026-07-31
- 改动文件: `src/App.vue`（dragRect 拖拽起点缓存、dragPos + rAF 节流 handler 体、onSplitDragEnd 清缓存 + 最终应用）
- 验证结果: vue-tsc 0；布局计算逻辑与改前一致（仅节流与缓存）
- 偏离: 无

## 全量验证

- vue-tsc ✅ / eslint 0 errors ✅ / vite build ✅ / 浏览器冒烟（语言切换、Panel 监听、拖拽路径）
