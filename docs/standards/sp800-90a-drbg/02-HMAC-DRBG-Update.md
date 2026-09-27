## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | DRBG — HMAC_DRBG Update 原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [HMAC_DRBG §10.1.2.2，提取稿行 2396–2433](./00-Standard-Source.md#L2396-L2433)；PDF 第 44 页 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“DRBG — HMAC_DRBG Update 原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页对应标准 §10.1.2.2 的完整 Update 原语；原始提取稿范围为 [行 2396–2433](./00-Standard-Source.md#L2396-L2433)，公式字形应以 PDF 第 44 页复核。

原件：[NIST SP 800-90A PDF](./NIST.SP.800-90A.pdf)。项目当前实现的是 HMAC-SHA-256 子集，不是 CTR_DRBG。以下为完整 Update 步骤的可读化转录。

```text
Input: provided_data (possibly empty); current state K, V.
1. K = HMAC(K, V || 0x00 || provided_data).
2. V = HMAC(K, V).
3. If provided_data is not empty:
     K = HMAC(K, V || 0x01 || provided_data).
     V = HMAC(K, V).
4. Return the updated K and V.
```

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 状态

`K` 与 `V` 均为 32 字节，初始为：

```text
K = 00…00
V = 01…01
```

Update(`provided_data`) 的核心步骤为：

```text
K = HMAC(K, V || 00 || provided_data); V = HMAC(K, V)
K = HMAC(K, V || 01 || provided_data); V = HMAC(K, V)
```

实例化把 entropy、nonce、personalization 拼入 Update；重播种和 additional input 需要分别遵守标准流程。

## CipherCat 边界

Update 由 `drbg_generate` 内部完成，没有独立状态块；当前代码路径不应标注为 Hash_DRBG 或 CTR_DRBG。
