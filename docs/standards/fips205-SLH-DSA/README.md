# FIPS 205 — 全算法索引

来源: NIST FIPS 205 — Stateless Hash-Based Digital Signature Standard
      https://csrc.nist.gov/pubs/fips/205/final      (2024-08-13)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf

> CipherCat 哈希基块族（`src/blocks/hash/hashbased.ts` + `fors.ts` + `adrs.ts` + `wots.ts`）
> 覆盖 SLH-DSA 的 WOTS+ 哈希链、Merkle 树、ADRS 地址与 FORS 少时签名结构件。
> 教学参数简化：统一 n = 32（SHAKE-256 32 字节，即标准 H 函数），非标准参数集
> （标准 n ∈ {16, 24, 32}，见下表）。

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

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | `01-ADRS.md` | 地址格式 ADRS（32B） | 结构 | ✅ |
| — | `02-WOTS.md` | WOTS+ 一次性签名 | 签名 | ✅ |
| — | `03-FORS.md` | FORS 少时签名（§8） | 签名 | ✅ |
| — | `04-SLH-DSA.md` | 完整 SLH-DSA（§9-10） | 签名 | ✅（黑盒 demo） |

### 块实现明细

| 标准部件 | 类别 | 块 |
|------|------|----|
| ADRS 地址（layer/tree/type/keypair） | 结构 | `slh_addr` |
| ADRS 完整 32B（type 0-6 + height/index） | 结构 | `slh_adrs_full` |
| WOTS+ 哈希链 c^i(x) = H^i(x) | WOTS+ | `hash_chain` |
| WOTS+ 校验和（w=16，len2 = ⌊log₂(len1·15)/4⌋+1） | WOTS+ | `wots_checksum` |
| Merkle 叶子 leaf = H(ADRS ‖ MSG) | 树 | `merkle_leaf` |
| Merkle 节点 node = H(ADRS ‖ L ‖ R) | 树 | `merkle_node` |
| 整树根（叶子拼接 + 全层组合） | 树 | `merkle_root` |
| 认证路径（叶子 + 目标 idx → 每层兄弟） | 树 | `merkle_auth_path` |
| FORS 选叶索引（M 的 4-bit 块，块 0 最高位） | FORS | `fors_leaf_index` |
| FORS 森林根 R = H(ADRS(FORS_ROOTS) ‖ roots) | FORS | `fors_root` |
| FORS.SigGen / PkFromSig / 公钥派生 | FORS（黑盒） | `fors_sign` · `fors_verify` · `fors_pk_from_sk` |

## 图例

- ✅ 已直接实现
- — 未实现或不属于封装路径
