---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "maintainability-04"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: open
---

# Finding 17：remaining.ts 13 个块未收录 ALL_BLOCK_TYPES（旧 #10 未关）

## 速答

`src/blocks/remaining.ts` 直接注册 13 个块（nt_mod/bn_*/hash_hmac/base64/hex/endian 等），无 BLOCK_TYPES 导出；`ALL_BLOCK_TYPES` 只聚合 12 个模块——13 块游离于类型联合之外，任何依赖它的覆盖率/文档/一致性工具都会漏报。

## 关键证据

- `src/blocks/remaining.ts:13-54` — `Blockly.Blocks['nt_mod','nt_mod_pow','nt_div_rem','bn_add','bn_sub','bn_mul','bn_div','hash_hmac','base64_encode','base64_decode','hex_to_bytes','bytes_to_hex','endian_swap']` 直接注册
- `src/blocks/index.ts:37-50` — `ALL_BLOCK_TYPES` 不含 remaining（:13 仅副作用 import）；`AllBlockType` 联合（:52-64）同样缺
- 旧审计 full-project #10 open

## 影响

TS 类型安全缺口；历次审计需人工补查这些块（本次 finding-02 的 hash_hmac 即在此批）。

## 修复方向

remaining.ts 导出 `BLOCK_TYPES` 并入 `ALL_BLOCK_TYPES` 与 `AllBlockType` 联合。

## 建议动作

`cs-refactor`，因为是类型联合补全。
