---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "bug-01"
nature: bug
severity: P1
confidence: high
suggested_action: cs-issue
status: closed
closed_by: 88619d47
---

# Finding 01：nt_mod_pow 双生成器硬编码模数 1 → 恒输出 0

## 速答

`nt_mod_pow`（模幂）块的双语言生成器把模数硬编码为 `1`：`pow(a, b, 1)`。Python 与 JS 同根因，任何输入都恒输出 0（模 1 恒 0）。教学核心块静默全错。

## 关键证据

- `src/generators/python/remaining.ts:14-15` — `return ['pow('+A+','+B+',1)', Order.ATOMIC]`
- `src/generators/javascript/remaining.ts`（同构）— `powMod(a, e, 1)` 恒 0/1
- 块定义侧未找到模数输入（无 MOD 输入槽），生成器把第 3 参写死

## 影响

模幂是数论/密码学（RSA 密钥、Diffie-Hellman）基础运算，教学场景拖出即错，且输出恒 0 无任何告警。双语言同错，用户无法通过语言切换规避。

## 修复方向

块应暴露模数输入（新增 MOD 输入槽），或生成器从块字段读取模数；若设计为固定模数，需在块内提供 MODULUS 下拉（参照 NTT 块 MODULUS 通用化先例）。

## 建议动作

`cs-issue`，确定触发的语义错误 bug，需同时改块定义 + 双生成器 + 类型映射。
