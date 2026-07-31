---
doc_type: issue-fix
issue: 2026-07-31-procedure-template-prefill
status: confirmed
path: standard
fix_date: 2026-07-31
related: [procedure-template-prefill-analysis.md]
tags: [procedure, template, prefill, hmac-sm3, decrypt, persistence]
---

# 模板预填机制缺陷（3 类）修复记录

## 1. 根因摘要

三类独立成因（analysis 确认）：
1. `TEMPLATE_PREFILL` 条目错误：`crypto_decrypt_func` 复制 encrypt 未改（`blocks.ts:644-647`）
2. `hash_hmac` 块无算法选择能力 + 双生成器未实现 HMAC-SM3（`remaining.ts:23-29`、JS/PY 生成器）
3. 预填防重标记 `__prefilled` 仅内存态，未随序列化持久化（`blocks.ts:814-821`）

## 2. 实际采用方案

**方案 A**（owner 批准，按三个切片实现）：
- **切片 1（decrypt）**：新增 `mode_ecb_decrypt` 原子块（块定义 + MODE_BLOCK_TYPES + JS/PY 生成器 + AES 解密 helper：逆 S-box/逆行移位/逆列混合 + 逆序轮密钥）；`crypto_decrypt_func` 预填改指 `mode_ecb_decrypt`
- **切片 2（hmac）**：`hash_hmac` 块加 `HASH` 下拉（SHA-256/SM3）；JS/PY 生成器实现完整纯语言 HMAC-SM3（SM3 填充+64 轮压缩+HMAC 构造）；`TEMPLATE_PREFILL` 新增 `chainFields` 机制（链块字段覆盖），`proc_sm3_hmac` 条目声明 `{hash_hmac: {HASH: 'SM3'}}`
- **切片 3（持久化）**：模板块加 `saveExtraState`/`loadExtraState` 持久化 `prefilled` 标记；onchange 增加注入防御（RETURN/BODY 已有内容则跳过，兼容旧损坏工作区）

## 3. 改动文件清单

| 文件 | 改动 |
|---|---|
| `src/blocks/symmetric/modes/blocks.ts` | +`mode_ecb_decrypt` 块定义 + MODE_BLOCK_TYPES |
| `src/generators/javascript/symmetric/modes/helpers.ts` | +`aesDecryptBlock`/`registerAesEcbDecrypt`（逆变换实现） |
| `src/generators/python/symmetric/modes/helpers.ts` | +`aes_decrypt_block`/`aes_ecb_decrypt` |
| `src/generators/javascript/symmetric/modes/blocks.ts` | +`forBlock['mode_ecb_decrypt']` |
| `src/generators/python/symmetric/modes/blocks.ts` | +`forBlock['mode_ecb_decrypt']` |
| `src/blocks/remaining.ts` | `hash_hmac` +HASH 下拉（SHA-256/SM3） |
| `src/generators/javascript/remaining.ts` | `hash_hmac` SM3 分支（纯 JS `sm3Hash`+`sm3Hmac`） |
| `src/generators/python/remaining.ts` | `hash_hmac` SM3 分支（纯 Python `sm3_hash`+`sm3_hmac`）；移除冗余 eslint-disable |
| `src/blocks/procedure/blocks.ts` | `TemplatePrefill.chainFields` + `buildReturnChain` 字段覆盖 + `crypto_decrypt_func` 条目修正 + `proc_sm3_hmac` chainFields + 模板块 save/loadExtraState + 注入防御 |
| `src/generators/javascript/symmetric/modes/helpers.ts` | 既有 encrypt + 新增 decrypt：MixColumns 读写改为**列布局** `s[4*c..4*c+3]`（review-fix，修复非标准 AES） |
| `src/generators/python/symmetric/modes/helpers.ts` | 同上 + 密钥扩展 rcon 改用 RCON 表 `[0x01..0x1b,0x36]`（review-fix，消除 SBOX 越界 IndexError） |

## 4. 验证结果

- `vue-tsc --noEmit` ✅ 0 errors；`eslint` ✅ 0 errors 0 warnings；`vite build` ✅
- **Chromium 实测**（拖拽注入 + 双语言生成 + 导入闭环）：
  - 🔓 解密模板注入链根 = `mode_ecb_decrypt`（DOM 显示 "return ECB-Decrypt(, key:)"）；JS 生成 `aesEcbDecrypt`、Python 生成 `aes_ecb_decrypt` ✅
  - HMAC_SM3 模板注入 `hash_hmac` 且 HASH 下拉 = SM3（DOM "HMAC(,msg:) SM3 ▾"）；JS 生成 `sm3Hmac`、Python 生成 `sm3_hmac`（纯语言实现，无 hashlib 'sm3'）✅
  - 导出 JSON 含 `extraState: {prefilled: true}`；**清空后导入**：恰好 2 个顶层块、每条链仅一份、HASH=SM3 保留——无重复注入 ✅
- **AES 标准向量验证**（review-fix 后，逐字提取生成代码执行）：
  - JS：`enc(00112233…ff)` = `69c4e0d86a7b0430d8cdb78070b4c55a` 精确匹配 FIPS-197 C.1；dec round-trip ✓；dec 标准向量 ✓
  - Python：同向量 enc/dec 精确匹配；SP 800-38A 第二组向量（2b7e1516… ↔ 3ad77bb4…）双向通过 ✓；无 IndexError（RCON 表修复后）✓

> review-fix 说明：独立 reviewer 首轮发现 2 个 blocking——(1) MixColumns 对状态行而非列混合（既有 encrypt 与新增 decrypt 同源，密文非标准）；(2) Python rcon 溢出 256/512 → SBOX 越界。均已在 JS/Python enc/dec 四处修复（列布局读写 + RCON 表），经官方向量验证后复审通过（0🔴 0🟡 0🔵）。既有 `mode_*_encrypt` 块输出随之从"非标准 AES"修正为标准 AES——属同根因正确性修复。

## 5. 遗留事项

1. 顺手发现（不在本次范围，finding-14 跟踪）：生成器 TEMPLATE_TYPES 幻影条目 `crypto_func_def`（JS/PY 各一处）+ 模板清单三处手工复制漂移——需单一数据源重构
2. `proc_hmac_sha256` 语义保持 SHA-256（HASH 默认值），未验证回归（默认分支代码未变，lint/tsc 通过）
