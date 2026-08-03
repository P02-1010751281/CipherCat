# Post-Quantum Block Reference (ML-KEM + ML-DSA)


## FIPS 204 ML-DSA Signature

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `mldsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | ML-DSA-44 sign (FIPS 204): sk 2560B + msg → 2420B signature (deterministic, rnd=0 empty ctx); NIST ACVP 30/30 dual-language pass |
| `mldsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | ML-DSA-44 verify: pk 1312B + msg + sig → true/false |

## FIPS 203 Encoding/Compression (§4.2.1)

| Block | Layer | Connection | Input→Output | FIPS 203 |
|----|----|------|----------|----------|
| `pq_bytes_to_bits` | 1 | value(→) | Bytes→Bits | Alg 4 |
| `pq_bits_to_bytes` | 1 | value(→) | Bits→Bytes | Alg 3 |
| `pq_byte_encode` | 1 | value(→) | IntList→Bytes | Alg 5 |
| `pq_byte_decode` | 1 | value(→) | Bytes→IntList | Alg 6 |
| `pq_compress` | 1 | value(→) | IntList→Bytes | §4.2.1 |
| `pq_decompress` | 1 | value(→) | Bytes→IntList | §4.2.1 |
| `pq_byte_concat` | 1 | value(→) | Bytes&Bytes→Bytes | — |
| `pq_bytes_slice` | 1 | value(→) | Bytes→Bytes | — |
| `pq_seed_with_nonce` | 1 | value(→) | Bytes→Bytes | — |

## FIPS 203 Sampling (§4.2.2)

| Block | Layer | Connection | Input→Output | FIPS 203 |
|----|----|------|----------|----------|
| `pq_sample_ntt` | 1 | value(→) | Bytes→IntList | Alg 7 |
| `pq_sample_poly_cbd` | 1 | value(→) | Bytes→IntList | Alg 8 |

## FIPS 203 NTT Transform (§4.3)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `pq_ntt` | 1 | value(→) | IntList→IntList |
| `pq_intt` | 1 | value(→) | IntList→IntList |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt_butterfly` | 1 | value(→) | null&null&null→null |
