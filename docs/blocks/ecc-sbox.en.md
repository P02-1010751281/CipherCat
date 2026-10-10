# ECC + S-Box Block Reference

## Document role and evidence entry points

This is the classical public-key and elliptic-curve detail page under the [block overview](INDEX.en.md). RSA number-theoretic components are documented in the [number-theory block reference](numtheory.en.md), while post-quantum public-key schemes are documented in the [post-quantum block reference](post-quantum.en.md).

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [FIPS 186-5 ECDSA](../standards/fips186-5-ecdsa/), [RFC 5903 ECDH](../standards/rfc5903-ecdh/), [RFC 7748 X25519](../standards/rfc7748-x25519/), [RFC 8032 EdDSA](../standards/rfc8032-eddsa/), [GB/T 32918 SM2](../standards/gbt32918-SM2/), [GB/T 38635 SM9](../standards/gbt38635-SM9/), [coverage matrix](../standards/COVERAGE.en.md) |
| Implementation | the corresponding blocks in the toolbox and their code generators |
| Example workspaces | [Demo guide](../guides/DEMO.en.md), and ECDH/ECDSA/EdDSA/X25519/SM2/SM9 workspaces |
| Boundary | Claims apply only to the curves, encodings, and protocol chains listed here; a passing demo does not imply general public-key security, side-channel security, or certification |


## Elliptic Curves (SEC 2)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `ecc_load_curve_params` | 1 | stmt(→→) | —→— |
| `ecc_load_point` | 1 | stmt(→→) | null→— |
| `ecc_point_double` | 1 | stmt(→→) | null&null→— |
| `ecc_add` | 1 | stmt(→→) | null&null&null→— |
| `ecc_multiply` | 1 | stmt(→→) | null&null→— |

These blocks implement only short-Weierstrass arithmetic over a prime field. `ecc_load_curve_params` takes coefficients `a`, `b`, and modulus `p` for `y² ≡ x³ + ax + b (mod p)`. The caller must provide a prime `p > 3` and `0 ≤ a,b < p`. Generated code checks the ranges and the non-singularity condition `4a³ + 27b² ≠ 0 (mod p)`, but **does not verify that `p` is prime**. Finite-point coordinates `x` and `y` must be own properties (JavaScript) or keys in a built-in `dict` (Python), lie in `[0,p)`, and satisfy the curve equation; Python `dict` subclasses are not accepted. The point at infinity is represented by the boolean marker `infinity: true`. These blocks do not take or validate a base point `G`, order `n`, point order, or subgroup membership. They are not a complete SEC 2 parameter validator or a production-grade ECC implementation.

