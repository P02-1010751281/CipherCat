## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # FIPS 197 — AES 密钥扩展参考 |
| 原文证据 | [source：fips197-AES](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §5.2，行 974–1043](./00-Standard-Source.md#L974-L1043)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“# FIPS 197 — AES 密钥扩展参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

原件：[NIST.FIPS.197.pdf](./NIST.FIPS.197.pdf)，算法定义见 §5.2。AES-128/192/256 分别使用 `Nk=4/6/8` 个初始字，并执行 `Nr=10/12/14` 轮。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 递推

将密钥按 32-bit 大端字拆为 `w[0..Nk−1]`，继续生成 `w[4(Nr+1)−1]`：

```text
temp = w[i−1]
if i mod Nk = 0:
    temp = SubWord(RotWord(temp)) xor Rcon[i/Nk]
else if Nk > 6 and i mod Nk = 4:
    temp = SubWord(temp)
w[i] = w[i−Nk] xor temp
```

`Rcon[j]` 的首字节为 `x^(j−1)` 在 `GF(2^8)` 中的值，其余三个字节为零。每连续 `Nk` 个字构成一个轮密钥；加密从第 0 轮密钥开始，末轮不执行 MixColumns。

## CipherCat 映射

`aes_add_round_key` 展示状态与轮密钥异或，`aes_key_schedule`/`proc_aes_key_schedule`（如适用）负责生成轮密钥。当前 AES 单轮 Demo 使用固定状态和轮密钥作项目回归检查；该输入不是 FIPS 197 Appendix B/C 的完整 AES-128 测试向量。AES-192/256 的递推保留在本页，项目的可视化块不因此自动获得全部密钥长度覆盖。
## 原文摘录

> 本页正文是按 source 的“# FIPS 197 — AES 密钥扩展参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。
