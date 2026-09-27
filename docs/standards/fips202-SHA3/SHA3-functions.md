# SHA-3 Hash Functions (§6.1)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # SHA-3 Hash Functions (§6.1) |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1149)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“# SHA-3 Hash Functions (§6.1)”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1149) 与同目录 PDF。


## 标准定义

SHA-3-224、SHA-3-256、SHA-3-384 和 SHA-3-512 都是从 `KECCAK[c]` 定义的固定输出哈希函数；容量是输出长度的两倍，消息后追加 `01` 域分离后缀。

## 公式或伪代码

```text
SHA3-224(M) = KECCAK[448]  (M || 01, 224)
SHA3-256(M) = KECCAK[512]  (M || 01, 256)
SHA3-384(M) = KECCAK[768]  (M || 01, 384)
SHA3-512(M) = KECCAK[1024] (M || 01, 512)

c = 2d
N = M || 01
KECCAK[c](N, d) = SPONGE[KECCAK-p[1600,24], pad10*1, 1600-c](N, d)
```

上面的公式完整保留 §6.1 的规范定义；`01` 是 bit suffix，实际字节编码和 `pad10*1` 按标准处理。

## 输入与输出

输入是任意 bit length 的消息 `M`；输出长度分别为 224、256、384 或 512 bit。`r+c=1600`，各变体的 `r`、`c` 和字节率见下表。

给定消息 M, 四个 SHA-3 哈希函数通过追加 2-bit 后缀并指定输出长度定义:

```
SHA3-224(M) = KECCAK[448] (M ‖ 01, 224)
SHA3-256(M) = KECCAK[512] (M ‖ 01, 256)
SHA3-384(M) = KECCAK[768] (M ‖ 01, 384)
SHA3-512(M) = KECCAK[1024](M ‖ 01, 512)
```

其中 `KECCAK[c] = SPONGE[KECCAK-p[1600,24], pad10*1, 1600−c]`。

容量 c = 2d (digest 长度的两倍), 后缀 `01` 用于域分离 (区别于 SHAKE 的 `1111`)。

### 参数

| Function | r (bits) | c (bits) | Rate Bytes | Digest |
|----------|:--------:|:--------:|:----------:|:------:|
| SHA3-224 | 1152     | 448      | 144        | 28     |
| SHA3-256 | 1088     | 512      | 136        | 32     |
| SHA3-384 | 832      | 768      | 104        | 48     |
| SHA3-512 | 576      | 1024     | 72         | 64     |

### 块实现

`hash_sha3_pad` + `hash_sha3_absorb` + `hash_sha3_squeeze`

下拉框预设 rate 1088 (SHA3-256) 和 576 (SHA3-512)。Suffix = `0x06` 对应 SHA-3 域分离后缀 `01` 的比特模式 (pad10*1 中后缀比特在首字节低位, LSB 编码)。

## 项目映射

`hash_sha3_pad`、`hash_sha3_absorb` 和 `hash_sha3_squeeze` 是项目实现入口；本页记录标准函数族，不把其中任一块等同于 FIPS 认证。

## 核验与缺项

应核对四个输出长度、空消息、多块消息、suffix/padding 编码和 FIPS 202 向量；逐字标准上下文见下方 source 摘录。
## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1149)。

```text
6.1 SHA-3 Hash Functions
Given a message M, the four SHA-3 hash functions are defined from the KECCAK[c] function
specified in Sec. 5.2 by appending a two-bit suffix to M and by specifying the length of the
output, as follows:

SHA3-224(M) = KECCAK[448] (M || 01, 224);
SHA3-256(M) = KECCAK[512] (M || 01, 256);
SHA3-384(M) = KECCAK[768] (M || 01, 384);
SHA3-512(M) = KECCAK[1024] (M || 01, 512).

In each case, the capacity is double the digest length, i.e., c = 2d, and the resulting input N
to KECCAK[c] is N = M || 01. The suffix supports domain separation from the SHA-3 XOFs.
```
