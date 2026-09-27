# Symmetric Crypto Block Reference (AES + SM4 + Modes + Padding)

## Document role and evidence entry points

This is the category detail page under the [block overview](INDEX.en.md). It records block inputs/outputs, composition, and current engineering boundaries; page length is not a capability weight.

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [FIPS 197 AES](../standards/fips197-AES/), [GB/T 32907 SM4](../standards/gbt32907-SM4/), [SP 800-38A](../standards/sp800-38a-modes/), [coverage matrix](../standards/COVERAGE.en.md) |
| Implementation | `src/blocks/symmetric/`, `src/blocks/cmac/`, `src/blocks/ccm/`, `src/blocks/gcm/`, `src/blocks/xts/`, `src/blocks/ascon/` |
| Demos and tests | [Demo guide](../guides/DEMO.en.md), [demo test registry](../../demos/tests.json), and AES/SM4/CCM/GCM/XTS/ASCON workspaces under `demos/procedures/` |
| Boundary | Atomic rounds, modes, and selected vectors do not imply every parameter set, rejection path, or production security property; use the coverage matrix for per-algorithm gaps |


## AES (FIPS 197)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `aes_sub_bytes` | 1 | value(→) | IntList→IntList | S-box substitution, 16 bytes |
| `aes_shift_rows` | 1 | value(→) | IntList→IntList | row cyclic left shift |
| `aes_mix_columns` | 1 | value(→) | IntList→IntList | GF(2⁸) mix columns |
| `aes_add_round_key` | 1 | value(→) | IntList&IntList→IntList | ⊕ round key |

## SM4 (GM/T 0002)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `sm4_round_func` | 1 | value(→) | IntList&Number→IntList | round function F |
| `sm4_linear_transform` | 1 | value(→) | IntList→IntList | L(B) linear transform |

## Block Modes (NIST SP 800-38A)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `mode_ecb_encrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB encrypt (teaching only) |
| `mode_ecb_decrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB decrypt |
| `mode_cbc_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CBC encrypt (needs IV) |
| `mode_ctr_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CTR encrypt (needs nonce) |

## Padding

| Block | Layer | Connection | Input→Output | Standard |
|----|----|------|----------|------|
| `pad_pkcs7` | 1 | value(→) | Bytes→Bytes | RFC 2315 §10.3 |
| `pad_zero` | 1 | value(→) | Bytes→Bytes | generic |

## Block MAC (NIST SP 800-38B)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `cmac_mac` | 1 | value(→) | Bytes&Bytes→Bytes | CMAC(key, msg) → 16-byte tag; CIPHER dropdown AES-128 (official vectors) / SM4 (GB/T 15852 counterpart) |
