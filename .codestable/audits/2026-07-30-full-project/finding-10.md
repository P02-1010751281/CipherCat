---
doc_type: audit-finding
id: 10
title: "remaining.ts blocks missing from ALL_BLOCK_TYPES union"
severity: P2
nature: maintainability
confidence: high
recommendation: cs-issue
---

## 描述

`src/blocks/remaining.ts` 包含 17 个块定义（来自后量子便利层、哈希、编码等多个类目），但该文件未导出 `BLOCK_TYPES` 常量。这导致这些块的类型未包含在 `ALL_BLOCK_TYPES` 联合类型中——TypeScript 类型检查无法覆盖这些块的生成器注册。

## 影响

TypeScript 类型安全保障存在盲区：约 17 个块的生成器不受类型检查约束，字段名拼写错误、缺失注册等问题只能在运行时暴露。

## 修复方向

为 `remaining.ts` 添加 `BLOCK_TYPES` 导出常量，并纳入全局类型联合。
