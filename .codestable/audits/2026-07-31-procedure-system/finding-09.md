---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "security-04"
nature: security
severity: P2
confidence: low
suggested_action: cs-issue
status: closed
closed_by: cs-issue 2026-07-31-security-hardening
---

# Finding 09：AES/SM4 无运行时 key/IV 长度校验（旧 #26 未关）

## 速答

AES/SM4 相关块与生成器均无 key/IV 长度运行时校验（仅 `cipher_key_from_seed` 有 16 字节检查）——错误长度输入生成无法运行的代码或静默错误。

## 关键证据

- `src/blocks/symmetric/` 全 grep 无 key/IV 长度检查（`cipher_key_from_seed` 是唯一例外，`javascript/index.ts:51-54`）
- 旧审计 full-project #26 open
- 生成器（mode_ecb/cbc/ctr_encrypt helpers）按 16 字节 AES-128 实现，无长度守卫

## 影响

用户接线错误时无引导性报错；教学场景期望即时反馈。

## 修复方向

生成器对 key/IV 输入加长度校验（生成 throw 或注释提示），或块级 validator。

## 建议动作

`cs-issue`，因为校验缺失为确定缺口，修复范围小（双生成器 helper）。
