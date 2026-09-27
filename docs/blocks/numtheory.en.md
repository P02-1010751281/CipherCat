# Number Theory + Big Integer Block Reference


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
| `pq_poly_mul` | 1 | value(→) | IntList&IntList→IntList | plain integer convolution (MODULUS dropdown none/3329/8380417/12289); ring R_q teaching, compare with NTT-domain `pq_ntt_mul` |
| `pq_mat_vec_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt` | 1 | value(→) | IntList→IntList | NTT (MODULUS dropdown 3329/8380417/12289): q=8380417 branch per FIPS 204 (ζ=1753, BitRev8, 8-layer CT) |
| `pq_intt` | 1 | value(→) | IntList→IntList | INTT (same dropdown): q=8380417 GS 8 layers then × 256⁻¹=8347681 |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | NTT-domain multiply (dropdown 3329/8380417): q=8380417 pointwise, q=3329 half-NTT base mul |
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
| `gf2m_add` | 1 | value(→) | IntList&IntList→IntList | field addition = bitwise XOR (AES/GCM dual field) |
| `gf2m_inv` | 1 | value(→) | IntList→IntList | multiplicative inverse (polynomial extended Euclid, Fermat check) |

## GF(2) Polynomials + Binary Matrices (Code-Based Math)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `gf2_poly_mul` | 1 | value(→) | IntList&IntList→IntList | GF(2) polynomial multiplication (XOR convolution, little-endian) |
| `gf2_poly_div` / `gf2_poly_mod` | 1 | value(→) | IntList&IntList→IntList | long-division quotient / remainder |
| `gf2_poly_gcd` | 1 | value(→) | IntList&IntList→IntList | Euclidean GCD |
| `bin_mat_mul` / `bin_mat_inv` | 1 | value(→) | IntList&IntList→IntList | GF(2) matrix multiply / inverse (augmented Gaussian elimination, flattened n×n) |
| `ham_weight` / `ham_dist` | 1 | value(→) | IntList→Number | Hamming weight / distance |

## Goppa Codes (McEliece Code-Based Cryptography Components)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `goppa_gen_poly` | 1 | value(→) | IntList→IntList | G(z)=∏(z−αᵢ), αᵢ ∈ GF(2⁸) (AES field) — core McEliece code construction |
| `syndrome_calc` | 1 | value(→) | IntList&IntList&Number&Number→IntList | linear-code syndrome s = H·y mod 2; s=0 ⟺ valid codeword |
| `berlekamp_massey` | 1 | value(→) | IntList→IntList | GF(2) shortest LFSR synthesis (BCH/RS decoding) |
| `goppa_decode` | 1 | value(→) | IntList&IntList&IntList→IntList | **Patterson decoding** (full black box): Y + G + L → corrected bit vector; corrects ⌊deg G/2⌋ errors; property vectors (GF(16) subfield [14,6,5] code round-trip) |

## GF(2^m) Coefficient Polynomials (Patterson Primitives)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `gf2m_poly_add` | 1 | value(→) | IntList&IntList→IntList | coefficient-wise XOR (characteristic 2) |
| `gf2m_poly_mul` | 1 | value(→) | IntList&IntList→IntList | convolution (GF(2⁸) field multiplication) |
| `gf2m_poly_mod` | 1 | value(→) | IntList&IntList→IntList | long-division remainder (mod Goppa polynomial) |
| `gf2m_poly_xgcd` | 1 | value(→) | IntList&IntList→IntList | extended Euclid → [len_u,u…,len_v,v…,g…] (u·A⊕v·B=g); Patterson locator core |
| `gf2m_poly_eval` | 1 | value(→) | IntList&Number→Number | Horner evaluation (Chien search) |
