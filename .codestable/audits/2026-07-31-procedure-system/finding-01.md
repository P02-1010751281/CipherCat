---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "bug-01"
nature: bug
severity: P1
confidence: high
suggested_action: cs-issue
status: closed
closed_by: 2026-07-31-procedure-template-prefill
---

# Finding 01：crypto_decrypt_func 模板预填的是 ECB-Encrypt 链

## 速答

拖出 🔓 解密模板（`crypto_decrypt_func`）注入的函数体是 AES-ECB **加密**链，与 `crypto_encrypt_func` 一字不差——用户按模板生成的"解密函数"执行的是加密。

## 关键证据

- `src/blocks/procedure/blocks.ts:644-647` — `TEMPLATE_PREFILL['crypto_decrypt_func'] = { returnChain: ['variables_get','mode_ecb_encrypt'], paramVarName:'ciphertext' }`，与 `crypto_encrypt_func`（:641-643）完全相同
- `src/blocks/procedure/blocks.ts:827` — 该模板标签为 `CRYPTO_PROCEDURES_DECRYPT_LABEL`（'🔓 解密'）
- 模板注册表纯手工维护，复制粘贴未改链

## 影响

教学核心场景：用户创建解密函数得到加密语义的代码，静默生成错误算法。模板类用户（教学主线）必然踩中。

## 修复方向

`crypto_decrypt_func` 预填应指向 AES-ECB 解密路径（需新增 `mode_ecb_decrypt` 原子块或改为 `mode_cbc_decrypt` 等带解密的模式块）。

## 建议动作

`cs-issue`，因为这是确定触发的语义错误 bug，修复需同时补解密原子块与模板链。
