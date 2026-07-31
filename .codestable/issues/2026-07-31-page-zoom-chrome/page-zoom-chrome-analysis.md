---
doc_type: issue-analysis
issue: 2026-07-31-page-zoom-chrome
status: confirmed
root_cause_type: config
related: [page-zoom-chrome-report.md]
tags: [layout, scaling, chrome, workspace, reproduction]
---

# 页面缩放失效（Chrome）根因分析

## 1. 问题定位

缩放链路关键位置（全部核查，无缺陷行）：

| 关键位置 | 说明 |
|---|---|
| `src/styles/base.css:27-33` | `#app { width: 100%; height: 100vh; overflow: hidden }` — 根容器随视口 |
| `src/App.vue:484` | `matchMedia('(max-width: 1200px)')` 窄布局判定 |
| `src/App.vue:490-526` | `codeStyle`/`editorStyle` computed — flex 布局（:503/:520 修复后的 `flex: '1'` 分支） |
| `src/App.vue:587-595` | `onBreakpointChange` — 断点切换时重置尺寸并 `resizeWorkspace` |
| `src/components/BlocklyEditor.vue:131-137` | `.blockly-workspace { flex: 1; min-width: 0; min-height: 0; overflow: hidden }` |
| `src/utils/workspace/core.ts:67-73` | `resizeWorkspace` → `Blockly.svgResize` |
| `src/utils/workspace/index.ts:184-188` | `setupResizeListener` — window resize → svgResize |

## 2. 失败路径还原

**正常路径**：窗口 resize → CSS flex/`100vh` 布局自适应 → window resize 事件 → `svgResize` 更新 Blockly SVG → 布局跟随。

**失败路径**：复测中未观察到。Chromium（headless）实测：
- 视口 1400x900 → `#app` 1400x900、blockly 容器/SVG 1024x851 ✅
- 视口 900x600 → `#app` 900x600、窄布局堆叠生效（`.view-left` 900x302、SVG 900x253）✅
- 视口 1600x1000 → `#app` 1600x1000、宽布局（`.view-left` 1224x1000、SVG 1224x951）✅

工具箱（`blocklyToolbox` 12.5 新类名）渲染正常，类目点击 flyout 出 12 块，workspace 交互正常。

**分叉点**：无。代码路径与 Chromium 实测行为一致。

## 3. 根因

**根因类型**：config / environment（未确立代码缺陷）

**根因描述**：缩放链路（CSS 布局 + window resize + `svgResize`）代码完整且 Chromium 实测行为正确——视口缩放、断点切换均正常跟随。Session 3 的 `flex: '1'` 修复已覆盖此前"宽高固定不动"的直接成因（flex 分支返回空对象时布局不伸展）。剩余最可能解释：① 用户报告的 Chrome 异常发生在 flex 修复**之前**，修复后未在真实 Chrome 复测；② 或为 Chrome 缓存/DevTools 停靠等环境差异。**无法在代码中确立 Chrome 特有缺陷**。

**是否有多个根因**：否（单一——更准确说，无已确立的代码根因；现象的最合理解释是已修复/环境差异）。

## 4. 影响面

- **影响范围**：仅报告场景（Chrome 下布局不自适应）；Firefox 一直正常，Chromium 复测正常
- **潜在受害模块**：无（缩放链路单一，无共享状态）
- **数据完整性风险**：无
- **严重程度复核**：由 P2 **调整为 P3** — 复测未复现，代码无缺陷；若确为已修复，残留影响仅为潜在环境差异

## 5. 修复方案

### 方案 A：判定已修复 / 环境问题，无代码改动
- **做什么**：以 Chromium 复测证据关闭 issue；建议用户在真实 Chrome（无痕窗口）复测一次确认
- **优点**：零改动零风险；避免为不存在的缺陷引入代码
- **缺点 / 风险**：若用户真实 Chrome 仍复现，需带回现场证据（截图/控制台）继续追
- **影响面**：无代码变更

### 方案 B：ResizeObserver 防御性加固
- **做什么**：`src/utils/workspace/index.ts` 的 `setupResizeListener` 除 window resize 外，用 `ResizeObserver` 监听 Blockly 注入容器尺寸变化并 `svgResize`
- **优点**：覆盖非窗口触发的容器尺寸变化（DevTools 停靠切换等边缘场景）；低风险小改动
- **缺点 / 风险**：当前所有容器变化来源（窗口 resize、拖拽分隔条、断点切换）已有显式处理，RO 属冗余防御；增加代码面
- **影响面**：仅 `workspace/index.ts`（或 core.ts）

### 方案 C：用户真实 Chrome 复测后决定
- **做什么**：先在真实 Chrome（无痕/清缓存）验证当前 build；仍复现则带回现场继续分析，不复现则关闭
- **优点**：唯一能 100% 确认"用户环境"结论的途径
- **缺点 / 风险**：需要用户操作；当前无法自动化（系统无 Chrome 二进制）

### 推荐方案

**推荐方案 A**（可叠加 C 作为确认动作）：改动最小、根因最可能已不存在；证据链完整（代码核查 + Chromium 三档视口复测）。若用户希望彻底排除边缘场景，可附加 B（ResizeObserver 加固）。
