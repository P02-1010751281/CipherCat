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

## 官方向量与实现边界

- `vectors/ACVP-SLH-DSA-sigGen-FIPS205-SHAKE-f-subset.json`：同一 ACVP 仓库 `SLH-DSA-sigGen-FIPS205` 的**子集**（仅 SHAKE 的 f 参数集、external 接口、pure 无预哈希、deterministic，各 2 例），用于后续签名路径验收；完整文件约 38 MB，不入库。
- `vectors/ACVP-SLH-DSA-keyGen-FIPS205.json`：NIST [usnistgov/ACVP-Server](https://github.com/usnistgov/ACVP-Server) `gen-val/json-files/SLH-DSA-keyGen-FIPS205/internalProjection.json` 的原始副本（ACVP 会话 SLH-DSA-keyGen，FIPS205 修订）。keyGen 的 `pk = pkSeed ‖ PK.root`，因此可直接校验 XMSS 顶层树根。
- `slh_xmss_root` 按 FIPS 205 §7.2 Algorithm 9/10 与 §11.1 的 SHAKE 变体实现（simple thash；PRF 用 ADRS type 5，叶子压缩 type 1，节点 type 2；顶层 layer = d−1、tree = 0），并用上述向量核对 SHAKE-128f/192f/256f 的 PK.root。
- `slh_msg_randomness` 实现 pure SLH-DSA 的第一步：M′ = 0x00‖|ctx|‖ctx‖M，R = SHAKE256(SK.prf‖opt_rand‖M′, n)，并按 ACVP sigGen 子集核对 R（签名串前 n 字节）。确定性签名的 opt_rand = PK.seed。
- `slh_sign` 实现 §10.2 的 SLH-DSA.Sign 端点（SHAKE 参数集、external、pure、确定性）：输出 R‖SIG_FORS‖SIG_HT，已按同一 ACVP sigGen 子集逐字节核对 SHAKE-128f/192f/256f 的完整签名串。其 ADRS 约定与 `slh_xmss_root` 一致（simple thash、PRF type 5、叶子压缩 type 1、节点 type 2；FORS 另用 type 6/3/4），FORS 索引按标准的 MSB-first 位序读取。
- 本目录的 `hash_chain` / `merkle_*` / `fors_*` / `wots_checksum` 等块是**教学级结构件**（无密钥 SHAKE256 组合），不是 FIPS 205 的带地址 `H` / `F` / `PRF` 封装；不要把两者混用成标准实现声明，也不要与 `slh_sign` 的标准路径互相拼装。尚未实现：SHA2 参数集、预哈希模式（`preHash`）与验证路径 `slh_verify`。

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 项目状态 |
|:--:|------|------|------|:--:|
| — | `01-ADRS.md` | 地址格式 ADRS（32B） | 结构 | 部分教学编码；不支持完整 96-bit tree 值 |
| — | `02-WOTS.md` | WOTS+ 一次性签名 | 签名 | 简化哈希链/校验和构件；无标准 WOTS+ 实现 |
| — | `03-FORS.md` | FORS 少时签名（§8） | 签名 | 非标准教学变体；参数及哈希/PRF 语义不兼容 |
| — | `04-SLH-DSA.md` | 完整 SLH-DSA（§9-10） | 签名 | 签名路径已实现（`slh_sign`，SHAKE 参数集，ACVP sigGen 逐字节核对）；无 SHA2/预哈希/验签 |

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

<!-- standard-body:start -->

## 标准内容

本目录对应 **FIPS 205 — 全算法索引**，按标准条款拆分为 29 个结构化条目，覆盖 「ADRS — 地址格式（FIPS 205 §3.4）」、「WOTS+ — Winternitz 一次性签名（FIPS 205 §5）」、「FORS — 少时签名（FIPS 205 §8）」、「SLH-DSA — 完整签名方案（FIPS 205 §9-10）」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [ADRS — 地址格式（FIPS 205 §3.4）](./01-ADRS.md) | ADRS — 地址格式（FIPS 205 §3.4） | 部分教学编码（不构成完整 ADRS/FIPS 205 实现） |
| [WOTS+ — Winternitz 一次性签名（FIPS 205 §5）](./02-WOTS.md) | WOTS+ — Winternitz 一次性签名（FIPS 205 §5） | 已实现（不代表完整标准覆盖） |
| [FORS — 少时签名（FIPS 205 §8）](./03-FORS.md) | FORS — 少时签名（FIPS 205 §8） | 已实现（不代表完整标准覆盖） |
| [SLH-DSA — 完整签名方案（FIPS 205 §9-10）](./04-SLH-DSA.md) | SLH-DSA — 完整签名方案（FIPS 205 §9-10） | 部分实现（不代表完整标准覆盖） |
| [Algorithm 1 — WOTS+ 校验和链数计算（FIPS 205）](./05-gen_len2.md) | FIPS 205 §3.1，Algorithm 1 `gen_len2` | 仅参考 |
| [Algorithm 2 — 大端字节串转整数（FIPS 205）](./06-toInt.md) | FIPS 205 §4.4，Algorithm 2 `toInt` | 仅参考 |
| [Algorithm 3 — 整数转大端字节串（FIPS 205）](./07-toByte.md) | FIPS 205 §4.4，Algorithm 3 `toByte` | 仅参考 |
| [Algorithm 4 — base-2^b 消息拆分（FIPS 205）](./08-base_2b.md) | FIPS 205 §4.4，Algorithm 4 `base_2b` | 部分实现 |
| [Algorithm 5 — WOTS+ 哈希链（FIPS 205）](./09-chain.md) | FIPS 205 §5，Algorithm 5 `chain` | 部分实现 |
| [Algorithm 6 — WOTS+ 公钥生成（FIPS 205）](./10-wots_pkGen.md) | FIPS 205 §5.1，Algorithm 6 `wots_pkGen` | 仅参考 |
| [Algorithm 7 — WOTS+ 签名生成（FIPS 205）](./11-wots_sign.md) | FIPS 205 §5.2，Algorithm 7 `wots_sign` | 仅参考 |
| [Algorithm 8 — 由签名恢复 WOTS+ 公钥（FIPS 205）](./12-wots_pkFromSig.md) | FIPS 205 §5.3，Algorithm 8 `wots_pkFromSig` | 仅参考 |
| [Algorithm 9 — XMSS 子树节点/根（FIPS 205）](./13-xmss_node.md) | FIPS 205 §6.1，Algorithm 9 `xmss_node` | 部分实现 |
| [Algorithm 10 — XMSS 签名生成（FIPS 205）](./14-xmss_sign.md) | FIPS 205 §6.2，Algorithm 10 `xmss_sign` | 仅参考 |
| [Algorithm 11 — 由签名恢复 XMSS 公钥（FIPS 205）](./15-xmss_pkFromSig.md) | FIPS 205 §6.3，Algorithm 11 `xmss_pkFromSig` | 仅参考 |
| [Algorithm 12 — 超树签名生成（FIPS 205）](./16-ht_sign.md) | FIPS 205 §7.1，Algorithm 12 `ht_sign` | 仅参考 |
| [Algorithm 13 — 超树签名验证（FIPS 205）](./17-ht_verify.md) | FIPS 205 §7.2，Algorithm 13 `ht_verify` | 仅参考 |
| [Algorithm 14 — FORS 私钥值生成（FIPS 205）](./18-fors_skGen.md) | FIPS 205 §8.1，Algorithm 14 `fors_skGen` | 部分实现 |
| [Algorithm 15 — FORS 子树节点/根（FIPS 205）](./19-fors_node.md) | FIPS 205 §8.2，Algorithm 15 `fors_node` | 部分实现 |
| [Algorithm 16 — FORS 签名生成（FIPS 205）](./20-fors_sign.md) | FIPS 205 §8.3，Algorithm 16 `fors_sign` | 部分实现 |
| [Algorithm 17 — 由签名恢复 FORS 公钥（FIPS 205）](./21-fors_pkFromSig.md) | FIPS 205 §8.4，Algorithm 17 `fors_pkFromSig` | 部分实现 |
| [Algorithm 18 — SLH-DSA 内部密钥生成（FIPS 205）](./22-slh_keygen_internal.md) | FIPS 205 §9.1，Algorithm 18 `slh_keygen_internal` | 仅参考 |
| [Algorithm 19 — SLH-DSA 内部签名（FIPS 205）](./23-slh_sign_internal.md) | FIPS 205 §9.2，Algorithm 19 `slh_sign_internal` | 仅参考 |
| [Algorithm 20 — SLH-DSA 内部验证（FIPS 205）](./24-slh_verify_internal.md) | FIPS 205 §9.3，Algorithm 20 `slh_verify_internal` | 仅参考 |
| [Algorithm 21 — SLH-DSA 外部密钥生成（FIPS 205）](./25-slh_keygen.md) | FIPS 205 §10.1，Algorithm 21 `slh_keygen` | 仅参考 |
| [Algorithm 22 — 纯 SLH-DSA 签名（FIPS 205）](./26-slh_sign.md) | FIPS 205 §10.2.1，Algorithm 22 `slh_sign` | 仅参考 |
| [Algorithm 23 — 预哈希 SLH-DSA 签名（FIPS 205）](./27-hash_slh_sign.md) | FIPS 205 §10.2.2，Algorithm 23 `hash_slh_sign` | 仅参考 |
| [Algorithm 24 — 纯 SLH-DSA 验证（FIPS 205）](./28-slh_verify.md) | FIPS 205 §10.3，Algorithm 24 `slh_verify` | 仅参考 |
| [Algorithm 25 — 预哈希 SLH-DSA 验证（FIPS 205）](./29-hash_slh_verify.md) | FIPS 205 §10.3，Algorithm 25 `hash_slh_verify` | 仅参考 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `hash_chain` | — | — | — |
| `merkle_leaf` | — | — | — |
| `merkle_node` | — | — | — |
| `merkle_root` | — | — | — |
| `merkle_auth_path` | — | — | — |
| `slh_addr` | — | — | — |
| `slh_adrs_full` | — | — | — |
| `wots_checksum` | — | — | — |
| `fors_sign` | — | — | — |
| `fors_verify` | — | — | — |
| `fors_pk_from_sk` | — | — | — |
| `fors_root` | — | — | — |
| `fors_leaf_index` | — | — | — |

示例工作区：`demos/procedures/Hash-Based-Structures.json`、`demos/FORS-Sign.json`、`demos/Tree-Index.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
