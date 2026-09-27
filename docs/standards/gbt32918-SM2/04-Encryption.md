## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | SM2 — 公钥加密原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §6.1，行 8621–8657](./00-Standard-Source.md#L8621-L8657)；流程图行 8660–8674；PDF 第 3 页 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“SM2 — 公钥加密原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页对应标准 §6.1。完整 A1–A8 步骤在 [提取稿行 8621–8657](./00-Standard-Source.md#L8621-L8657)，流程图在 [行 8660–8674](./00-Standard-Source.md#L8660-L8674)；中文 PDF 文字层的上下标/字形需以 PDF 第 3 页复核。

原件：[GB/T 32918.4-2016 PDF](./GBT-32918.4-2016.pdf)。以下保留标准 A1–A8 的完整步骤；仅恢复了文字层丢失的空格、下标和连接符。

```text
Input: message M with bit length klen; receiver public key PB.
A1. Generate random k in [1, n-1].
A2. Compute C1 = [k]G = (x1, y1), and encode C1 as a bit string.
A3. Compute S = [h]PB. If S is the point at infinity, report an error and stop.
A4. Compute [k]PB = (x2, y2), and encode x2 and y2 as bit strings.
A5. Compute t = KDF(x2 || y2, klen). If t is all zero bits, return to A1.
A6. Compute C2 = M xor t.
A7. Compute C3 = Hash(x2 || M || y2).
A8. Output ciphertext C = C1 || C3 || C2.
```

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 算法阶段

对接收方公钥 `PB` 和明文 `M`：

```text
C1 = [k]G
(x2,y2) = [k]PB
t  = KDF(x2 || y2, klen)
C2 = M xor t
C3 = SM3(x2 || M || y2)
```

当 `t` 全为零时必须重新选择 `k`。项目示例采用 `C1 || C3 || C2` 编码。

## CipherCat 映射

- `sm2_encrypt`：输入明文、公钥坐标和确定性 `k`，输出 `C1||C3||C2` 十六进制。
- `sm2_decrypt`：恢复明文并验证 `C3`；标签不一致时拒绝输出。

Demo：`demos/procedures/SM2-Encrypt.json`。当前页不把该示例扩大为完整证书、随机数或生产密钥管理实现。
