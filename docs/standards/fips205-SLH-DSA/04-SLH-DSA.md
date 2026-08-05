# SLH-DSA — 完整签名方案（FIPS 205 §9-10）

SLH-DSA 用 **超树（hypertree）** 把海量一次性密钥对压缩进一棵根：
d 层 XMSS 子树，第 0 层叶子是 WOTS+ 公钥，上层叶子是下层子树的根；
FORS 一次性密钥对挂在最底层。签名 = FORS 签名 + 每层的 WOTS+ 签名与认证路径。

## 数据格式

- 私钥（4n）：`SK.seed (n) ‖ SK.prf (n) ‖ PK.seed (n) ‖ PK.root (n)`
  （FIPS 205 私钥含公钥两部分，使签名可随机化）
- 公钥（2n）：`PK.seed ‖ PK.root`
- 签名：`R (n) ‖ FORS 签名 ‖ HT 签名`
  - `R = PRF_msg(SK.prf, opt_rand, M)` 的随机化值（Algorithm 19 L3）
  - 消息摘要 `md = H_msg(R, PK.seed, PK.root, M)`（m 字节，Algorithm 19 L5）
  - HT 签名 = d 层 × (WOTS+ 签名 `len·n` + XMSS 认证路径 `h′·n`)

## 算法

### KeyGen（内部 Algorithm 18 §9.1 / 外部 slh_keygen Algorithm 21 §10.1）

随机 SK.seed、SK.prf、PK.seed（各 n 字节）；计算第 d−1 层树的根 = PK.root。

### Sign（内部 Algorithm 19 §9.2 / 外部 slh_sign Algorithm 22）

```
ADRS.setLayerAddress(0); ADRS.setTreeAddress(0)
R ← PRF_msg(SK.prf, opt_rand, M)                 # 随机化值，n 字节
md ← H_msg(R, PK.seed, PK.root, M)               # 消息摘要，m 字节
digest ← md[0 : ⌈k·a/8⌉]                          # FORS 选叶
FORS 签名 ← FORS.SigGen(SK.seed, digest, ADRS(FORS_TREE))
HT 签名 ← 对 d 层 XMSS 子树逐层签名（每层 WOTS+ 密钥对由 SK.seed 派生）
返回 (R, FORS 签名, HT 签名)
```

### Verify（内部 Algorithm 20 §9.3 / 外部 slh_verify Algorithm 24）

由 (R, FORS 签名) 重建 FORS 根 → 作为第 0 层 WOTS+ 消息 → 逐层验证认证路径
→ 最终根与 PK.root 比对。**与签名侧计算路径完全对称**（可验证性来自 Merkle 树
结构的确定性重建）。

## CipherCat 覆盖

- **结构件原子块**（可拼装教学）：`hash_chain` · `wots_checksum` · `merkle_leaf`
  · `merkle_node` · `merkle_root` · `merkle_auth_path` · `slh_addr` · `slh_adrs_full`
  · `fors_leaf_index` · `fors_root`——覆盖 WOTS+ 链、校验和、Merkle 树与认证路径、
  ADRS 域分隔、FORS 选叶/根压缩。
- **FORS 黑盒**：`fors_sign` / `fors_verify` / `fors_pk_from_sk`（完整 §8 语义）。
- **未覆盖**：完整 SLH-DSA KeyGen/Sign/Verify（超树 d 层编排 + H_msg 摘要）——
  目前无完整 SLH-DSA 签名 demo；FORS 部件以性质向量验证（FORS 无独立 KAT）。

教学简化：块族统一 n = 32（SHAKE-256），非标准参数集；标准参数见 README 参数表。
