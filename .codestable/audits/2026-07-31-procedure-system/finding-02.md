---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "bug-02"
nature: bug
severity: P1
confidence: high
suggested_action: cs-issue
status: closed
closed_by: 2026-07-31-procedure-template-prefill
---

# Finding 02：proc_sm3_hmac 模板静默生成 HMAC-SHA256（HMAC-SM3 不可生成）

## 速答

`proc_sm3_hmac` 模板包 `hash_hmac` 块，但 `hash_hmac` 块无 HASH 字段，JS 生成器硬编码 WebCrypto HMAC-SHA-256——国密 MAC 模板生成的是 SHA-256 的 HMAC。

## 关键证据

- `src/blocks/procedure/blocks.ts:664-667` — `proc_sm3_hmac` 预填链 `['variables_get','hash_hmac', ...]`
- `src/generators/javascript/remaining.ts:53-63` — `hash_hmac` 生成器硬编码 `crypto.subtle` HMAC-SHA-256，块上无 HASH 下拉
- `src/generators/python/remaining.ts:35-36` — 读不存在的 `HASH` 字段回退 `sha256`
- 旧审计 blockly-coverage #3（sm3_hmac 存根）为 partial：存根块删了，替换路径不产生 SM3-HMAC

## 影响

国密 HMAC 教学与使用不可达；模板语义与生成代码不符，用户无感知（无报错）。

## 修复方向

给 `hash_hmac` 块加 HASH 下拉（SM3/SHA-256）并双生成器实现 HMAC-SM3（或新增专用 sm3-hmac 原子块），模板链同步。

## 建议动作

`cs-issue`，因为确定触发的算法语义错误，涉及块定义 + 双生成器。
