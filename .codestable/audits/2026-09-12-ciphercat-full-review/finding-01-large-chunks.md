---
doc_type: audit-finding
audit: 2026-09-12-ciphercat-full-review
id: CC-20260912-01
dimension: performance
severity: P2
confidence: high
status: mitigated
recommendation: cs-refactor
---

# CC-20260912-01 生产构建存在大 chunk

## 证据

- [`src/main.ts`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/main.ts)不再在应用入口注册编辑器专属块和生成器；注册已移到 `/editor` 路由的 `App.vue`。
- [`vite.config.ts:19-55`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/vite.config.ts:19)把 Blockly、文档渲染器和 Mermaid 分到独立 chunk，并保留路由级动态导入。
- 最新 `npm run build` 的入口约 31.6 kB；动态 `mermaid`、`docs-renderer`、`blockly` 和 `App` chunk 仍较大，因此本发现只标记为 mitigated。

## 影响

功能和正确性不受当前问题影响，但浏览器首屏、低带宽加载和 Tauri 初始启动成本会增加；大 chunk 也会让后续增量修改更难定位。

## 建议

按路由和功能对 Docs、Mermaid/Cytoscape 与编辑器做懒加载，保留当前 build 输出作为基线，并用 `npm run build:check-bundle` 对首屏入口设置 64 KiB 回归阈值。不要只通过提高 warning 阈值隐藏问题。
