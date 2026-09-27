# ZUC — S 盒与线性变换原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语族 / S 盒与线性变换 |
| 标准定位 | GB/T 33133.1-2016 §5.4、附录 A |
| 原文证据 | [ZUC 原文提取](./00-Standard-Source.md) · [第 1 部分 PDF](./GBT-33133.1-2016.pdf) |
| 原文位置 | [PDF 物理第 8 页](./GBT-33133.1-2016.pdf#page=8)（标准印刷第 4 页）和[物理第 10–11 页](./GBT-33133.1-2016.pdf#page=10)（标准印刷第 6–7 页）；[提取稿 L1141–L1185](./00-Standard-Source.md#L1141-L1185)、[L1303–L1408](./00-Standard-Source.md#L1303-L1408) |
| 项目状态 | `S0`、`S1`、`L1`、`L2` 原子块已实现 |

## 原文摘录

GB/T 33133.1-2016 §5.4 定义 `F` 使用的 32-bit S 盒 `S`、线性变换 `L1` 和 `L2`。本页保留附录 A 的完整 S0/S1 表；空白和数学排版按 PDF 视觉页规范化。

```text
S = (S0, S1, S2, S3),  S2 = S0,  S3 = S1
X = x0 || x1 || x2 || x3
Y = y0 || y1 || y2 || y3
yi = Si(xi), i = 0, 1, 2, 3
```

每个 8-bit 输入 `x` 写成两个十六进制数 `x = h || l`；输出取对应 S 盒第 `h` 行、第 `l` 列。

## 原文定位与引用

完整 S0/S1 表和线性变换来自 GB/T 33133.1-2016 附录 A；对应原文行号见上方“原文证据”和“原文位置”。

## 公式或伪代码

### S0（完整表）

```text
      0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
0     3E 72 5B 47 CA E0 00 33 04 D1 54 98 09 B9 6D CB
1     7B 1B F9 32 AF 9D 6A A5 B8 2D FC 1D 08 53 03 90
2     4D 4E 84 99 E4 CE D9 91 DD B6 85 48 8B 29 6E AC
3     CD C1 F8 1E 73 43 69 C6 B5 BD FD 39 63 20 D4 38
4     76 7D B2 A7 CF ED 57 C5 F3 2C BB 14 21 06 55 9B
5     E3 EF 5E 31 4F 7F 5A A4 0D 82 51 49 5F BA 58 1C
6     4A 16 D5 17 A8 92 24 1F 8C FF D8 AE 2E 01 D3 AD
7     3B 4B DA 46 EB C9 DE 9A 8F 87 D7 3A 80 6F 2F C8
8     B1 B4 37 F7 0A 22 13 28 7C CC 3C 89 C7 C3 96 56
9     07 BF 7E F0 0B 2B 97 52 35 41 79 61 A6 4C 10 FE
A     BC 26 95 88 8A B0 A3 FB C0 18 94 F2 E1 E5 E9 5D
B     D0 DC 11 66 64 5C EC 59 42 75 12 F5 74 9C AA 23
C     0E 86 AB BE 2A 02 E7 67 E6 44 A2 6C C2 93 9F F1
D     F6 FA 36 D2 50 68 9E 62 71 15 3D D6 40 C4 E2 0F
E     8E 83 77 6B 25 05 3F 0C 30 EA 70 B7 A1 E8 A9 65
F     8D 27 1A DB 81 B3 A0 F4 45 7A 19 DF EE 78 34 60
```

### S1（完整表）

```text
      0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
0     55 C2 63 71 3B C8 47 86 9F 3C DA 5B 29 AA FD 77
1     8C C5 94 0C A6 1A 13 00 E3 A8 16 72 40 F9 F8 42
2     44 26 68 96 81 D9 45 3E 10 76 C6 A7 8B 39 43 E1
3     3A B5 56 2A C0 6D B3 05 22 66 BF DC 0B FA 62 48
4     DD 20 11 06 36 C9 C1 CF F6 27 52 BB 69 F5 D4 87
5     7F 84 4C D2 9C 57 A4 BC 4F 9A DF FE D6 8D 7A EB
6     2B 53 D8 5C A1 14 17 FB 23 D5 7D 30 67 73 08 09
7     EE B7 70 3F 61 B2 19 8E 4E E5 4B 93 8F 5D DB A9
8     AD F1 AE 2E CB 0D FC F4 2D 46 6E 1D 97 E8 D1 E9
9     4D 37 A5 75 5E 83 9E AB 82 9D B9 1C E0 CD 49 89
A     01 B6 BD 58 24 A2 5F 38 78 99 15 90 50 B8 95 E4
B     D0 91 C7 CE ED 0F B4 6F A0 CC F0 02 4A 79 C3 DE
C     A3 EF EA 51 E6 6B 18 EC 1B 2C 80 F7 74 E7 FF 21
D     5A 6A 54 1E 41 31 92 35 C4 33 07 0A BA 7E 0E 34
E     88 B1 98 7C F3 3D 60 6C 7B CA D3 1F 32 65 04 28
F     64 BE 85 9B 2F 59 8A D7 B0 25 AC AF 12 03 E2 F2
```

### 32-bit S 盒与线性变换

```text
S(X) = S0(X[31:24]) || S1(X[23:16])
       || S0(X[15:8]) || S1(X[7:0])

L1(X) = X xor rotl32(X, 2) xor rotl32(X, 10)
          xor rotl32(X, 18) xor rotl32(X, 24)
L2(X) = X xor rotl32(X, 8) xor rotl32(X, 14)
          xor rotl32(X, 22) xor rotl32(X, 30)
```

循环移位和异或均在 32-bit 字宽内完成。`F` 的完整调用见 [F、LFSR 与初始化](./03-F-and-LFSR.md)。

## 项目映射

对应块为 `zuc_s0`、`zuc_s1`、`zuc_l1`、`zuc_l2`。验证时应至少覆盖 S0/S1 边界查表、`L1/L2` 固定输入输出和 F 中间值。
