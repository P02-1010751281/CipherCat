# 后量子密码（哈希基教学构件）

哈希链、Merkle 树与 FORS 的教学组合；这些是结构构件，不是 FIPS 205 的兼容实现。

## 本页覆盖的工作区

| 工作区 | 文件 |
|---|---|
| `Hash-Based-Structures` | `demos/procedures/Hash-Based-Structures.json` |
| `Tree-Index` | `demos/procedures/Tree-Index.json` |
| `FORS-Sign` | `demos/procedures/FORS-Sign.json` |

### Hash-Based-Structures

- 证据类别：代数或结构性质
- 依据：hash chain 边界与半群性、4 叶树根手工组合、ADRS 32B 确定性
- 核对入口：`msg = bytes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])`
- 期望结果：`HASH_BASED_OK`

#### 拼装步骤

**函数 `Chain(msg: bytes, n: int)` 的返回值**

- `hash_chain`（反复应用项目 SHAKE-256 摘要；无 FIPS 205 `F(PK.seed, ADRS, ·)` 与链地址更新）
  - `INPUT` ←
    - 变量 `msg`
  - `ITERATIONS` ←
    - 变量 `n`

**该函数用到的算法块**：`hash_chain`

**函数 `MLeaf(msg: bytes, adrs: bytes)` 的返回值**

- `merkle_leaf`（通用教学叶子 `SHAKE256(ADRS‖MSG, 32)`，非 XMSS/FORS 标准叶生成）
  - `MSG` ←
    - 变量 `msg`
  - `ADRS` ←
    - 变量 `adrs`

**该函数用到的算法块**：`merkle_leaf`

**函数 `MNode(l: bytes, r: bytes, adrs: bytes)` 的返回值**

- `merkle_node`（通用教学节点 `SHAKE256(ADRS‖L‖R, 32)`，非标准 `H/T_l` 调用）
  - `LEFT` ←
    - 变量 `l`
  - `RIGHT` ←
    - 变量 `r`
  - `ADRS` ←
    - 变量 `adrs`

**该函数用到的算法块**：`merkle_node`

**函数 `MRoot(leaves: bytes, leafLen: int, adrs: bytes)` 的返回值**

- `merkle_root`（通用叶序列的教学 Merkle 根，非 FIPS 205 树算法）
  - `LEAVES` ←
    - 变量 `leaves`
  - `LEAF_LEN` ←
    - 变量 `leafLen`
  - `ADRS` ←
    - 变量 `adrs`

**该函数用到的算法块**：`merkle_root`

**函数 `Addr(layer: int, tree: int, leaf: int)` 的返回值**

- `slh_addr`（ADRS 前缀教学编码：layer/tree/leaf 加 type 下拉，末尾 8 字节清零；不是完整地址语义）：TYPE=0
  - `LAYER` ←
    - 变量 `layer`
  - `TREE` ←
    - 变量 `tree`
  - `LEAF` ←
    - 变量 `leaf`

**该函数用到的算法块**：`slh_addr`

### Tree-Index

- 证据类别：代数或结构性质
- 依据：FORS 选叶分块、leaf+auth 重建根与全树根一致（idx ∈ {0,1,3,5,7}）
- 核对入口：`m = bytes([0x3C, 0xA5])`
- 期望结果：`TREE_IDX_OK`

#### 拼装步骤

**函数 `FLI(m: bytes, i: int)` 的返回值**

- `fors_leaf_index`
  - `M` ←
    - 变量 `m`
  - `I` ←
    - 变量 `i`

**该函数用到的算法块**：`fors_leaf_index`

**函数 `AP(leaves: bytes, leaf_len: int, adrs: bytes, idx: int)` 的返回值**

- `merkle_auth_path`（认证路径：每层取目标 idx 的兄弟拼接——Merkle 证明核心）
  - `LEAVES` ←
    - 变量 `leaves`
  - `LEAF_LEN` ←
    - 变量 `leaf_len`
  - `ADRS` ←
    - 变量 `adrs`
  - `INDEX` ←
    - 变量 `idx`

**该函数用到的算法块**：`merkle_auth_path`

**函数 `MR(leaves: bytes, leaf_len: int, adrs: bytes)` 的返回值**

- `merkle_root`（通用叶序列的教学 Merkle 根，非 FIPS 205 树算法）
  - `LEAVES` ←
    - 变量 `leaves`
  - `LEAF_LEN` ←
    - 变量 `leaf_len`
  - `ADRS` ←
    - 变量 `adrs`

**该函数用到的算法块**：`merkle_root`

**函数 `MN(l: bytes, r: bytes, adrs: bytes)` 的返回值**

- `merkle_node`（通用教学节点 `SHAKE256(ADRS‖L‖R, 32)`，非标准 `H/T_l` 调用）
  - `LEFT` ←
    - 变量 `l`
  - `RIGHT` ←
    - 变量 `r`
  - `ADRS` ←
    - 变量 `adrs`

**该函数用到的算法块**：`merkle_node`

**函数 `Addr(layer: int, tree: int, leaf: int)` 的返回值**

- `slh_addr`（ADRS 前缀教学编码：layer/tree/leaf 加 type 下拉，末尾 8 字节清零；不是完整地址语义）：TYPE=0
  - `LAYER` ←
    - 变量 `layer`
  - `TREE` ←
    - 变量 `tree`
  - `LEAF` ←
    - 变量 `leaf`

**该函数用到的算法块**：`slh_addr`

### FORS-Sign

- 证据类别：代数或结构性质
- 依据：项目内部往返、确定性、篡改检测；非 FIPS 205 KAT 或符合性证据
- 核对入口：`sk = bytes(range(32))`
- 期望结果：`FORS_OK`

#### 拼装步骤

**函数 `FORS_Sign(sk_seed: bytes, m: bytes)` 的返回值**

- `fors_sign`（固定教学参数 `n=32,k=4,a=4`；640B 项目签名，不兼容 FIPS 205 参数/编码）
  - `SK_SEED` ←
    - 变量 `sk_seed`
  - `MESSAGE` ←
    - 变量 `m`

**该函数用到的算法块**：`fors_sign`

**函数 `FORS_PkFromSk(sk_seed: bytes)` 的返回值**

- `fors_pk_from_sk`（项目教学变体的公钥派生）
  - `SK_SEED` ←
    - 变量 `sk_seed`

**该函数用到的算法块**：`fors_pk_from_sk`

**函数 `FORS_Verify(pk: bytes, m: bytes, sig: bytes)` 的返回值**

- `fors_verify`（项目签名内部重建根并比较；仅自洽验证）
  - `PUBLIC_KEY` ←
    - 变量 `pk`
  - `MESSAGE` ←
    - 变量 `m`
  - `SIGNATURE` ←
    - 变量 `sig`

**该函数用到的算法块**：`fors_verify`

