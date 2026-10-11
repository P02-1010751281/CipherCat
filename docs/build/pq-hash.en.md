# Post-quantum cryptography (hash-based teaching components)

Teaching compositions of hash chains, Merkle trees, and FORS; these are structural components, not FIPS 205-compatible implementations.

## Workspaces on this page

| Workspace | File |
|---|---|
| `Hash-Based-Structures` | `demos/procedures/Hash-Based-Structures.json` |
| `Tree-Index` | `demos/procedures/Tree-Index.json` |
| `FORS-Sign` | `demos/procedures/FORS-Sign.json` |

### Hash-Based-Structures

- Evidence class: algebraic or structural properties
- Basis: hash chain 边界与半群性、4 叶树根手工组合、ADRS 32B 确定性（source text in Chinese）
- Check: `msg = bytes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])`
- Expected result: `HASH_BASED_OK`

#### Assembly steps

**Return value of `Chain(msg: bytes, n: int)`**

- `hash_chain` (Repeated project SHAKE-256 digest; no FIPS 205 `F(PK.seed, ADRS, ·)` or…)
  - `INPUT` ←
    - variable `msg`
  - `ITERATIONS` ←
    - variable `n`

**Algorithm blocks used by this function**: `hash_chain`

**Return value of `MLeaf(msg: bytes, adrs: bytes)`**

- `merkle_leaf` (Generic teaching leaf `SHAKE256(ADRS‖MSG, 32)`, not XMSS/FORS leaf gene…)
  - `MSG` ←
    - variable `msg`
  - `ADRS` ←
    - variable `adrs`

**Algorithm blocks used by this function**: `merkle_leaf`

**Return value of `MNode(l: bytes, r: bytes, adrs: bytes)`**

- `merkle_node` (Generic teaching node `SHAKE256(ADRS‖L‖R, 32)`, not the standard `H/T_l…)
  - `LEFT` ←
    - variable `l`
  - `RIGHT` ←
    - variable `r`
  - `ADRS` ←
    - variable `adrs`

**Algorithm blocks used by this function**: `merkle_node`

**Return value of `MRoot(leaves: bytes, leafLen: int, adrs: bytes)`**

- `merkle_root` (Teaching Merkle root over a leaf sequence, not a FIPS 205 tree algorithm)
  - `LEAVES` ←
    - variable `leaves`
  - `LEAF_LEN` ←
    - variable `leafLen`
  - `ADRS` ←
    - variable `adrs`

**Algorithm blocks used by this function**: `merkle_root`

**Return value of `Addr(layer: int, tree: int, leaf: int)`**

- `slh_addr` (ADRS-prefix teaching encoding: layer/tree/leaf plus a type dropdown, fi…): TYPE=0
  - `LAYER` ←
    - variable `layer`
  - `TREE` ←
    - variable `tree`
  - `LEAF` ←
    - variable `leaf`

**Algorithm blocks used by this function**: `slh_addr`

### Tree-Index

- Evidence class: algebraic or structural properties
- Basis: FORS 选叶分块、leaf+auth 重建根与全树根一致（idx ∈ {0,1,3,5,7}）（source text in Chinese）
- Check: `m = bytes([0x3C, 0xA5])`
- Expected result: `TREE_IDX_OK`

#### Assembly steps

**Return value of `FLI(m: bytes, i: int)`**

- `fors_leaf_index`
  - `M` ←
    - variable `m`
  - `I` ←
    - variable `i`

**Algorithm blocks used by this function**: `fors_leaf_index`

**Return value of `AP(leaves: bytes, leaf_len: int, adrs: bytes, idx: int)`**

- `merkle_auth_path` (auth path: sibling of target idx concatenated per level — Merkle proof …)
  - `LEAVES` ←
    - variable `leaves`
  - `LEAF_LEN` ←
    - variable `leaf_len`
  - `ADRS` ←
    - variable `adrs`
  - `INDEX` ←
    - variable `idx`

**Algorithm blocks used by this function**: `merkle_auth_path`

**Return value of `MR(leaves: bytes, leaf_len: int, adrs: bytes)`**

- `merkle_root` (Teaching Merkle root over a leaf sequence, not a FIPS 205 tree algorithm)
  - `LEAVES` ←
    - variable `leaves`
  - `LEAF_LEN` ←
    - variable `leaf_len`
  - `ADRS` ←
    - variable `adrs`

**Algorithm blocks used by this function**: `merkle_root`

**Return value of `MN(l: bytes, r: bytes, adrs: bytes)`**

- `merkle_node` (Generic teaching node `SHAKE256(ADRS‖L‖R, 32)`, not the standard `H/T_l…)
  - `LEFT` ←
    - variable `l`
  - `RIGHT` ←
    - variable `r`
  - `ADRS` ←
    - variable `adrs`

**Algorithm blocks used by this function**: `merkle_node`

**Return value of `Addr(layer: int, tree: int, leaf: int)`**

- `slh_addr` (ADRS-prefix teaching encoding: layer/tree/leaf plus a type dropdown, fi…): TYPE=0
  - `LAYER` ←
    - variable `layer`
  - `TREE` ←
    - variable `tree`
  - `LEAF` ←
    - variable `leaf`

**Algorithm blocks used by this function**: `slh_addr`

### FORS-Sign

- Evidence class: algebraic or structural properties
- Basis: 项目内部往返、确定性、篡改检测；非 FIPS 205 KAT 或符合性证据（source text in Chinese）
- Check: `sk = bytes(range(32))`
- Expected result: `FORS_OK`

#### Assembly steps

**Return value of `FORS_Sign(sk_seed: bytes, m: bytes)`**

- `fors_sign` (Fixed teaching parameters `n=32,k=4,a=4`; 640-byte project signature, n…)
  - `SK_SEED` ←
    - variable `sk_seed`
  - `MESSAGE` ←
    - variable `m`

**Algorithm blocks used by this function**: `fors_sign`

**Return value of `FORS_PkFromSk(sk_seed: bytes)`**

- `fors_pk_from_sk` (Public-key derivation for the project teaching variant)
  - `SK_SEED` ←
    - variable `sk_seed`

**Algorithm blocks used by this function**: `fors_pk_from_sk`

**Return value of `FORS_Verify(pk: bytes, m: bytes, sig: bytes)`**

- `fors_verify` (Rebuilds and compares the project root; internal-consistency check only)
  - `PUBLIC_KEY` ←
    - variable `pk`
  - `MESSAGE` ←
    - variable `m`
  - `SIGNATURE` ←
    - variable `sig`

**Algorithm blocks used by this function**: `fors_verify`