## Digital Signatures (EdDSA / ECDSA / SM2 / SM9)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `eddsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | Ed25519 sign (RFC 8032): sk 32B + msg → 64B signature; official vectors TEST 1/2/3 |
| `eddsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | Ed25519 verify: pk 32B + msg + sig → true/false |
| `ecdsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | ECDSA P-256 deterministic sign (RFC 6979): sk 32B + msg → r‖s 64B |
| `ecdsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | ECDSA verify: msg + pk 65B + r‖s → true/false |
| `sm2_sign` | 1 | value(→) | String&String&Bytes&String→Bytes | SM2 sign (GB/T 32918.2): da + id + msg + k → r‖s 64B; empty k = random |
| `sm2_verify` | 1 | value(→) | String&String&String&Bytes&String&String→Boolean | SM2 verify: pax/pay + id + msg + r + s → true/false |
| `sm9_master_key` | 1 | value(→) | Bytes→Bytes | SM9 signature master public key (GB/T 38635.2): ks → Ppub 128B (G2) |
| `sm9_user_key` | 1 | value(→) | Bytes&Bytes→Bytes | SM9 user signing key: ks + id, with hid as a dropdown → ds 64B (G1) |
| `sm9_sign` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes→Bytes | SM9 sign: msg + ds + Ppub + r → h‖S 97B |
| `sm9_verify` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Bytes→Boolean | SM9 verify: msg + id + h + S + Ppub, with hid as a dropdown → true/false |

## Montgomery Curves (RFC 7748)

## Protocol Wrappers (ECDH / SM2 encryption)

| Block | Layer | Connection | Input→Output | Notes |
|-------|------|-----------|--------------|-------|
| `ecdh_shared_secret` | 1 | value(→) | String&String&String→String | P-256 ECDH shared secret (RFC 5903 §8.1, both directions, with an independent recomputation): d + Qx + Qy → shared point x-coordinate 32B hex; d auto-mod-n |
| `sm2_encrypt` | 1 | value(→) | Bytes&String&String&String→String | SM2 encryption (GB/T 32918.4): msg + pubkey x/y + k → C1‖C3‖C2 hex (C1=04‖x‖y 65B, C3=SM3(x2‖M‖y2) 32B); official vector Annex A example 2 |
| `sm2_decrypt` | 1 | value(→) | String&String→Bytes | SM2 decryption: C1‖C3‖C2 + d → plaintext; throws on C3 mismatch |
| `sm2_key_exchange` | 1 | value(→) | String×8&Number→String | GB/T 32918.3-2016 §6.1 responder B steps B1–B7 plus KDF; excludes B8/B9 key confirmation and the initiator flow |

The inputs are `dB, rB, Pax, Pay, RA, RB, ZA, ZB` as hexadecimal strings, followed by output bit length `wlen`. The implementation is limited to responder B; examples and targeted tests do not establish the initiator flow, key confirmation, or full protocol validation.

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `x25519` | 1 | value(→) | IntList&IntList→Bytes | X25519(k, u) → 32-byte result; each input contains 32 byte values in 0..255; k is clamped and u bit 255 is cleared; RFC 7748 §5.2 vectors |

Low-order X25519 `u` inputs can produce an all-zero output. RFC 7748 §6.1 allows a protocol to check for an all-zero shared secret without leaking additional information and abort; this block implements only scalar multiplication, not a protocol check or key derivation. The current JavaScript/Python Montgomery ladder uses branches dependent on private scalar bits and high-level integer arithmetic, so it has no constant-time guarantee. It is for teaching and regression testing, not for protecting production private keys.

## S-Box (generic)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `sbox` | 1 | value(→) | —→SBox |
| `sbox_sub` | 1 | stmt(→→) | null&SBox&null→— |
| `sbox_variables_get` | 1 | value(→) | —→SBox |
| `sbox_variables_set` | 1 | stmt(→→) | SBox→— |

`bit_byte_substitute` accepts a byte index from `0..255`. `sbox_sub` splits an unsigned integer in `0..2^32−1` in big-endian order and uses the first 256 entries of the flattened table. Entries must be integer byte values (`0..255`); both substitution blocks validate the required input and table values at runtime. Tests generate and execute JavaScript/Python from real Blockly workspaces and compare all entries in the AES, SM4, ZUC S0, and ZUC S1 presets with their normative source tables. They also verify both-language `sbox_sub` results for every byte index in the AES and SM4 tables, alongside AES one-/two-dimensional output and invalid-input/table boundaries. These tests verify table mappings and block contracts, not complete algorithms or formal certification.

## Control Flow

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `ctrl_iterate` | 1 | stmt(→→) | —→— |

## Function Wrapping

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `crypto_return` | 1 | stmt(→→) | null→— |
| `procedures_defreturn` | 1 | stmt(→→) | —→— |
| `crypto_encrypt_func` | 2 | stmt(→→) | —→— |
| `crypto_decrypt_func` | 2 | stmt(→→) | —→— |
| `crypto_hash_func` | 2 | stmt(→→) | —→— |

`crypto_encrypt_func`, `crypto_decrypt_func`, and `crypto_hash_func` are editable composition starters, not complete algorithms for production use or standards-conformance claims. The default encryption/decryption templates only prefill an ECB composition and do not provide a key; the default hash template prefills only SHA-256 padding, not the full compression/iteration process. Users must complete the parameters and algorithm flow, then validate the result.
