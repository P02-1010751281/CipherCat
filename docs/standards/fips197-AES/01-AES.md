## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # FIPS 197 — AES 算法参考 |
| 原文证据 | [source：fips197-AES](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §5，行 705–1043](./00-Standard-Source.md#L705-L1043)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“# FIPS 197 — AES 算法参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

> **来源版本**：NIST FIPS 197，2001-11-26 发布，2023-05-09 编辑性更新（Update 1）。
> 本页是按标准条款核对后的结构化参考，不是 PDF 文本层的逐字转录。逐字原文见
> [NIST.FIPS.197.pdf](./NIST.FIPS.197.pdf)；实现边界见 [README.md](./README.md)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 1. 参数与状态表示

AES 对 128-bit 数据块进行变换，密钥长度决定轮数：

| 实例 | 密钥长度 | `Nk`（32-bit 字） | `Nr`（轮数） |
|---|---:|---:|---:|
| AES-128 | 128 bit | 4 | 10 |
| AES-192 | 192 bit | 6 | 12 |
| AES-256 | 256 bit | 8 | 14 |

输入字节 `in[0..15]` 按列装入 4×4 状态数组：

```text
s[r,c]    = in[r + 4c]       0 ≤ r,c < 4
out[r+4c] = s[r,c]
```

状态中的每个字节属于 `GF(2^8)`，不可约多项式为
`x^8 + x^4 + x^3 + x + 1`（`0x11B`）。加法是按位异或；乘法按该多项式约减。

### 4. 加密与解密流程

加密 `CIPHER(in, Nr, w)`：

1. 将输入装入状态并执行一次 `AddRoundKey`；
2. 对 `round = 1..Nr-1` 依次执行 `SubBytes`、`ShiftRows`、`MixColumns`、`AddRoundKey`；
3. 最后一轮执行 `SubBytes`、`ShiftRows`、`AddRoundKey`，**不执行 `MixColumns`**；
4. 按状态映射导出 16 字节密文。

解密 `INVCIPHER` 以逆序执行 `InvShiftRows`、`InvSubBytes`、`AddRoundKey`、
`InvMixColumns`，首末轮按标准顺序处理。`AddRoundKey` 自身是逆变换。

### 2. 轮变换

### 2.1 SubBytes

对每个状态字节独立应用 `SBOX`：非零字节先取 `GF(2^8)` 乘法逆元，零字节的逆元定义为零；再应用仿射变换：

```text
b'[i] = b⁻¹[i] xor b⁻¹[(i+4) mod 8] xor b⁻¹[(i+5) mod 8]
        xor b⁻¹[(i+6) mod 8] xor b⁻¹[(i+7) mod 8] xor c[i]
```

其中 `c = 0x63`。逆变换使用 `INVSBOX`。完整查表见 [01-SubBytes.md](./01-SubBytes.md)。

### 2.2 ShiftRows

第 `r` 行循环左移 `r` 个字节：

```text
s'[r,c] = s[r,(c+r) mod 4]
```

第一行不移动；逆变换将第 `r` 行右移 `r` 个字节。详见 [02-ShiftRows.md](./02-ShiftRows.md)。

### 2.3 MixColumns

每一列与固定矩阵相乘：

```text
[s'0,c]   [02 03 01 01] [s0,c]
[s'1,c] = [01 02 03 01] [s1,c]   over GF(2^8)
[s'2,c]   [01 01 02 03] [s2,c]
[s'3,c]   [03 01 01 02] [s3,c]
```

逆变换使用矩阵行 `[0e 0b 0d 09]`、`[09 0e 0b 0d]`、
`[0d 09 0e 0b]`、`[0b 0d 09 0e]`。详见
[03-MixColumns-AddRoundKey.md](./03-MixColumns-AddRoundKey.md)。

### 2.4 AddRoundKey

轮密钥由四个扩展字组成，并按列与状态异或：

```text
[s'0,c,s'1,c,s'2,c,s'3,c] = [s0,c,s1,c,s2,c,s3,c]
                             xor w[4*round+c]
```

### 3. 密钥扩展

扩展密钥产生 `4 × (Nr + 1)` 个 32-bit 字。初始 `Nk` 个字直接来自密钥；其余字按下列规则递推：

```text
temp = w[i-1]
if i mod Nk == 0:
    temp = SUBWORD(ROTWORD(temp)) xor Rcon[i/Nk]
elif Nk > 6 and i mod Nk == 4:
    temp = SUBWORD(temp)
w[i] = w[i-Nk] xor temp
```

`Rcon[j]` 的首字节依次为 `01, 02, 04, 08, 10, 20, 40, 80, 1B, 36`。
AES-256 额外使用 `i mod Nk == 4` 的 `SUBWORD` 分支。详见
[04-KeyExpansion.md](./04-KeyExpansion.md)。

## 5. 标准示例向量

FIPS 197 Appendix B 的 AES-128 示例：

```text
Key:    000102030405060708090a0b0c0d0e0f
Input:  00112233445566778899aabbccddeeff
Output: 69c4e0d86a7b0430d8cdb78070b4c55a
```

该向量用于 CipherCat 的 AES 结构/生成器回归；通过选定向量不等于认证或侧信道验证。
## 原文摘录

> 本页正文是按 source 的“# FIPS 197 — AES 算法参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。
