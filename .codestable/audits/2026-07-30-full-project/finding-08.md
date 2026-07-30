---
doc_type: audit-finding
id: 8
title: "data_convert_bits_to_bytes produces single integer"
severity: P1
nature: bug
confidence: high
recommendation: cs-issue
---

## 描述

`src/generators/javascript/data/convert.ts` 和 Python 对应版本中的 `data_convert_bits_to_bytes` 生成器，将位列表转换为字节时输出单个整数而非字节数组。Blockly 类型标注为输出 `Bytes`（`Uint8Array`），实际产出 `number`——与类型系统不一致，下游连接此输出的块接收到错误类型。

## 影响

类型不匹配导致下游块运行时报错或静默错误。`Bytes` → `IntList` → 后续处理链断裂。

## 修复方向

修复生成器使其返回 `Uint8Array`（JS）/ `bytes`（Python），匹配 `TYPE_BYTES` 类型标注。
