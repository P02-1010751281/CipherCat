---
doc_type: issue-report
issue: 2026-07-31-page-zoom-chrome
status: confirmed
issue_path: standard
severity: P2
summary: Chrome 下页面宽高不随浏览器窗口缩放，Firefox 正常
tags: [layout, scaling, chrome, workspace]
---

# 页面缩放失效（Chrome）Issue Report

## 1. 问题现象

浏览器窗口缩放时页面整体宽高固定不动，不随窗口大小变化。用户在 2026-07-30 会话中反复报告：

- "宽高固定不动"
- "不跟随浏览器缩放"
- "我是说整个页面的缩放"
- "额，更正chrome异常，firefox正常缩放"

## 2. 复现步骤

1. 启动应用（dev 模式），在 **Chrome** 中打开
2. 调整浏览器窗口大小（拖拽缩放）
3. 观察到：页面布局、工作区宽高保持原尺寸，不跟随窗口变化

复现频率：Chrome 下稳定复现；**Firefox 下正常缩放**（用户明确更正）。

## 3. 期望 vs 实际

**期望行为**：窗口尺寸变化时，布局与 Blockly 工作区随窗口自适应缩放（Firefox 的行为）。

**实际行为**：Chrome 下宽高固定不动，不响应窗口 resize。

## 4. 环境信息

- 涉及模块 / 功能：页面整体布局（编辑器视图 + Blockly 工作区）
- 相关文件 / 函数：
  - `src/App.vue` — 布局 computed（`codeStyle`/`editorStyle`，flex 布局 :503/:520/:606/:707/:888/:1017）、`onBreakpointChange`（:587）、`narrowMedia` matchMedia（:484）
  - `src/utils/workspace/core.ts:67` — `resizeWorkspace` → `Blockly.svgResize`
  - `src/utils/workspace/index.ts:184` — `setupResizeListener`（window resize → svgResize）
- 运行环境：dev
- 其他上下文：Session 3（2026-07-30~31）已做过一轮修复——flex `'1'` 修复已入 `App.vue`，resize listener 结构核查正常；当时将 Chrome 异常归因于缓存/DevTools，**未确证修复**。缩放相关代码阅读未发现明确缺陷行（本报告不包含根因结论，留待 analyze 阶段）。

## 5. 严重程度

**P2** — 非核心功能受损：编辑器功能可用（仅布局不自适应），影响 Chrome 用户的使用体验；有绕过方式（Firefox 正常、手动分屏）。推荐 P2，待用户拍板。

## 备注

- 无截图/日志片段；现象来自 2026-07-30 两个会话的用户原话记录（`discussion_log.md` Session 2/3 遗留问题）。
- 快速通道判定：读代码无法定位到明确缺陷行（resize/flex 机制结构完整），不满足 fast-path 条件，走标准路径。
