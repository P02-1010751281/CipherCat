---
doc_type: audit-finding
audit: 2026-09-07-full-project-review
id: CC-01
dimension: maintainability
severity: P1
confidence: high
status: open
recommendation: cs-refactor
---

# CC-01 ESLint 质量门禁当前不可用

## 证据

- [`eslint.config.js:8-16`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/eslint.config.js:8) 只忽略 `dist`、`coverage`、`node_modules` 等目录，没有忽略或单独配置 [`src/blocks/procedure/encaps-prefill.ts`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/blocks/procedure/encaps-prefill.ts)，该文件包含大段序列化数据，触发成千上万条 `quotes` 错误。
- [`eslint.config.js:38-58`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/eslint.config.js:38)声明了 `HTMLElement`、`HTMLInputElement`，但没有声明 [`HTMLAnchorElement`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/views/DocsView.vue:344) 使用的浏览器全局。
- 实测 `npm run lint:check` 失败，约 44,471 个问题（44,399 errors、72 warnings）；即使排除序列化文件，浏览器全局缺失仍会使文档视图报 `no-undef`。

## 影响

lint 结果被生成数据噪声淹没，真实回归与格式噪声无法区分；CI 若直接以该命令作为门禁，新增问题很难被可靠识别。

## 建议

把序列化预填充文件作为生成产物处理（忽略或使用专用规则），补齐浏览器环境全局，随后把现有源文件错误分批收敛；不要在一次提交中机械改写整个预填充 JSON。
