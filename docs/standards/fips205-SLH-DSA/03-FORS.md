# FORS — 少时签名（FIPS 205 §8）

FORS（Forest Of Random Subsets）是 SLH-DSA 的"少时"签名部件：一棵密钥对可安全
签约 `2^a` 次以内，恰好匹配 SLH-DSA 单密钥对签名上限（2^64 消息下的内部随机化）。

## 结构

- `k` 棵 FORS 树，每棵 `2^a` 个叶子（叶 = 私钥元素 `sk[i][j] = PRF(PK.seed, SK.seed, ADRS(FORS_PRF, kp, 0, j))`，类型 FORS_PRF）
- 消息摘要 M = `H_msg` 输出（k·a 位），按 a-bit 分块，**块 0 为最高位**，每块
  指定一棵树的叶子索引
- 签名 = k 个 (叶私钥值 + 认证路径)，共 k·(1+a)·n 字节（不含根压缩值；FORS_ROOTS 压缩仅在 pkFromSig 内部用于派生 FORS 公钥）

## 算法

### FORS.SigGen（Algorithm 16，§8.3；Algorithm 14 = fors_skGen，§8.1）

```
对 i in 0..k−1:
    idx[i] ← 消息摘要的第 i 个 a-bit 块
    sig_sk[i] ← SK.seed 派生第 i 棵树叶子 idx[i] 的私钥值
    sig_auth[i] ← 第 i 棵树 idx[i] 到根的认证路径（每层兄弟节点）
FORS 签名 ← (sig_sk[0..k−1], sig_auth[0..k−1])
```

### FORS.pkFromSig（Algorithm 17，§8.4；Algorithm 15 = fors_node，§8.2）

验证侧：由 (签名, 消息摘要, PK.seed, ADRS) 重建每棵树的根
`root[i] = H(ADRS(FORS_TREE, kp, h, idx) ‖ l ‖ r)` 逐层组合，再压缩：
`pk_FORS = H(ADRS(FORS_ROOTS) ‖ root[0] ‖ ⋯ ‖ root[k−1])`。

### FORS 公钥派生（FORS.SKgen → pk）

由 `SK.seed` 生成全部 k·2^a 个叶子 → 逐树建树 → 根压缩：
`pk = H(ADRS(FORS_ROOTS) ‖ roots)`。

## CipherCat 块实现

教学参数（固定，非标准参数集）：**n = 32、k = 4、a = 4**（每树 16 叶），
消息摘要 M = 16 bit（2 字节），按 4-bit 分块（块 0 最高位）选叶。签名 640 字节
= 4 树 × (32B 叶私钥 + 4×32B 认证路径)（k·(1+a)·n，不含根压缩值）。

> 教学简化（与标准差异）：叶私钥派生用 `H(sk_seed, ADRS(FORS_TREE, kp, 0, j))`
> 代替标准 `PRF(PK.seed, SK.seed, ADRS(FORS_PRF, kp, 0, j))`（教学参数集无 PK.seed）；
> 认证路径重建节点用 `H(ADRS(FORS_TREE, kp, h, idx) ‖ l ‖ r)` 与标准 fors_node 一致。

- `fors_sign(sk_seed, m)` → 640B 签名（FORS.SigGen 语义）
- `fors_verify(sig, m, pk)` → Boolean（PkFromSig 语义：重建根压缩 vs pk 比对）
- `fors_pk_from_sk(sk_seed)` → 32B 公钥（4 树根 → H(ADRS(FORS_ROOTS)‖roots)）
- `fors_leaf_index(m, i)` → 消息 M 第 i 个 4-bit 块（块 0 最高位）→ 叶子索引 0..15
- `fors_root(roots)` → FORS 森林根 R = H(ADRS(FORS_ROOTS) ‖ roots)

验证：性质向量（确定性 / 往返 / 篡改检测）——FORS 无独立官方向量
（FIPS 205 KAT 是完整 SLH-DSA 签名）。Demos：`FORS-Sign.json`（往返/确定性/
篡改/640B/32B）、`Tree-Index.json`（选叶分块 + 认证路径重建根 == 全树根）。
教程：docs/demos/post-quantum.md 场景 10（FORS 少时签名）。
