# 后量子密码块参考 (ML-KEM)

## FIPS 203 编码/压缩 (§4.2.1)

| 块 | 层 | 连接 | 输入→输出 | FIPS 203 |
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

## FIPS 203 采样 (§4.2.2)

| 块 | 层 | 连接 | 输入→输出 | FIPS 203 |
|----|----|------|----------|----------|
| `pq_sample_ntt` | 1 | value(→) | Bytes→IntList | Alg 7 |
| `pq_sample_poly_cbd` | 1 | value(→) | Bytes→IntList | Alg 8 |

## FIPS 203 NTT 变换 (§4.3)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `pq_ntt` | 1 | value(→) | IntList→IntList |
| `pq_intt` | 1 | value(→) | IntList→IntList |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt_butterfly` | 1 | value(→) | null&null&null→null |

## 后量子便利层 (M2.5)

| 块 | 层 | 连接 | 输入→输出 | FIPS 203 |
|----|----|------|----------|----------|
| `pq_ntt_vec` | 2 | value(→) | IntList→IntList | Alg 14 step 6 |
| `pq_intt_vec` | 2 | value(→) | IntList→IntList | Alg 14 step 12 |
| `pq_cbd_ntt_vec` | 2 | value(→) | Bytes→IntList | Alg 14 step 5-6 |
| `pq_mat_vec_mul_ntt` | 2 | value(→) | IntList→IntList | Alg 14 step 8-9 |
| `pq_vec_add` | 2 | value(→) | IntList→IntList | Alg 14 step 10 |
| `pq_vec_sub` | 2 | value(→) | IntList→IntList | — |
| `pq_sample_ntt_mat` | 2 | value(→) | Bytes→IntList | Alg 14 step 4 |

## 一键封装 (M4)

| 块 | 层 | 连接 | 输入→输出 | FIPS 203 |
|----|----|------|----------|----------|
| `ml_kem_keygen` | 3 | value(→) | Bytes→Bytes | Alg 14 |
