# WOTS+ — Winternitz 一次性签名（FIPS 205 §5）

WOTS+ 是 SLH-DSA 的底层一次性签名：把消息拆成 base-w 数字，每个数字对应一条
哈希链，签名 = 各链上取一步。仅能安全签一条消息（复用即泄露私钥），故 SLH-DSA
用超树（hypertree）把 WOTS+ 公钥逐层压缩到一棵根。

## 参数（FIPS 205 全部参数集 lgw = 4）

- `w = 2^lgw = 16`：每条哈希链长度（链上 w 个节点）
- `len1 = ⌈8n/lgw⌉ = 2n`：消息分块数（每个 4-bit 块一个链）
- `len2 = ⌊log₂(len1·(w−1))/lgw⌋ + 1 = 3`：校验和分块数（lgw=4 时固定 3）
- `len = len1 + len2 = 2n + 3`：链总数，即私钥/公钥/签名元素个数

## 算法

### chain（Algorithm 5）：哈希链

```
chain(X, i, s, PK.seed, ADRS):
    tmp ← X
    for j from i to i+s−1:
        ADRS.setHashAddress(j)
        tmp ← F(PK.seed, ADRS, tmp)
    return tmp
```

即对输入迭代应用 F 共 s 次，每次用 ADRS 中的 hash 地址（= 当前链位置）做域分隔。
F = SHAKE-256（32B 输出）。链从位置 0 到 w−1，共 w 个节点；位置 w−1 是公钥值。

### base_2b（Algorithm 4）：消息拆块

消息（8n 位）按 lgw = 4 位一组拆为 len1 个 base-w 数字，**高 4 位块在前**。

### 校验和（§5.2）

```
csum = Σ_{i=1}^{len1} (w − 1 − msg[i])
csum 拆为 len2 = 3 个 base-w 数字（MSB 在前）
```

校验和保证"消息增 ⇒ 校验和减"——WOTS+ 防签名的存在性伪造（消息的链值不能
被重用于另一个消息）。

### wots_pkGen / wots_sign / wots_pkFromSig

- 私钥元素 `sk[i] = PRF(PK.seed, SK.seed, ADRS(WOTS_PRF, kp, i))`
- 签名：`sig[i] = chain(sk[i], 0, msg[i])`（消息数字 + 校验和数字各走一条链）
- 公钥：所有链终点 `chain(sk[i], 0, w−1)` 再压缩 `pk = Tℓ(ADRS(WOTS_PK, kp))`

## CipherCat 块实现

- `hash_chain(input, iters)`：WOTS+ 链式哈希 c^i(x) = H^i(x)（SHAKE-256 32B），
  迭代 ITERATIONS 次。
- `wots_checksum(M)` → 校验和 4-bit 块数组（IntList，MSB 在前）：
  消息按 4-bit 分块（每字节高半字节先），len1 = 2·len(M)，csum = Σ(w−1−块值)，
  编码为 len2 个 4-bit 块。

性质向量（`demos/procedures/PQC-Gaps.json`）：全 0 消息 csum=[3,12] / 全 F 消息
csum=[0,0] / 单调性（防伪造）。
