# Number Theory + Big Integer Block Reference

> [中文](./numtheory.md)

## Field Ops + NTT

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `nt_field_add` | 1 | value(→) | null&null&null→null |
| `nt_mod_inverse` | 1 | stmt(→→) | null&null&null→— |
| `nt_mod` | 1 | value(→) | Number&Number→Number |
| `nt_mod_pow` | 1 | value(→) | Number&Number&Number→Number |
| `nt_div_rem` | 1 | value(→) | Number&Number→Number |
| `pq_poly_add` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_sub` | 1 | value(→) | IntList&IntList→IntList |
| `pq_mat_vec_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt` | 1 | value(→) | IntList→IntList |
| `pq_intt` | 1 | value(→) | IntList→IntList |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt_butterfly` | 1 | value(→) | null&null&null→null |

## Big Integer Ops

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `bn_add` | 1 | value(→) | IntList&IntList→IntList |
| `bn_sub` | 1 | value(→) | IntList&IntList→IntList |
| `bn_mul` | 1 | value(→) | IntList&IntList→IntList |
| `bn_div` | 1 | value(→) | IntList&IntList→IntList |

## RSA Public-Key Crypto (FIPS 186-4 / RFC 8017)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `rsa_keygen` | 1 | value(→) | Number→Bytes | RSA keygen: BITS 512/1024/2048 → n‖e‖d‖p‖q fixed-width encoding (512-bit → 196 bytes); Miller-Rabin + e=65537 |
| `rsa_encrypt` | 1 | value(→) | Bytes&Bytes→Bytes | RSAES-PKCS#1 v1.5 encrypt: m^e mod n (random non-zero PS padding) |
| `rsa_decrypt` | 1 | value(→) | Bytes&Bytes→Bytes | RSAES-PKCS#1 v1.5 decrypt: m^d mod n, unpad |
| `rsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | RSASSA-PKCS#1 v1.5 sign: SHA-256 + DigestInfo, m^d mod n |
| `rsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | RSASSA-PKCS#1 v1.5 verify |

> Cross-checked against cryptography 49 both ways (encrypt/decrypt/sign/verify + key validity); RSA-1024 generated code accepted by cryptography; teaching demo uses 512-bit (not for real security).

## GF(2⁸) Field (FIPS 197)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `gf2m_mul` | 1 | value(→) | Number&Number→Number |
