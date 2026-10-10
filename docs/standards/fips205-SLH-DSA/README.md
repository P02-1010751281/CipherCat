# FIPS 205 — 全算法索引

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 205 — Stateless Hash-Based Digital Signature Standard
      https://csrc.nist.gov/pubs/fips/205/final      (2024-08-13)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf

> 仓库中的相关积木是用于讲解结构的教学/研究辅助项，不是 SLH-DSA 实现，也不应被称为覆盖该标准。
> 项目哈希拼接省略标准 `PK.seed` 与专用 `H/F/PRF/T_k` 调用；FORS 使用自定义参数和内部自洽测试。
> 下表列出的是 FIPS 205 的正式参数集，仅供参照，不表示项目支持或通过了这些参数集。

## 参数集（Table 2，仅列 SHAKE 参数集，SHA2 参数相同）

| Parameter set | pk bytes | sig bytes | n | h | d | h′ = h/d | a | k | lgw | m | security |
|---------------|:--------:|:---------:|:-:|:-:|:-:|:-------:|:-:|:-:|:---:|:-:|:--------:|
| SLH-DSA-SHAKE-128s | 32 | 7 856 | 16 | 63 | 7 | 9 | 12 | 14 | 4 | 30 | 1 |
| SLH-DSA-SHAKE-128f | 32 | 17 088 | 16 | 66 | 22 | 3 | 6 | 33 | 4 | 34 | 1 |
| SLH-DSA-SHAKE-192s | 48 | 16 224 | 24 | 63 | 7 | 9 | 14 | 17 | 4 | 39 | 3 |
| SLH-DSA-SHAKE-192f | 48 | 35 664 | 24 | 66 | 22 | 3 | 8 | 33 | 4 | 42 | 3 |
| SLH-DSA-SHAKE-256s | 64 | 29 792 | 32 | 64 | 8 | 8 | 14 | 22 | 4 | 47 | 5 |
| SLH-DSA-SHAKE-256f | 64 | 49 856 | 32 | 68 | 17 | 4 | 9 | 35 | 4 | 49 | 5 |

注：`a` = 每棵 FORS 树高度（2^a 叶），`k` = FORS 树数量，`m` = H_msg 摘要长度（字节），
`h` = 超树总高度，`d` = 超树层数（每层一棵 XMSS 子树），`h′` = 每棵子树高度，
`lgw` = 4（w = 16，WOTS+ 链长）。

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 项目状态 |
|:--:|------|------|------|:--:|
| — | `01-ADRS.md` | 地址格式 ADRS（32B） | 结构 | 部分教学编码；不支持完整 96-bit tree 值 |
| — | `02-WOTS.md` | WOTS+ 一次性签名 | 签名 | 简化哈希链/校验和构件；无标准 WOTS+ 实现 |
| — | `03-FORS.md` | FORS 少时签名（§8） | 签名 | 非标准教学变体；参数及哈希/PRF 语义不兼容 |
| — | `04-SLH-DSA.md` | 完整 SLH-DSA（§9-10） | 签名 | 未实现；无端到端标准 KAT |

### 标准算法逐项拆分

`00-Standard-Source.md` 中的 25 个独立算法现逐项对应下列条目页。条目页保留标准的
Algorithm 标题、Input/Output 和伪代码，并用 source 行号回链；“仅参考”不表示已实现。

