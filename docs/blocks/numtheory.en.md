# Number Theory + Big Integer Block Reference


## Field Ops + NTT

| Block | Layer | Connection | Input→Output | Notes |
|---|---|---|---|---|
| `nt_field_add` | 1 | value(→) | null&null&null→null |
| `nt_mod_inverse` | 1 | stmt(→→) | null&null&null→— |
| `nt_mod` | 1 | value(→) | Number&Number→Number |
| `nt_mod_pow` | 1 | value(→) | Number&Number→Number (modulus is a dropdown) |
| `nt_div_rem` | 1 | value(→) | Number&Number→IntList |
| `pq_poly_add` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_sub` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_mul` | 1 | value(→) | IntList&IntList→IntList | ordinary coefficient convolution (MODULUS: none/3329/8380417/12289; safe-integer coefficients; no `X^256+1` reduction; not FIPS 203/204 `R_q` multiplication) |
| `pq_mat_vec_mul` | 1 | value(→) | IntList&IntList→IntList | scalar modular matrix-vector teaching helper; not polynomial-ring matrix arithmetic |
| `pq_ntt` | 1 | value(→) | IntList→IntList | NTT (MODULUS dropdown 3329/8380417/12289): q=8380417 branch per FIPS 204 (ζ=1753, BitRev8, 8-layer CT); q=12289 is a 256-point cyclic NTT for teaching |
| `pq_intt` | 1 | value(→) | IntList→IntList | INTT (same dropdown): q=8380417 GS 8 layers then × 256⁻¹=8347681; q=12289 inverts the teaching NTT |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | NTT-domain multiply (dropdown 3329/8380417): each input requires 256 safe integer coefficients; integer-valued floats are normalized, booleans/fractions/unsafe integers are rejected; inputs are reduced to `[0,q)` at entry; q=8380417 pointwise, q=3329 half-NTT base mul |
| `pq_ntt_butterfly` | 1 | value(→) | Number&Number&Number→IntList |

> Both `pq_poly_add/sub` inputs must contain 256 coefficients. Coefficients must be safe integers; integer-valued floats are normalized to integers, while booleans, fractions, and out-of-range integers are rejected. Each coefficient is reduced modulo `q` before addition or subtraction to avoid intermediate precision loss at the safe-integer boundary. `pq_ntt/intt` also always require `n=256` and exactly 256 coefficients. Their coefficients must be safe integers; integer-valued floats are normalized, while booleans, fractions, and out-of-range values are rejected. Each accepted coefficient is reduced to `[0,q)` at the transform entry. Both `pq_ntt_mul` inputs must contain 256 safe integer coefficients; integer-valued floats are accepted, booleans/fractions/unsafe integers rejected, and coefficients are reduced to `[0,q)` before multiplication. `q=3329` is ML-KEM, `q=8380417` is ML-DSA, and `q=12289` uses a 256-point cyclic NTT for teaching only. It does not represent NewHope or another standardized cryptographic implementation, and there is no matching NTT-domain multiplication block for this teaching branch.

`pq_poly_mul` computes ordinary coefficient convolution. Coefficients must be safe integers; integer-valued floats such as `1.0` are normalized to integers, while booleans, fractions, and out-of-range values are rejected. Without a modulus, it rejects any output coefficient outside the safe-integer range. With modulus `q`, it first normalizes coefficients modulo `q`, then accumulates and reduces each term. It does not limit input degree or reduce modulo `X^256+1`, so it is a generic `Z[X]` / `Z_q[X]` arithmetic teaching block, not ML-KEM/ML-DSA multiplication in `R_q = Z_q[X]/(X^256+1)` and not conformance evidence for either standard.

Although its Blockly ID retains the `pq_` prefix, `pq_mat_vec_mul` only multiplies a row-major flattened `k×k` scalar matrix by a `k`-element scalar vector modulo `q`. The matrix must contain `k²` safe-integer values. Integer-valued floats such as `1.0` are accepted and normalized to integers; booleans, fractional values, and values outside the safe-integer range are rejected. Supported moduli are 3329 and 8380417, and negative integers are normalized modulo `q`. This is not the matrix-vector operation over polynomial-ring elements `R_q` in FIPS 203/204 and must not be treated as that standard primitive or as conformance evidence.

`pq_ntt_butterfly` computes one generic CT or GS butterfly step and returns `[out0, out1]`; its modulus options are 3329, 8380417, and 12289. Inputs `a`, `b`, and `ζ` must be integer residues in `[0, q)`, and `q` must be an odd integer greater than 2. CT computes `(a + ζb, a − ζb) mod q`; GS computes `((a + b)/2, ζ(b − a)/2) mod q`. This block does not implement a complete NTT/INTT and does not, by itself, implement or establish FIPS 203 Algorithms 9/10 or FIPS 204 Algorithms 41/42. The `q=12289` branch is for teaching only.

## Combinations and Vector Dot Product

| Block | Input→Output | Contract |
|----|----------|------|
| `comb` | Number&Number→Number | `n` and `k` must be safe integers; results are exact and values beyond JavaScript's safe-integer range are rejected in both generators |
| `vec_dot` | IntList&IntList→Number | Input vectors must have equal lengths; dimension mismatches are rejected in both generators |

