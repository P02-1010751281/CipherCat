---
doc_type: audit-finding
audit: 2026-09-07-full-project-review
id: CC-03
dimension: maintainability
severity: P2
confidence: high
status: open
recommendation: cs-refactor
---

# CC-03 procedure flyout 隐藏异常并保留死参数

## 证据

- [`src/blocks/procedure/category.ts:27-36`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/blocks/procedure/category.ts:27)在读取 `Blockly.Procedures.allProcedures(workspace)` 失败时使用空 catch：

```ts
try {
  const tuples = Blockly.Procedures.allProcedures(workspace);
  // ...
} catch { /* 忽略 */ }
```

- [`src/blocks/procedure/category.ts:45-52`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/src/blocks/procedure/category.ts:45)读取 `paramType`，但生成的 `extraState` 没有使用它；这会让类型变更静默失效，也使 lint 只能给出警告。

## 影响

Blockly 状态异常时，函数调用块会静默缺失，用户只看到不完整的 flyout，日志中也没有定位线索。

## 建议

保留最小的受控日志或可观测错误状态，并在失败时给出安全的基础块回退；若 `paramType` 不再参与状态，删除它；若应参与生成，则补入 schema 和测试，不要保留未使用的读取。
