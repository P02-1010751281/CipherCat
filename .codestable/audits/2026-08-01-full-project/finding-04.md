---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "bug-04"
nature: bug
severity: P2
confidence: high
suggested_action: cs-issue
status: closed
closed_by: 88619d47
---

# Finding 04：keccak_f 非 1600 宽度双语言生成坏代码

## 速答

`keccak_f` 块暴露 WIDTH 下拉（800/400/200），但双生成器均无对应实现：Python 生成不存在的 `keccak_f800/400/200` 调用，JS 忽略 WIDTH 静默用 1600 置换。SHA-3 基础块对非 1600 宽度全错。

## 关键证据

- `src/blocks/hash/sha3.ts` — WIDTH 下拉暴露 800/400/200
- `src/generators/python/hash/sha3.ts` — 生成 `keccak_f${width}`，无 800/400/200 实现
- `src/generators/javascript/hash/sha3.ts` — 忽略 WIDTH 用 1600 置换，结果错误

## 影响

用户选择非 1600 宽度时：Python 生成代码直接 NameError，JS 静默算出错误结果。教学场景（SHA-3 变体）必然踩中。

## 修复方向

二选一：① 实现 800/400/200 置换（keccak-f 通用化，宽度参数化）② 下拉只留 1600 并禁用其他宽度（诚实降级）。参照 NTT 块 MODULUS 通用化先例走①。

## 建议动作

`cs-issue`。
