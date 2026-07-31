# Blockly 12.5 工具箱 DOM 类名变化（CSS 覆盖坑）

> 2026-07-31 · 来源：cs-issue `2026-07-31-page-zoom-chrome` review（REV-001 nit）

## 事实

Blockly 12.5.x 工具箱 DOM 类名已从旧版 `blocklyToolboxDiv` 变为 `blocklyToolbox*` 系列：

- 容器：`blocklyToolbox`（`blocklyToolboxDiv` 不再出现在 DOM 中）
- 类目：`blocklyToolboxCategory` / `blocklyToolboxCategoryGroup` / `blocklyToolboxCategoryContainer` / `blocklyToolboxCategoryIcon` / `blocklyToolboxCategoryLabel`
- 行级元素：`blocklyTreeRow` / `blocklyTreeLabel` 也已被新类目类替代（`blocklyTreeRow` 计数为 0）

## 影响

对 toolbox 的 CSS 覆盖（`:deep(.blocklyToolboxDiv)` 等）在 12.5 下是**死代码**——选择器不匹配任何元素，样式静默失效。CipherCat `src/components/BlocklyEditor.vue:143-147,173-175` 仍保留 `:deep(.blocklyToolboxDiv)` 死样式（顺手发现，未修）。

## 排查经验

怀疑 Blockly 内建 UI 的 CSS 覆盖失效时，先查 DOM 实际类名：

```js
[...document.querySelectorAll('[class]')].map(e => e.className)
  .filter(c => /toolbox|flyout/i.test(c))
```

不要凭旧版文档/记忆写选择器。验证元素是否真被样式命中用 getComputedStyle 而非"看起来生效"。
