# SHA-3 Hash Functions (§6.1)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §6.1 |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1149)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 工程实现覆盖 SHA3-224/256/384/512；目前为有限回归证据，不是完整官方测试集 |

## 原文定位与引用

> 本页按 source 中的“§6.1”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1149) 与同目录 PDF。


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

FIPS 202 的输入是任意 bit length 的消息 `M`；输出长度分别为 224、256、384 或 512 bit。当前 `sha3_hash` Blockly 端口为 `TYPE_BYTES`，只覆盖字节对齐输入子集，不实现任意位长消息。`r+c=1600`，各变体的 `r`、`c` 和字节率见下表。

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

高层端点为 `sha3_hash`；底层相关块为 `hash_sha3_pad_text`、`hash_sha3_pad_hex`、`sponge_pad`、`sponge_absorb`、`sponge_squeeze` 和固定实现 `keccak_f`（1600/24）。

各块参数并不相同，不能互相套用：

- `sha3_hash` 可选 SHA3-224/256/384/512；输入端口为字节数据，所以实际范围仅含字节对齐消息。
- `hash_sha3_pad_text` 和 `hash_sha3_pad_hex` 固定使用 SHA3-256 参数：rate 1088 bit（136 byte）、suffix `0x06`。
- `sponge_pad` 的 rate 下拉项为 1088、576、1152、832、1344 bit，suffix 下拉项为 `0x06`（SHA-3）和 `0x1F`（SHAKE）。FIPS 202 中的标准组合为 SHA3-224 `(1152, 0x06)`、SHA3-256 `(1088, 0x06)`、SHA3-384 `(832, 0x06)`、SHA3-512 `(576, 0x06)`、SHAKE128 `(1344, 0x1F)`、SHAKE256 `(1088, 0x1F)`；两个下拉框可独立选择，其他组合不据此声称是标准 SHA-3/XOF。
- `sponge_absorb` 只接受完整 rate 字节块，不对短尾块进行隐式零填充；调用方需先使用相应填充规则。

## 项目映射

[`sha3-block-contract.test.ts`](../../../tests/unit/sha3-block-contract.test.ts) 从真实 `sha3_hash` Blockly 块生成并执行 JavaScript/Python，核对四个输出尺寸在字节对齐的 `abc` 和各自 `rate−1` 字节输入上的固定结果，并用 Node 原生 SHA-3 实现交叉核验。`sponge_absorb` 对完整/部分 rate 块的契约由 [`sponge-absorb-contract.test.ts`](../../../tests/unit/sponge-absorb-contract.test.ts) 覆盖。上述均为有限的项目回归，不代表任意位长输入支持、完整官方向量集或 FIPS 算法验证。

## 核验与缺项

剩余测试缺口包括空消息、跨多个 rate 块的输入、更多输出/错误边界及完整 NIST 官方测试数据。项目内固定结果不能据此声称通过完整 FIPS 202 算法验证或取得产品认证；逐字标准上下文见下方 source 摘录。
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
