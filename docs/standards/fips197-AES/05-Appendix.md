# FIPS 197 — AES 标准向量
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # FIPS 197 — AES 标准向量 |
| 原文证据 | [source：fips197-AES](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿附录 A–C，行 1360–1701](./00-Standard-Source.md#L1360-L1701)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“# FIPS 197 — AES 标准向量”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。


原件：[NIST.FIPS.197.pdf](./NIST.FIPS.197.pdf)。以下向量来自 FIPS 197 Appendix B/C 的 AES-128 示例，用于快速核对字节序、密钥扩展和轮函数。

## AES-128

```text
Key       = 000102030405060708090a0b0c0d0e0f
Plaintext = 00112233445566778899aabbccddeeff
Ciphertext= 69c4e0d86a7b0430d8cdb78070b4c55a
```

标准还给出 AES-192 和 AES-256 的密钥扩展示例；其差异只在 `Nk/Nr` 和递推中的 `SubWord` 分支，不能把 AES-128 的轮密钥表直接复用。

## 复核清单

- 输入状态按列优先映射到 `4×4` 字节矩阵。
- `SubBytes` 使用 AES S 盒，`ShiftRows` 按行循环左移。
- `MixColumns` 只在前 `Nr−1` 轮执行。
- 每轮执行 `AddRoundKey`；最后一轮仍执行 AddRoundKey。
- 结果是 16 字节大端显示的密文。

这组向量只验证选定功能输入，不能替代性能、侧信道或密码模块认证测试。
## 原文摘录

> 本页正文是按 source 的“# FIPS 197 — AES 标准向量”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

## 公式或伪代码

> 本条目不定义独立公式或伪代码；它只保存 AES 标准向量。算法公式和完整步骤见同目录的算法条目。
