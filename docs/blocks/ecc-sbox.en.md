# ECC + S-Box Block Reference

> [中文](./ecc-sbox.md)

## Elliptic Curves (SEC 2)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `ecc_load_curve_params` | 1 | stmt(→→) | —→— |
| `ecc_load_point` | 1 | stmt(→→) | null→— |
| `ecc_point_double` | 1 | stmt(→→) | null&null→— |
| `ecc_add` | 1 | stmt(→→) | null&null&null→— |
| `ecc_multiply` | 1 | stmt(→→) | null&null→— |

## Montgomery Curves (RFC 7748)

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
