---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "bug-03"
nature: bug
severity: P1
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: 2026-07-31-procedure-template-prefill
---

# Finding 03：模板预填链在 workspace 加载/导入后重复注入

## 速答

`__prefilled` 是运行时实例属性，不随序列化持久化；保存后重新加载（或导入）含 proc_* 模板的 workspace 时，onchange 再次触发 → 预填链重复注入一份，用户工作区出现重复块。

## 关键证据

- `src/blocks/procedure/blocks.ts:814-821` — onchange 里 `if (!self.__prefilled) { self.__prefilled = true; injectPrefill(...) }`，标记仅存在于内存
- `src/blocks/procedure/blocks.ts:728-767` — `injectPrefill` 对 RETURN 链/bodyState 无条件 append
- Blockly 12.5.1 运行时验证：serialization append 后 BLOCK_CREATE 事件异步分发，模板 onchange 在 load/import 后再次触发（scout 对照 node_modules blockly_compressed.js 确认）

## 影响

含模板块的 workspace 每次保存/重载或导入都会累积重复算法链；undo 栈与内容被污染。

## 修复方向

序列化持久化预填标记（saveExtraState/loadExtraState 加 `prefilled: true` 字段），load 时跳过注入；或注入前检查目标输入已有子块。

## 建议动作

`cs-issue`，因为确定触发的内容重复 bug，影响教学主流程（模板工作区保存/重载）。
