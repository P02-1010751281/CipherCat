---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "bug-04"
nature: bug
severity: P2
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: cs-issue 2026-07-31-procedure-interaction-bugs
---

# Finding 04：call 块缺失原生 onchange 生命周期，函数改名/删除后调用孤立

## 速答

自定义 call 块未实现原生 `PROCEDURE_CALL_COMMON` 的 onchange 生命周期（renameProcedure/def 删除联动），且 NAME 下拉在块创建时一次性构建——函数重命名后 call 块保留旧名（生成代码引用未定义函数），删除 def 后 call 孤立，Manager 新增模板不出现于已有 call 块下拉。

## 关键证据

- `src/blocks/procedure/blocks.ts:322-333` — `buildCallOptions` 在 `new FieldDropdown(buildCallOptions(this))`（:378）时求值一次，之后不刷新
- `src/blocks/procedure/blocks.ts:342-345` — `syncCallParams` 按名称查找 def（`getDefinition`），模板经 name-keyed 注册表 fallback；FUNC_NAME 重命名后按名同步失效
- `src/blocks/procedure/blocks.ts:377-386` — call 块无 onchange 处理（原生 PROCEDURE_CALL_COMMON 有）；`FUNC_NAME` 为自由文本输入，无标识符校验（空格/非法字符可入）

## 影响

函数改名/删除是 procedure 工作流常态操作；call 块静态化导致生成代码与工作区状态不一致，教学场景常见困惑。

## 修复方向

补 call 块 onchange（监听改名/删除事件刷新 NAME 字段与参数行）；FUNC_NAME 加标识符 validator；下拉选项改动态刷新。

## 建议动作

`cs-issue`，因为函数生命周期联动缺失是确定的功能缺口。
