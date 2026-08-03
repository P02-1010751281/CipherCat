# ECC + S-Box Block Reference


## Elliptic Curves (SEC 2)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `ecc_load_curve_params` | 1 | stmt(→→) | —→— |
| `ecc_load_point` | 1 | stmt(→→) | null→— |
| `ecc_point_double` | 1 | stmt(→→) | null&null→— |
| `ecc_add` | 1 | stmt(→→) | null&null&null→— |
| `ecc_multiply` | 1 | stmt(→→) | null&null→— |

## Digital Signatures (EdDSA / ECDSA / SM2 / SM9)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `eddsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | Ed25519 sign (RFC 8032): sk 32B + msg → 64B signature; official vectors TEST 1/2/3 |
| `eddsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | Ed25519 verify: pk 32B + msg + sig → true/false |
| `ecdsa_sign` | 1 | value(→) | Bytes&String→Bytes | ECDSA P-256 deterministic sign (RFC 6979): sk 32B + msg → r‖s 64B |
| `ecdsa_verify` | 1 | value(→) | String&Bytes&Bytes→Boolean | ECDSA verify: msg + pk 65B + r‖s → true/false |
| `sm2_sign` | 1 | value(→) | String&String&Bytes&String→Bytes | SM2 sign (GB/T 32918.2): da + id + msg + k → r‖s 64B; empty k = random |
| `sm2_verify` | 1 | value(→) | String&String&Bytes&String&String→Boolean | SM2 verify: pax/pay + id + msg + r + s → true/false |
| `sm9_master_key` | 1 | value(→) | Bytes→Bytes | SM9 signature master public key (GB/T 38635.2): ks → Ppub 128B (G2) |
| `sm9_user_key` | 1 | value(→) | Bytes&Bytes&Number→Bytes | SM9 user signing key: ks + id + hid → ds 64B (G1) |
| `sm9_sign` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes→Bytes | SM9 sign: msg + ds + Ppub + r → h‖S 97B |
| `sm9_verify` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Bytes&Number→Boolean | SM9 verify: msg + id + h + S + Ppub + hid → true/false |

## Montgomery Curves (RFC 7748)

## Protocol Wrappers (ECDH / SM2 encryption)

| Block | Layer | Connection | Input→Output | Notes |
|-------|------|-----------|--------------|-------|
| `ecdh_shared_secret` | 1 | value(→) | String&String&String→String | P-256 ECDH shared secret (RFC 5903 §8.1 vector + cryptography cross-check): d + Qx + Qy → shared point x-coordinate 32B hex; d auto-mod-n |
| `sm2_encrypt` | 1 | value(→) | Bytes&String&String&String→String | SM2 encryption (GB/T 32918.4): msg + pubkey x/y + k → C1‖C3‖C2 hex (C1=04‖x‖y 65B, C3=SM3(x2‖M‖y2) 32B); official vector Annex A example 2 |
| `sm2_decrypt` | 1 | value(→) | String&String→Bytes | SM2 decryption: C1‖C3‖C2 + d → plaintext; throws on C3 mismatch |

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `x25519` | 1 | value(→) | IntList&IntList→Bytes | X25519(k, u) → 32-byte shared secret; k auto-clamped, u bit-255 cleared; Montgomery ladder p=2^255-19; official vectors (RFC 7748 §5.2 V1/V2) |

## S-Box (generic)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `sbox` | 1 | value(→) | —→SBox |
| `sbox_sub` | 1 | stmt(→→) | null&SBox&null→— |
| `sbox_variables_get` | 1 | value(→) | —→SBox |
| `sbox_variables_set` | 1 | stmt(→→) | SBox→— |

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
