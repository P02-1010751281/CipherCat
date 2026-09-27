---
doc_type: audit-index
audit: 2026-09-07-docs-functions-demos
created: 2026-09-07
status: superseded
superseded_by: 2026-09-12-ciphercat-full-review
---

# 文档、函数与 Demo 审计

- **日期**：2026-09-07
- **范围**：`docs/`、`demos/`、Blockly 块注册表、JS/Python 生成器、procedure 模板，以及同步到 `metacrypt_server` 的共享文档。
- **状态**：完成；修正项已落地并完成构建、模板、demo、单元测试与链接核对。

## 发现与处理

| 等级 | 发现 | 处理 |
|---|---|---|
| P1 | 根 README、块索引、审计报告和模板校验器仍使用 134/139/141 或 28 模板等历史数字 | 统一到 140 个唯一块、29 个模板，并注明递归展开/去重口径 |
| P1 | Metacrypto 的 `frontend/demos` 与历史 `backend/docs` 相对链接层级错误 | 修正文档链接，并把 backend/docs 链接适配写入同步脚本 |
| P2 | Metacrypto 架构文档仍指向旧 Blockly 路径和旧 procedure 类型名 | 更新为 `frontend/src/features/blockly/core/` 与 `procedures_defreturn` |
| P2 | 文档关系图使用等宽字符绘制，维护成本高 | 改为 Mermaid |
| — | 57 个 demo 注册项与实际文件双向一致；JS/Python 原子生成器覆盖完整，3 个动态 wrapper 属于模板展开 | 保留为无问题核对项 |

## 已完成的静态核对

- `ALL_BLOCK_TYPES` 递归展开后去重：140。
- `TEMPLATE_PREFILL` / 模板 harness：29。
- `demos/tests.json`：57 个注册项，未发现未注册或陈旧项。
- CipherCat Markdown 221 个、Metacrypto Markdown 224 个；项目内相对链接扫描无断链。
- 研究文献已下载到 `paper/references/`，并完成 PDF 可读性与 SHA-256 校验。

## 验证结果

- CipherCat：`npm run build` 通过；verify build 通过；模板 `29/29 PASS`；demo `57/57` 的 JS/Python 官方向量均 PASS。
- Metacrypto：生产构建通过；verify build 通过；模板 `29/29 PASS`；同步后的 demo `57/57` 的 JS/Python 官方向量均 PASS；Vitest `78/78` 文件、`725/725` 测试通过。
- Metacrypto `npm run type-check` 仍失败，错误来自既有的 RuoYi/Element Plus 通用组件、布局和 `views/tool/gen` 类型债务；本次变更未触及这些文件。

## 注意

现有 lint 仍有历史规则噪声（主要集中在序列化数据、生成器字符串和旧框架文件），不把 lint 全量通过冒充本次审计完成；最终验证以构建、模板 harness、demo harness、单元测试和类型检查结果为准。
