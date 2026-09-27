---
doc_type: audit-finding
audit: 2026-09-12-ciphercat-full-review
id: CC-20260912-02
dimension: testing
severity: P2
confidence: high
status: resolved
recommendation: cs-feat
---

# CC-20260912-02 尚无单元测试框架

## 证据

- [`package.json:24-44`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/package.json:24)现已提供 `test:unit`，并在 `vitest.config.ts` 中固定测试目录和 Node 环境。
- 当前 `verify:all` 已验证 29 个模板和 57 个 demo，适合做结构/生成/选定向量回归，但不能替代针对纯函数、异常路径和边界值的单元测试。
- [`RULES.md:85-90`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/RULES.md:85)已将单元测试设为稳定公共 API 出现后的后续要求，避免虚报当前覆盖率。

## 影响

生成器和工具函数的局部回归可能只在少数 demo 中暴露；类型转换、非法长度、空输入和失败路径的覆盖不足。

## 处理

已为文档元数据、工作区迁移、错误处理和类型兼容规则加入 10 个 Vitest 测试，并纳入 CI；覆盖率门槛仍待测试面稳定后再设定，不堆积脆弱快照。
