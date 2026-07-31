---
doc_type: refactor-design
refactor: 2026-07-31-perf-optimizations
status: draft
scope: "语言切换重建 + Panel 监听开销 + 拖拽回流（审计 finding-10/11/12）"
summary: "3 条性能优化，全为低风险 AI 可自证"
---

# perf-optimizations refactor design

## 1. 本次范围

- scan 勾选：#1（语言切换就地刷新）、#2（Panel 监听门控 + 缓存）、#3（拖拽节流）——全部 ✓（用户"全部"批次预选）
- 预估：约 65 行 / 3 文件 / 低风险

## 2. 前置依赖

- 调用方搜索：`refreshBlocks` 引用点（workspace API、BlocklyEditor expose、App.vue 唯一调用）；`onSplitDragStart/Move/End` 事件绑定
- 无测试需补（行为等价由浏览器验证）

## 3. 执行顺序

### 步骤 1：#1 语言切换避免无谓全量重建（空工作区快速路径）

- 引用方法：M-L4-05（Index & Cache / 跳过不必要工作）
- 具体操作：`workspace/index.ts` 的 `refreshBlocks` 保留 serialize→clear→load（语言切换必须重建块——字段文本在 init 时从 Msg 烘焙，无就地刷新 API，实测 markDirty+render 不更新标签）；增加**空工作区快速路径**（`getAllBlocks(false).length === 0` 直接跳过——编辑器默认空态的语言切换零成本）；坐标由 XML 保留，undo 历史随重建丢失（固有，fix-note 记录）
- 偏离记录：scan 原方案（markDirty+render 就地刷新）经浏览器实测**不更新 msg 派生标签**（FieldLabel 文本烘焙于 init），行为不等价——修正为保留 reload + 空态快速路径
- 退出信号：vue-tsc；浏览器：空工作区切语言无冻结、非空工作区标签正确切换（至/至 ↔ to fn）
- 验证责任：AI 自证
- 回滚：git revert 本步

### 步骤 2：#2 Panel 监听门控 + cTypes 缓存 + 事件过滤

- 引用方法：M-L4-05
- 具体操作：`CryptoFunctionPanel.vue`——(a) `cTypes` 提为模块级 `const`（派生自 TEMPLATE_REGISTRY keys + 原生 procedure 类型）；(b) `watch(workspace)` 仅 `props.visible` 时 setup（否则只刷新不挂监听）；(c) change handler 过滤 `ui`/`move`/`finished_loading`（`e.type` 判断）；(d) 列表变更守卫：`wsFuncs.value` 赋值前与旧值比较（长度 + id 序列）
- 退出信号：vue-tsc；浏览器：面板关闭时增删块监听计数为 0
- 验证责任：AI 自证
- 回滚：git revert 本步

### 步骤 3：#3 split 拖拽缓存 rect + rAF 节流

- 引用方法：M-L4-08
- 具体操作：`App.vue`——`onSplitDragStart` 缓存 `container.getBoundingClientRect()` 到模块级 `dragRect`；`onSplitDragMove` 存最新 `clientX/clientY` 到 `dragPos`，`if (rafId) return` + rAF 内应用布局计算 + resizeWorkspace；`onSplitDragEnd` 清缓存 + 最终应用
- 退出信号：vue-tsc；浏览器拖拽分隔条布局跟随正常
- 验证责任：AI 自证
- 回滚：git revert 本步

## 4. 风险与看点

- #1 的 markDirty+render 若遇自定义字段无 markDirty——typeof 守卫跳过；tooltip 文本不随语言切换更新（定义时快照，既有行为不变）
- #2 的 cTypes 提为模块级常量——categories（locale 相关）仍动态构建，仅类型清单静态化（注册表不可变）
- #3 拖拽末帧事件可能丢失——rAF 内用最新 pos，视觉连续
