---
doc_type: audit-finding
id: 1
title: "Binary operation generators read single INPUT twice"
severity: P0
nature: bug
confidence: high
recommendation: cs-issue
---

## 描述

`src/generators/javascript/remaining.ts` 中的 `pq_vec_add`、`pq_vec_sub`、`sm3_hmac`、`hmac_sha256`、`kdf_pbkdf2`、`kdf_hkdf` 等生成器，对单个 `INPUT` 字段调用两次 `valueToCode(b, 'INPUT', ...)`。由于块定义中使用 `_pq()` / `_o()` 辅助函数只创建了一个 `INPUT` 输入，Blockly `valueToCode` 对同一字段取两次值返回同一个连接的块——导致两个操作数始终相等。

## 证据

**文件**: `src/generators/javascript/remaining.ts:143-148`

```javascript
// pq_vec_add — 两个操作数都读 b.'INPUT'，始终相等
javascriptGenerator.forBlock['pq_vec_add'] = function(b:Block):[string,number]{
  return ['(function(a,b,q){...})('
    +(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')
    +','+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')
    +',3329)',Order.ATOMIC];
};
// pq_vec_sub — 同样问题
javascriptGenerator.forBlock['pq_vec_sub'] = function(b:Block):[string,number]{
  return ['(function(a,b,q){...})('
    +(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')
    +','+(javascriptGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')
    +',3329)',Order.ATOMIC];
};
```

**同样模式出现在**（同一文件，Python 版本同样问题）：
- `sm3_hmac` (line 201-204)
- `hmac_sha256` (line 205-215)
- `kdf_pbkdf2` (line 218-229)
- `kdf_hkdf` (line 230-241)
- `pq_ntt_vec`, `pq_intt_vec`, `pq_cbd_ntt_vec`, `pq_mat_vec_mul_ntt`

**Python 版本**: `src/generators/python/remaining.ts` — 完全相同的模式。

## 影响

用户在工作区连接两个不同的块到这些操作的输入时，生成的代码中两个参数实际使用同一个值——计算结果静默错误。对密码学运算（HMAC、KDF、向量运算），这意味着密钥派生结果错误、MAC 验证结果错误。

## 修复方向

块定义需添加第二个输入字段（如 `INPUT_A` / `INPUT_B`），或为二元操作创建独立块定义而非复用单输入 `_pq()` 辅助函数。