## Multivariate, Lattice, and Distribution Helpers (Teaching/Research)

| Block | Input→Output | Contract and limits |
|-------|--------------|---------------------|
| `gauss_elim` | IntList&Number→IntList | Takes a row-major flattened augmented matrix `[A\|b]` (`n×(n+1)`) and uses floating-point elimination to solve a uniquely solvable system; rank-deficient systems return an empty list. The caller must provide matching dimensions. This is general numerical linear algebra, not a cryptographic verifier. |
| `mv_quad_eval` | IntList&IntList→Number | Evaluates `Q(x)=Σ(i≤j)aᵢⱼxᵢxⱼ+Σbᵢxᵢ+c`; coefficients are upper-triangular quadratic terms (row-major), then `n` linear terms, then a constant. The required length is `n(n+1)/2+n+1`. This is a generic MQ math example, not a specific scheme. |
| `poly_scale` | IntList&Number→IntList | Multiplies each polynomial coefficient by scalar `k`; no modular reduction is performed, and numeric precision follows runtime number semantics. |
| `lll_reduce` | IntList&Number&Number→IntList | Floating-point Gram–Schmidt teaching implementation over a flattened `rows×cols` basis with fixed `δ=0.75`; it does not provide exact integer arithmetic, complete input validation, or a proven reduction bound. Current JS and Python output rounding differs, so it must not be used for cross-language equivalence or cryptographic implementations. |
| `gauss_pmf` | Number&Number→Number | Finite-range, normalized approximation of the centered discrete Gaussian probability mass function; `sigma` should be positive. It computes a probability only: it does not sample, and is not a Falcon/FN-DSA sampler or conformance evidence. |

## Big Integer Ops

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `bn_add` | 1 | value(→) | IntList&IntList→IntList |
| `bn_sub` | 1 | value(→) | IntList&IntList→IntList |
| `bn_mul` | 1 | value(→) | IntList&IntList→IntList |
| `bn_div` | 1 | value(→) | IntList&IntList→IntList |

### Operation contracts

- `nt_div_rem(a, d)` returns `[quotient, remainder]` with Python `divmod` semantics: the quotient is rounded toward negative infinity and `a = quotient × d + remainder`. Both inputs must be safe integers (absolute value at most 2^53−1); other values and `d = 0` are rejected.
- `nt_mod(a, n)` requires safe-integer `a` and `n`, with `n > 0`, and returns the residue in `[0, n)`. `nt_mod_pow(a, e)` uses the block's selected modulus and requires safe-integer `a` and `e` with `e ≥ 0`; JavaScript uses `BigInt` for intermediate arithmetic to avoid 32-bit shifts and floating-point multiplication loss.
- `nt_field_add` requires safe-integer `a`, `b`, and `p` with `p > 0`, and normalizes its result to `[0, p)`. When interpreting it as finite-field arithmetic, the caller must ensure `p` is prime; the block does not test primality. JavaScript uses `BigInt` for intermediate arithmetic. `nt_mod_inverse(e, m)` requires safe-integer inputs, `m > 0`, and `gcd(e, m) = 1`; negative `e` is normalized modulo `m`. The result is in `[0, m)` and is emitted as JavaScript `Number` / Python `int`. Its JavaScript `BigInt` intermediates do not imply arbitrary-precision inputs. Missing inverses, non-positive moduli, and inputs outside the integer contract are rejected.
- `bn_*` treats each `IntList` as an unsigned 32-bit limb array, least-significant limb first, with each limb in `0..2^32−1`; an empty list represents zero. Results use the same order and normalize zero to `[0]`. Non-lists, non-integer limbs, and out-of-range limbs are rejected. `bn_sub(a, b)` rejects unsigned underflow when `a < b`; `bn_div(a, b)` rejects a zero divisor, including an empty list.
- These are general-purpose numeric building blocks; they do not by themselves establish RSA or any other standards conformance.

## RSA Public-Key Cryptography Teaching Blocks

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `rsa_keygen` | 1 | value(→) | (bit-length dropdown; no value input)→Bytes | Project-specific educational key generation; 512/1024/2048 → fixed-width big-endian `n‖e‖d‖p‖q` (196 bytes for 512 bits); not defined by RFC 8017 and not validated against FIPS 186-5 Appendix requirements |
| `rsa_encrypt` | 1 | value(→) | Bytes&Bytes→Bytes | Teaching implementation of the RFC 8017 RSAES-PKCS1-v1_5 scheme: `m^e mod n` (random non-zero PS padding) |
| `rsa_decrypt` | 1 | value(→) | Bytes&Bytes→Bytes | Teaching implementation of the RFC 8017 RSAES-PKCS1-v1_5 scheme: `m^d mod n`, unpad |
| `rsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | Teaching implementation of the RFC 8017 RSASSA-PKCS1-v1_5 scheme: SHA-256 + DigestInfo, `m^d mod n` |
| `rsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | Teaching implementation of the RFC 8017 RSASSA-PKCS1-v1_5 verification scheme |

