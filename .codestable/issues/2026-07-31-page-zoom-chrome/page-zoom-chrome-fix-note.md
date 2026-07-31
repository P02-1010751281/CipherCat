---
doc_type: issue-fix
issue: 2026-07-31-page-zoom-chrome
status: confirmed
path: standard
fix_date: 2026-07-31
related: [page-zoom-chrome-analysis.md]
tags: [layout, scaling, chrome, no-code-change]
---

# 页面缩放失效（Chrome）修复记录

## 1. 根因摘要

未确立代码缺陷根因（analysis 结论，`root_cause_type: config`）：
- 缩放链路完整：`#app { height: 100vh }`（`src/styles/base.css:27-33`）→ flex 布局（`src/App.vue:490-526`）→ window resize → `Blockly.svgResize`（`src/utils/workspace/core.ts:67-73`、`index.ts:184-188`）→ 断点切换 `onBreakpointChange`（`src/App.vue:587-595`）
- Session 3 的 `flex: '1'` 修复（`App.vue:503/:520`）已覆盖"宽高固定不动"的直接成因分支
- Chromium 实测行为与代码路径一致，无失败分叉点

## 2. 实际采用方案

**方案 A（owner 批准）**：判定为已修复/环境问题，**无代码改动**。用户真实 Chrome 复测作为可选的确认动作（系统无 Chrome 二进制，无法自动化）。

## 3. 改动文件清单

无代码改动。本 issue 仅产生 CodeStable 产物：
- `.codestable/issues/2026-07-31-page-zoom-chrome/page-zoom-chrome-report.md`
- `.codestable/issues/2026-07-31-page-zoom-chrome/page-zoom-chrome-analysis.md`
- `.codestable/issues/2026-07-31-page-zoom-chrome/page-zoom-chrome-fix-note.md`
- `.codestable/issues/2026-07-31-page-zoom-chrome/approval-report.md`

## 4. 验证结果

Chromium（headless）实测三档视口 + 交互冒烟：

| 视口 | #app | .view-left | Blockly 容器/SVG | 结论 |
|---|---|---|---|---|
| 1400x900 | 1400x900 | 1024x900 | 1024x851 | 跟随 ✅ |
| 900x600（窄） | 900x600 | 900x302（堆叠） | 900x253 | 断点切换生效 ✅ |
| 1600x1000（宽） | 1600x1000 | 1224x1000 | 1224x951 | 跟随 ✅ |

- 复现步骤走查（report §2）：调整视口 → 布局与 SVG 均正确跟随 → 期望行为满足
- 影响面回归：工具箱（`blocklyToolbox`）渲染正常、类目点击 flyout 出 12 块、工作区交互正常、无控制台错误
- 前端浏览器验证：已实际驱动 Chromium，非仅 typecheck

## 5. 遗留事项

1. 真实 Chrome（用户环境）未复测——若仍复现，带回现场证据（截图/控制台）另开 issue 继续
2. 顺手发现（不在本次范围）：`BlocklyEditor.vue:207-211` 的 `@media (max-width: 1200px)` 中 `width: 100% !important` 覆盖规则与 App.vue 窄布局样式存在职责重叠，可后续清理
