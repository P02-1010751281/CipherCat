---
doc_type: audit-finding
id: 7
title: "sponge_duplex generator ignores PERM field"
severity: P1
nature: bug
confidence: high
recommendation: cs-issue
---

## 描述

`src/generators/javascript/remaining.ts:96-117` 和 Python 对应版本中的 `sponge_duplex` 生成器，从块读取 `PERM` 下拉字段值（用户选择 Keccak-f[200] / Keccak-f[400] / Keccak-f[800] / Keccak-f[1600]），但生成的代码中**未使用该值**——始终硬编码使用单一置换函数。

## 影响

用户通过下拉菜单选择不同置换函数后，生成的代码行为不变——与用户意图不符。Sponge Duplex 在不同置换宽度下的安全属性差异巨大（如 200-bit 置换的安全强度远低于 1600-bit）。

## 修复方向

在生成代码中根据 `PERM` 字段值选择对应的置换函数调用。
