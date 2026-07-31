---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "security-03"
nature: security
severity: P2
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: cs-issue 2026-07-31-security-hardening
---

# Finding 08：ECB 模式块无安全警告（旧 #11 未关）

## 速答

`mode_ecb_encrypt` 的 tooltip 仅陈述算法（"每个明文块独立用 AES-128 加密"），无"不安全/仅教学"警告——密码学教学平台应明确 ECB 的语义泄露风险。

## 关键证据

- `src/blocks/symmetric/modes/blocks.ts:26` — tooltip 纯陈述，全 src 无 ⚠️/不安全/warning 字样
- 旧审计 full-project #11（ECB 无安全警告）open

## 影响

教学场景用户可能将 ECB 用于真实数据；平台价值观（教学正确性）要求显式风险提示。

## 修复方向

tooltip 增加风险提示（如"⚠️ 仅教学演示：ECB 泄露明文模式信息，勿用于真实加密"），可同时给 ECB 块加视觉标识。

## 建议动作

`cs-issue`，因为单文件 tooltip 文案改动，安全提示类小修。
