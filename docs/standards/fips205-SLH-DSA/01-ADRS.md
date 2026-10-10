# ADRS — 地址格式（FIPS 205 §3.4）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | ADRS — 地址格式（FIPS 205 §3.4） |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §4.2，行 798–939](./00-Standard-Source.md#L798-L939)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分教学编码（不构成完整 ADRS/FIPS 205 实现） |

## 原文定位与引用

> 本页按 source 中的“ADRS — 地址格式（FIPS 205 §3.4）”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“ADRS — 地址格式（FIPS 205 §3.4）”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

SLH-DSA 用 32 字节地址（ADRS）对哈希调用做**域分隔**：同一哈希函数 H 服务所有
用途（WOTS+ 链、Merkle 节点、FORS 树……），靠 ADRS 的 type + 位置字段区分，
避免跨用途碰撞。

## 布局（32 字节，大端）

```
offset  大小  字段
0       4B    layer 地址（本层号，0..d-1）
4       12B   tree 地址（本层树索引，大端）
16      4B    type（见下表）
20      4B    key pair 地址（树内密钥对索引）
24      4B    type 相关字段 1
28      4B    type 相关字段 2
```

## type 字段（§3.4 Table 1）

| type | 含义 | word4（20..23） | word5（24..27） | word6（28..31） |
|:----:|------|----------------|----------------|----------------|
| 0 | WOTS_HASH | keypair | chain 地址 | hash 地址 |
| 1 | WOTS_PK | keypair | 0 | 0 |
| 2 | TREE | padding = 0 | tree height | tree index |
| 3 | FORS_TREE | keypair | tree height | tree index |
| 4 | FORS_ROOTS | keypair | 0 | 0 |
| 5 | WOTS_PRF | keypair | chain 地址 | hash 地址 = 0 |
| 6 | FORS_PRF | keypair | tree height = 0 | tree index |

## CipherCat 块实现（教学编码）

- `slh_addr(layer, tree, type, keypair)` → 32 字节前缀教学编码，写入四字节 layer、
  12 字节 tree、type 与 keypair；末尾 8 字节置零，不处理 type 专用字段。
- `slh_adrs_full(layer, tree, type, keypair, height, index)` → 输出 32 字节，并按上表
  写入各 type 的 word 字段；TREE(type 2) 的 word4 是零填充，不使用 keypair 输入。
  两块只接受 JavaScript 安全整数，因此无法覆盖全部 96-bit tree address；字段编码
  与标准字段布局对应，不等于完整 ADRS 范围支持或 SLH-DSA 实现。

ADRS 编码自身不实现 FIPS 205 的 PRF/F/H/Tℓ 哈希调用。回归演示：
`demos/procedures/Hash-Based-Structures.json` 检查前缀；`demos/procedures/PQC-Gaps.json`
检查部分 type 字段位置及 TREE/FORS_ROOTS 类型区分。

## 公式或伪代码

> 本条目不定义独立公式或伪代码；ADRS 的字段布局和 type 表已在上文完整列出，相关哈希算法见同目录函数条目。
