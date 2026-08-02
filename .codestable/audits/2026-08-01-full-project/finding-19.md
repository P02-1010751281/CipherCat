---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "maintainability-05"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: 88619d47
---

# Finding 19：migrateBlockType 死导出

## 速答

`migrateBlockType` 全项目无任何 import/调用，死导出留在公共 utils 里，误导后续维护者以为存在单类型迁移入口（实际迁移只走 XML/JSON 整体路径）。

## 关键证据

- `src/utils/migration.ts:51-53` — `export function migrateBlockType(...)`
- grep 全 src 无引用；同文件 migrateXmlText/migrateJsonState/getMigrationMap 分别被 serialization.ts:2 与 generators/*/index.ts:16 使用

## 影响

API 面虚增，维护者可能误用；属于死代码清理最明确的一条。

## 修复方向

删除该导出；如确需单类型入口，由调用方改用 `getMigrationMap()[type] ?? type`。

## 建议动作

`cs-refactor`。