Interoperability tests are not conformance testing or certification. This custom key encoding contains private material (`d`, `p`, and `q`) and is for classroom demonstrations only. RFC 8017 defines RSA schemes, not the key-generation algorithm used here. FIPS 186-5 §5.1 requires RSA signature moduli of at least 2048 bits; 512/1024-bit choices do not meet that parameter requirement, and the 2048-bit option does not establish key-generation conformance. See [FIPS 186-5 RSA key-generation requirements](../standards/fips186-5-ecdsa/05-RSA-Key-Generation.md) and the [RFC 8017 structured entry](../standards/rfc8017-pkcs1/01-RSA.md).

## GF(2^m) Fields (AES: FIPS 197; GCM: NIST SP 800-38D)

| Block | Layer | Connection | Input→Output | Notes |
|---|---|---|---|---|
| `gf2m_mul` | 1 | value(→) | IntList&IntList→IntList |
| `gf2m_add` | 1 | value(→) | IntList&IntList→IntList | field addition = bitwise XOR (AES/GCM dual field) |
| `gf2m_inv` | 1 | value(→) | IntList→IntList | multiplicative inverse (polynomial extended Euclid); AES S-box convention maps 0 to 0, while 0 has no GCM-field inverse and is rejected |

AES field elements use a one-element `IntList`; addition, multiplication, and inversion all return a one-element list. A GCM field element uses four low-word-first unsigned 32-bit limbs, each in `[0, 2^32−1]`; bit order within each word follows the NIST 128-bit block. For example, block `000102030405060708090A0B0C0D0E0F` maps to `[0x0C0D0E0F, 0x08090A0B, 0x04050607, 0x00010203]`. Multiplication follows SP 800-38D §6.3 Algorithm 1, scanning block bits and shifting right; the multiplicative identity is `[0, 0, 0, 0x80000000]`.

## GF(2) Polynomials + Binary Matrices (Code-Based Math)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `gf2_poly_mul` | 1 | value(→) | IntList&IntList→IntList | GF(2) polynomial multiplication (XOR convolution, little-endian); an empty input yields `[]`, representing the zero polynomial; non-empty example `(1+x)(1+x+x²)=1+x³` maps `[1,1]×[1,1,1]` to `[1,0,0,1]` |
| `gf2_poly_div` / `gf2_poly_mod` | 1 | value(→) | IntList&IntList→IntList | long-division quotient / remainder |
| `gf2_poly_gcd` | 1 | value(→) | IntList&IntList→IntList | Euclidean GCD |
| `bin_mat_mul` | 1 | value(→) | IntList&IntList&Number→IntList | GF(2) matrix multiply (flattened n×n, n = order) |
| `bin_mat_inv` | 1 | value(→) | IntList&Number→IntList | GF(2) matrix inverse (augmented Gaussian elimination) |
| `ham_weight` | 1 | value(→) | IntList→Number | Hamming weight |
| `ham_dist` | 1 | value(→) | IntList&IntList→Number | Hamming distance |

## Goppa Codes (McEliece Code-Based Cryptography Components)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `goppa_gen_poly` | 1 | value(→) | IntList→IntList | G(z)=∏(z−αᵢ), αᵢ ∈ GF(2⁸) (AES field) — core McEliece code construction |
| `syndrome_calc` | 1 | value(→) | IntList&IntList&Number&Number→IntList | linear-code syndrome s = H·y mod 2; s=0 ⟺ valid codeword |
| `berlekamp_massey` | 1 | value(→) | IntList→IntList | GF(2) shortest LFSR synthesis (BCH/RS decoding) |
| `goppa_decode` | 1 | value(→) | IntList&IntList&IntList→IntList | Patterson-style decoder in this project's teaching implementation; current property regression uses a small GF(16) subfield `[14,6,5]` example, not a Classic McEliece parameter set or certification evidence |

## GF(2^m) Coefficient Polynomials (Patterson Primitives)

The Goppa, binary-field, and polynomial blocks are code-based cryptography math teaching components. Current tests focus on small constructions, algebraic relations, and input boundaries; they do not establish Classic McEliece parameter-set conformance, interoperability, complete algorithm coverage, or formal certification.

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `gf2m_poly_add` | 1 | value(→) | IntList&IntList→IntList | coefficient-wise XOR (characteristic 2) |
| `gf2m_poly_mul` | 1 | value(→) | IntList&IntList→IntList | convolution (GF(2⁸) field multiplication, AES polynomial representation); an empty input yields `[]`; bilingual examples are `[1,2]×[3,4]=[3,2,8]` and scalar field multiplication `0x57×0x83=0xC1` |
| `gf2m_poly_mod` | 1 | value(→) | IntList&IntList→IntList | long-division remainder (mod Goppa polynomial) |
| `gf2m_poly_xgcd` | 1 | value(→) | IntList&IntList→IntList | extended Euclid → [len_u,u…,len_v,v…,g…] (u·A⊕v·B=g); Patterson locator core |
| `gf2m_poly_eval` | 1 | value(→) | IntList&Number→Number | Horner evaluation (Chien search) |
