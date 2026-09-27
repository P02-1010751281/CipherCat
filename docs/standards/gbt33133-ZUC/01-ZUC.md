## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | GB/T 33133 — ZUC 祖冲之序列密码算法参考 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [第 1 部分 PDF 物理第 7–9 页](./GBT-33133.1-2016.pdf#page=7)（标准印刷第 3–5 页）；[提取稿 §5–§6，行 1008–1294](./00-Standard-Source.md#L1008-L1294) |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页是 ZUC 架构总览。完整 LFSR、BR、F、S0/S1、EEA3 和 EIA3 规范单元分别见 [S 盒](./02-SBox-Linear.md)、[LFSR 与 F](./03-F-and-LFSR.md)、[密钥流](./04-Keystream.md) 和 [EEA3/EIA3](./05-EEA3-EIA3.md)；source 提取稿与 PDF 保留原文证据。

## 原文摘录

> 本页按本地 GB/T 33133.1-2016、.2-2021、.3-2021 PDF 的标题、章节、算法结构和示例核对；规范公式和完整表格不在本页重复，统一由上述拆分页维护。

## 公式或伪代码

```text
Z_i = W_i xor X3_i
LFSR_with_initialization_mode(u) and LFSR_with_work_mode()
EEA3: OBS = IBS xor ZUC(CK, IV, ceil(LENGTH / 32))
EIA3: MAC = T xor k_(32*(ceil(LENGTH / 32) + 1))
```

## 来源与组成

| 部分 | 内容 | 本地原件 |
|---|---|---|
| GB/T 33133.1-2016 | ZUC 算法结构和密钥流生成 | [PDF](./GBT-33133.1-2016.pdf) |
| GB/T 33133.2-2021 | 128-EEA3 保密性算法 | [PDF](./GBT+33133.2-2021.pdf) |
| GB/T 33133.3-2021 | 128-EIA3 完整性算法 | [PDF](./GBT+33133.3-2021.pdf) |

官方检索入口：[国家标准全文公开系统](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=8C41A3AEECCA52B5C0011C8010CF0715)。

## ZUC-128 参数与结构

| 项目 | 规范值 |
|---|---|
| 密钥 `K` | 128 bit |
| 初始向量 `IV` | 128 bit |
| LFSR | 16 个 31-bit 单元，模 `2³¹−1` 运算 |
| BR | 从 LFSR 状态重组 `X0..X3` 四个 32-bit 字 |
| F | 由模加、异或、循环移位和 `S0/S1` 组成的非线性函数 |
| 输出 | 32-bit 密钥流字 `Z_i` |

ZUC 属于流密码：算法生成密钥流，再与明文逐位异或；EEA3 和 EIA3 是建立在该密钥流算法上的保密性/完整性构造，不是另一种分组密码。

## 完整规范单元

- [S0/S1 与线性变换](./02-SBox-Linear.md)
- [LFSR、密钥装入与初始化](./03-F-and-LFSR.md)
- [BR、F 与 ZUC 密钥流](./04-Keystream.md)
- [128-EEA3 与 128-EIA3](./05-EEA3-EIA3.md)

项目当前有 `zuc_keystream`、`zuc_eia3` 块，以及 EEA3/EIA3 Blockly Demo；当前 EIA3 向量范围见 [05-EEA3-EIA3](./05-EEA3-EIA3.md)。

## CipherCat 覆盖边界

| 能力 | 当前状态 |
|---|---|
| `S0/S1`、`L1/L2`、`F` 原子演示 | 已覆盖 |
| ZUC-128 密钥流 | `zuc_keystream` 与 `proc_zuc_keystream` 已覆盖 |
| 128-EEA3 | `demos/procedures/EEA3.json` 已覆盖 |
| 128-EIA3 | `zuc_eia3` 块和 GB/T 33133.3 附录 B 示例 1、2 已覆盖；认证及完整互操作性未声称 |
| ZUC-256 | 不属于本目录当前教学范围 |
| GM/T 0001.4-2024 ZUC-GXM/ZUC-MUR | 另一个 AEAD 标准，未并入本页 |

搭建指南：[中文](guides/ZUC-KeyStream-搭建指南.md) · [English](guides/ZUC-KeyStream-搭建指南.en.md)。
