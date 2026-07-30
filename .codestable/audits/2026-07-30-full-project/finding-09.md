---
doc_type: audit-finding
id: 9
title: "cipher_key_from_seed generator has no bounds check"
severity: P1
nature: bug
confidence: medium
recommendation: cs-issue
---

## 描述

`src/generators/javascript/index.ts` 和 Python 对应版本中的 `cipher_key_from_seed` 生成器，从 seed 派生密钥时未对派生出的数据做长度校验。若 seed 输入异常（过短、过长、空），生成的密钥可能不符合目标算法的密钥长度要求（AES 128/192/256-bit，SM4 128-bit）。

## 影响

无效密钥进入加密流程后，运行时行为不可预测——可能被 Web Crypto API 拒绝，也可能在软实现中产生错误密文。

## 修复方向

在生成代码中添加密钥长度断言或截断/填充逻辑，并在块定义中添加 seed 输入的长度验证。
