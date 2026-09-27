## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | CMAC — 子密钥生成原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §6.1，行 568–598](./00-Standard-Source.md#L568-L598)；PDF 第 7 页 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“CMAC — 子密钥生成原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页对应标准 §6.1。可读化的完整步骤单元见下方；原始提取稿中的对应范围是 [§6.1，行 568–598](./00-Standard-Source.md#L568-L598)，公式字形与排版应以 PDF 第 7 页复核。

原件：[NIST SP 800-38B PDF](./NIST.SP.800-38B.pdf)。以下为保留完整步骤的可读化转录；仅统一了空格、下标和位串记法，不把项目摘要冒充逐字 PDF 文本。

```text
Prerequisites:
  block cipher CIPH with block size b;
  key K.
Output:
  subkeys K1, K2.
Suggested notation: SUBK(K).

1. Let L = CIPH_K(0^b).
2. If MSB_1(L) = 0, let K1 = L << 1;
   otherwise let K1 = (L << 1) xor Rb.
3. If MSB_1(K1) = 0, let K2 = K1 << 1;
   otherwise let K2 = (K1 << 1) xor Rb.
4. Return K1, K2.
```

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 计算

对 128-bit 分组密码先计算：

```text
L  = E_K(0^128)
K1 = dbl(L)
K2 = dbl(K1)
```

`dbl` 在 `GF(2^128)` 中乘以 `x`；当最高位进位时，使用 `Rb=0x87` 约减。CMAC 的字节序和约减规则不能与 XTS tweak 加倍混用。

## CipherCat 映射

`cmac_mac` 内部完成子密钥生成，没有独立 `cmac_subkey` 块；CIPHER 下拉支持 AES-128 和 SM4。
