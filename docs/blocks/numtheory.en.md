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

## GF(2⁸) Field (FIPS 197)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `gf2m_mul` | 1 | value(→) | Number&Number→Number |
