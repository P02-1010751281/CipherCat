---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "bug-05"
nature: bug
severity: P2
confidence: medium
suggested_action: cs-issue
---

# Finding 05：def 块 compose() 无条件 push 可能为 null 的 VariableModel

## 速答

def 块 `compose()` 对参数逐个 `getOrCreateVariablePackage` 后无条件 push 结果，未判空。Blockly 在部分加载/恢复路径下返回 null → `saveExtraState` 序列化 `variables.getVariableById(null)` 抛 TypeError → 顶层 catch 用空字符串覆盖 DB 中的项目记录。

## 关键证据

- `src/blocks/procedure/blocks.ts` — def 块 `compose()`（91-338 行区间）`arguments_.push(...)` 前无 null 守卫
- 该错误路径与 `saveExtraState`/`loadExtraState`（219-252 行）序列化联动，异常被外层 try/catch 吞掉并以空串回写

## 影响

边界场景（导入损坏 JSON、部分反序列化失败）下项目内容被空串覆盖，数据丢失。触发频率低但破坏性大（覆盖而非拒绝）。

## 修复方向

`compose()` 对 null VariableModel 跳过或报错中止；保存链路对序列化异常应保留原数据而非空串覆盖。

## 建议动作

`cs-issue`。
