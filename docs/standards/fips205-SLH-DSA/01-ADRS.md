# ADRS — 地址格式（FIPS 205 §3.4）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | ADRS — 地址格式（FIPS 205 §3.4） |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §4.2，行 798–939](./00-Standard-Source.md#L798-L939)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

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
0       4B    layer 地址（本层号，0..d-1；标准仅用低 1 字节）
4       12B   tree 地址（本层树索引，大端）
16      4B    type（见下表）
20      4B    key pair 地址（树内密钥对索引）
24      4B    type 相关字段 1
28      4B    type 相关字段 2
```

## type 字段（§3.4 Table 1）

| type | 含义 | 24..31 字段 |
|:----:|------|-------------|
| 0 | WOTS_HASH | chain 地址 (4B) ‖ hash 地址 (4B) |
| 1 | WOTS_PK | 保留 (8B) |
| 2 | TREE | tree height (4B) ‖ tree index (4B) |
| 3 | FORS_TREE | tree height (4B) ‖ tree index (4B) |
| 4 | FORS_ROOTS | 保留 (8B) |
| 5 | WOTS_PRF | chain 地址 (4B) ‖ hash 地址 (4B，=0) |
| 6 | FORS_PRF | tree height (4B，=0) ‖ tree index (4B) |

## CipherCat 块实现

- `slh_addr(layer, tree, type, keypair)` → 32 字节地址：层 1B + 树 12B + type 4B
  + keypair 4B，其余零填充（教学简化版，不写 type 相关字段）。
- `slh_adrs_full(layer, tree, type, keypair, height, index)` → 完整 32B：
  与标准布局一致，type 下拉 0-6；WOTS_HASH/TREE/FORS_TREE 的 24..31 字段按
  上表写入（WOTS_HASH 用 height 为 chain、index 为 hash 位置），其余 type 补零。

哈希函数 H = SHAKE-256（32 字节输出）。演示：`demos/procedures/Hash-Based-Structures.json`
ADRS 32B 确定性 + `demos/procedures/PQC-Gaps.json` type 字段位置/域分隔（TREE vs ROOTS）。

## 公式或伪代码

> 本条目不定义独立公式或伪代码；ADRS 的字段布局和 type 表已在上文完整列出，相关哈希算法见同目录函数条目。