| 算法 | 条目页 | 标准函数 |
|:--:|---|---|
| 1 | [`05-gen_len2.md`](./05-gen_len2.md) | `gen_len2` |
| 2 | [`06-toInt.md`](./06-toInt.md) | `toInt` |
| 3 | [`07-toByte.md`](./07-toByte.md) | `toByte` |
| 4 | [`08-base_2b.md`](./08-base_2b.md) | `base_2b` |
| 5 | [`09-chain.md`](./09-chain.md) | `chain` |
| 6 | [`10-wots_pkGen.md`](./10-wots_pkGen.md) | `wots_pkGen` |
| 7 | [`11-wots_sign.md`](./11-wots_sign.md) | `wots_sign` |
| 8 | [`12-wots_pkFromSig.md`](./12-wots_pkFromSig.md) | `wots_pkFromSig` |
| 9 | [`13-xmss_node.md`](./13-xmss_node.md) | `xmss_node` |
| 10 | [`14-xmss_sign.md`](./14-xmss_sign.md) | `xmss_sign` |
| 11 | [`15-xmss_pkFromSig.md`](./15-xmss_pkFromSig.md) | `xmss_pkFromSig` |
| 12 | [`16-ht_sign.md`](./16-ht_sign.md) | `ht_sign` |
| 13 | [`17-ht_verify.md`](./17-ht_verify.md) | `ht_verify` |
| 14 | [`18-fors_skGen.md`](./18-fors_skGen.md) | `fors_skGen` |
| 15 | [`19-fors_node.md`](./19-fors_node.md) | `fors_node` |
| 16 | [`20-fors_sign.md`](./20-fors_sign.md) | `fors_sign` |
| 17 | [`21-fors_pkFromSig.md`](./21-fors_pkFromSig.md) | `fors_pkFromSig` |
| 18 | [`22-slh_keygen_internal.md`](./22-slh_keygen_internal.md) | `slh_keygen_internal` |
| 19 | [`23-slh_sign_internal.md`](./23-slh_sign_internal.md) | `slh_sign_internal` |
| 20 | [`24-slh_verify_internal.md`](./24-slh_verify_internal.md) | `slh_verify_internal` |
| 21 | [`25-slh_keygen.md`](./25-slh_keygen.md) | `slh_keygen` |
| 22 | [`26-slh_sign.md`](./26-slh_sign.md) | `slh_sign` |
| 23 | [`27-hash_slh_sign.md`](./27-hash_slh_sign.md) | `hash_slh_sign` |
| 24 | [`28-slh_verify.md`](./28-slh_verify.md) | `slh_verify` |
| 25 | [`29-hash_slh_verify.md`](./29-hash_slh_verify.md) | `hash_slh_verify` |

### 块实现明细

下表是教学构件与标准概念的对应关系，不是已实现/符合的清单。当前 `FORS-Sign` Demo 仅检查确定性、内部往返和篡改拒绝；不代表标准兼容性。

| 标准部件 | 类别 | 块 |
|------|------|----|
| ADRS 前缀/部分字字段 | 教学结构 | `slh_addr` · `slh_adrs_full`（范围和完整语义受限） |
| WOTS+ 链/校验和概念 | 教学构件 | `hash_chain` · `wots_checksum`（未组合成标准 WOTS+） |
| 通用 Merkle 叶、节点、根和认证路径 | 教学结构 | `merkle_leaf` · `merkle_node` · `merkle_root` · `merkle_auth_path` |
| 固定 4-bit 分组取索引 | 教学参数 | `fors_leaf_index` |
| SHAKE 拼接森林根 | 项目变体 | `fors_root`（非 `T_k`） |
| 固定参数 FORS 签验 | 非标准教学变体 | `fors_sign` · `fors_verify` · `fors_pk_from_sk` |

`slh_adrs_full` 按 FIPS 205 的 32-byte ADRS word 边界编码：layer `[0,4)`、tree `[4,16)`、type `[16,20)`、keypair `[20,24)`、word5 `[24,28)`、word6 `[28,32)`。目前输入受 JavaScript 安全整数范围限制，不能表示完整 96-bit tree address；FORS 签验生成器也使用项目自定义 SHAKE 拼接，并非标准 PRF/F/T_k。

## 图例

- “教学结构”仅表示代码中存在可运行构件，不表示算法标准符合。
- 完整 SLH-DSA 目前未实现；官方测试向量/ACVP 完整验证状态仍是缺口。
