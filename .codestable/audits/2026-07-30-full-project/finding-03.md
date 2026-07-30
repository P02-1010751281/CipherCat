---
doc_type: audit-finding
id: 3
title: "Unsanitized markdown rendered via v-html"
severity: P1
nature: security
confidence: high
recommendation: cs-issue
---

## 描述

`src/utils/markdown.ts` 使用 `marked` v18（自 v4 起不再内置 sanitizer）将用户提供的 Markdown 内容渲染为 HTML 字符串，然后直接通过 Vue 的 `v-html` 指令注入 DOM。marked 允许原始 HTML 透传——攻击者可在 Markdown 文档中嵌入 `<script>`、`<iframe>`、`<img onerror>` 等载荷。

## 证据

**markdown.ts:37-39** — 无 sanitization：
```typescript
export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}
```

**DocsView.vue** — 渲染结果直接给 v-html：
```vue
<div class="doc-content" v-html="renderedHtml"></div>
```

`marked` 默认允许原始 HTML 透传。`content` 参数来自 `docs/` 目录下的 `.md` 文件——虽然当前这些文件是本地的，但若未来支持用户上传工作区文档或从远程加载，即构成可触发 XSS。

## 影响

在 CSP 已禁用的环境下（见 finding-02），任意 JavaScript 可在应用上下文执行，包括访问 Tauri IPC 桥。

## 修复方向

1. 添加 DOMPurify：`return DOMPurify.sanitize(marked.parse(content))`
2. 或使用 `marked` 的 `sanitizer` 选项配置白名单
