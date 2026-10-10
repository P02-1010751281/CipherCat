# RSA Signature Key Generation (FIPS 186-5)

## Entry Metadata

| Field | Value |
|---|---|
| Type | RSA signature-key generation algorithm and implementation boundary |
| Standard position | FIPS 186-5 §§5.1, 5.4(a), Appendices A.1.1 and A.1.3, B.3, and Table B.1 |
| Source evidence | [Complete source extraction](./00-Standard-Source.md); [NIST publication page](https://csrc.nist.gov/pubs/fips/186-5/final) |
| Source location | §5.1: [extraction from line 973](./00-Standard-Source.md#L973); A.1.1: [from line 1800](./00-Standard-Source.md#L1800); A.1.3: [from line 1900](./00-Standard-Source.md#L1900); B.3/Table B.1: [from line 2724](./00-Standard-Source.md#L2724). Relevant PDF physical pages 25–27, 43–51, and 65–68 (printed pages 16–18, 34–42, and 56–59). The manual visual review in this round covered only physical pages 27, 44–51, 65–68, and 76 |
| Project status | Reference only; the current `rsa_keygen` is educational and is not claimed to conform to FIPS 186-5 |

## Standard Definition

FIPS 186-5 RSA clauses apply to digital-signature key pairs; these key pairs must not be used for other purposes such as key establishment. RFC 8017 defines RSA encryption and signature schemes but does not define this project's key-generation algorithm.

- The modulus `n = p × q` must have an even bit length `nlen ≥ 2048`; `p` and `q` must have equal lengths of `nlen/2` bits.
- Select public exponent `e` before generating the primes and private exponent. It must be an odd positive integer satisfying `2^16 < e < 2^256`.
- `p` and `q` must satisfy Appendix A.1.1's candidate ranges and `gcd(p−1,e)=gcd(q−1,e)=1`; they must also satisfy `|p−q| > 2^(nlen/2−100)`.
- The private exponent must satisfy `2^(nlen/2) < d < lcm(p−1,q−1)` and `e·d ≡ 1 (mod lcm(p−1,q−1))`. If `d` is below the lower bound, regenerate the related parameters.
- Key generation must use an approved random bit generator. A.1.3 requires DRBG security strength at least that associated with `nlen`.
- Appendix A.1.1 permits several prime-generation paths. This entry structures A.1.3's random probable-prime path; the provable-prime and conditional-prime paths in A.1.2 and A.1.4–A.1.6 are out of scope here.
- Appendix B.3 requires an approved robust probabilistic primality test. The allowed paths include multiple Miller–Rabin rounds, or Miller–Rabin followed by one Lucas test. Read the rounds together with the candidate size and target error probability in Table B.1.

The complete Table B.1 round values for RSA are shown below. Auxiliary-prime values apply to conditional-prime construction and do not imply that this project implements those paths.

| Minimum auxiliary-prime length | Bit length of `p` and `q` | Target error probability | Auxiliary-prime Miller–Rabin rounds | `p/q` Miller–Rabin rounds |
|---:|---:|---:|---:|---:|
| >140 | 1024 | `2^-100` | 32 | 4 |
| >140 | 1024 | `2^-112` | 38 | 5 |
| >170 | 1536 | `2^-100` | 27 | 3 |
| >170 | 1536 | `2^-128` | 41 | 4 |
| >200 | 2048 | `2^-100` | 22 | 2 |
| >200 | 2048 | `2^-144` | 44 | 4 |

These rounds are not a universal error probability independent of candidate generation, prime size, and DRBG. Appendix C.1 distinguishes the probability that a composite passes from the probability that a passing candidate is composite.

## Source Location and Citation

The key constraints, Table B.1, and complete A.1.3 process are structured in this entry. The original algorithm is preserved in “Source Excerpt.” See the [NIST FIPS 186-5 PDF](./NIST.FIPS.186-5.pdf). This round's manual visual review was limited to physical pages 27, 44–51, 65–68, and 76; corresponding distorted RSA formulas were corrected against those pages. This does not claim a page-by-page review of the full standard or every page cited by this entry. This page is a standards reference, not an implementation-conformance report or certificate.

## Formula or Pseudocode

The A.1.1 key-parameter relationships are:

```text
2^16 < e < 2^256; e is odd
sqrt(2) × 2^(nlen/2 − 1) ≤ p,q ≤ 2^(nlen/2) − 1
gcd(p − 1, e) = gcd(q − 1, e) = 1
|p − q| > 2^(nlen/2 − 100)
2^(nlen/2) < d < lcm(p − 1, q − 1)
e × d ≡ 1 (mod lcm(p − 1, q − 1))
```

The complete A.1.3 inputs, outputs, and steps are preserved in the [full source algorithm below](#source-excerpt).

## Inputs and Outputs

A.1.3 takes the modulus bit length `nlen`, public exponent `e`, and optional `a,b ∈ {1,3,5,7}` for the constraints `p ≡ a (mod 8)` and `q ≡ b (mod 8)`. On success it returns `SUCCESS` and primes `p,q`; on failure it returns `FAILURE` and zero values for `p,q`.

## Project Mapping

- Blockly block: `rsa_keygen`, defined in `src/blocks/rsa/blocks.ts`; generators are in `src/generators/javascript/rsa/blocks.ts` and `src/generators/python/rsa/blocks.ts`.
- The block fixes `e=65537` and returns a project-specific fixed-width, big-endian `n‖e‖d‖p‖q` byte string. RFC 8017 defines neither this key-generation algorithm nor this encoding.
- Miller–Rabin is internal to the generator; there is no standalone block. Its standard reference is [RSA Probabilistic Primality Testing](./06-RSA-Primality-Testing.en.md).
- Related teaching demo: `demos/procedures/RSA-Encrypt.json`. It uses private-key material for encryption/decryption and is not an example of FIPS 186-5 signature-key use.

## Verification and Gaps

- The project offers 512-, 1024-, and 2048-bit choices. The 512- and 1024-bit options are below the FIPS 186-5 §5.1 minimum for signature moduli; the 2048-bit option meets only the size threshold.
- JavaScript uses browser `crypto.getRandomValues`; Python uses `os.urandom`/`secrets`. These facts do not establish use of an approved DRBG. Both use 20 random-base Miller–Rabin rounds. For a 2048-bit modulus with 1024-bit `p` and `q`, 20 exceeds the listed Table B.1 round count, but this does not prove candidate generation, randomness, test implementation, or target error probability conforms.
- The implementation does not enforce the A.1.1 prime-distance or private-exponent `d` lower bound, and has not established the full candidate range, key protection, validation, or lifecycle requirements.
- Passing unit tests, interoperability tests, or demos establishes only the behavior of tested samples. It does not establish full FIPS 186-5/RFC 8017 conformance or formal certification.
- The output contains private material (`d,p,q`) and must not be used as a production key format. The encryption demo is not a FIPS signature-key-management workflow.
- NIST status checked on 2026-09-30: its publication page links the [Potential Updates spreadsheet](./fips186-5-potential-updates.xlsx), which lists four potential updates to A.3.3 and B.10; these are not issued official errata. B.10 concerns provable-prime construction and is not applied to the A.1.3/B.3 path structured here. Recheck the NIST page before formal citation.

## Source Excerpt

The source's English wording and complete A.1.3 process are retained below. Only superscripts, radical notation, parentheses, and line wrapping lost by PDF text extraction have been normalized. See the [complete source extraction](./00-Standard-Source.md) and PDF for context.

### A.1.1: RSA Key Criteria

```text
In addition, all IFC keys shall meet the following criteria in order to conform to this standard, FIPS 186-5:
1. The public exponent e shall be selected with the following constraints:
   (a) The public verification exponent e shall be selected prior to generating the primes, p and q, and the private signature exponent d.
   (b) The exponent e shall be an odd positive integer such that 2^16 < e < 2^256.
       Note that the value of e may be any value that meets constraint 1(b) (i.e., e may be either a fixed value or a random value).
2. The primes p and q shall be selected with the following constraints:
   (a) (p − 1) and (q − 1) shall be relatively prime to the public exponent e.
   (b) The private prime factor p shall be selected randomly and shall satisfy
       sqrt(2) × 2^(nlen/2 − 1) ≤ p ≤ 2^(nlen/2) − 1, where nlen is the appropriate length for the desired security_strength.
   (c) The private prime factor q shall be selected randomly and shall satisfy
       sqrt(2) × 2^(nlen/2 − 1) ≤ q ≤ 2^(nlen/2) − 1, where nlen is the appropriate length for the desired security_strength.
   (d) |p − q| > 2^(nlen/2 − 100).
3. The private signature exponent d shall be selected with the following constraints after the generation of p and q:
   (a) The exponent d shall be a positive integer value such that
       2^(nlen/2) < d < LCM(p − 1, q − 1), and
   (b) d = e^−1 mod LCM(p − 1, q − 1).
       That is, the inequality in (a) holds, and 1 ≡ (ed) mod LCM(p − 1, q − 1).
   In the extremely rare event that d ≤ 2^(nlen/2), then new values for p, q, and d shall be determined. A different value of e may be used, although this is not required.
Any hash function used during the generation of the key pair shall be approved.
```

### A.1.3: Generation of Random Primes that are Probably Prime

```text
A.1.3 Generation of Random Primes that are Probably Prime

An approved method that satisfies the constraints of Appendix A.1.1 shall be used for the
generation of IFC random primes p and q that are probably prime (see case A.2). In addition, the
security strength of the instance of the DRBG mechanism (see Section 8.4 in SP 800-90A, Rev.
1 [16]) used in the algorithm below shall be equal to or greater than the security strength
associated with nlen as specified in SP 800-57, Part 1.

The following process or its equivalent shall be used to construct the random probable primes p
and q (to be used as factors of the RSA modulus n):
Input:
   nlen          The intended bit length of the modulus n.
   e             The public verification exponent.
   a, b          (Optional parameters) Numbers from the set {1, 3, 5, 7} that may be used to add
                 the further requirements p ≡ a mod 8, q ≡ b mod 8.
Output:
   status        The status of the generation process, where status is either SUCCESS or
                 FAILURE.
   p and q       The private prime factors of n. When FAILURE is returned, zero values shall be
                 returned as p and q.
Process:
   1. If nlen < 2048, return (FAILURE, 0, 0).
   2. If ((e ≤ 2^16) OR (e ≥ 2^256) OR (e is not odd)), then return (FAILURE, 0, 0).
   3. Set the value of security_strength in accordance with the value of nlen as specified in SP
      800-57, Part 1.
   4. Generate p:
       4.1   i = 0.
       4.2   Obtain a string p of (nlen/2) bits from a DRBG that supports the security_strength.
             4.2.1 (Optional) The two most significant bits in p may be set arbitrarily.
       4.3   If p is generated with the p ≡ a mod 8 restriction, then p = p + ((a − p) mod 8),
             Else if (p is not odd), then p = p + 1.
       4.4   If (p < sqrt(2) × 2^(nlen/2 − 1)), then go to step 4.2.
       4.5   If (GCD(p − 1, e) = 1), then
                4.5.1 Test p for primality as specified in Appendix B.3 using an appropriate
                      value from Table B-1 in Appendix B.3 as the number of iterations.
                4.5.2 If p is PROBABLY PRIME, then go to step 5.
       4.6   i = i + 1.
       4.7   If (i ≥ 5 × nlen), then return (FAILURE, 0, 0)
             Else go to step 4.2.
   5. Generate q:
       5.1   i = 0.
       5.2   Obtain a string q of (nlen/2) bits from a DRBG that supports the security_strength
             5.2.1 The two most significant bits in q may be set arbitrarily.
       5.3   If q is generated with the q ≡ b mod 8 restriction, then q = q + ((b − q) mod 8),
             Else if (q is not odd), then q = q + 1.
       5.4   If (q < sqrt(2) × 2^(nlen/2 − 1)), then go to step 5.2.
       5.5   If (|p − q| ≤ 2^(nlen/2 − 100)), then go to step 5.2.
       5.6   If (GCD(q−1, e) = 1) then
                5.6.1 Test q for primality as specified in Appendix B.3 using an appropriate
                      value from Table B-1 in Appendix B.3 as the number of iterations.
                5.6.2 If q is PROBABLY PRIME, then return (SUCCESS, p, q).
       5.7   i = i + 1.
       5.8   If (i ≥ 10 × nlen), then return (FAILURE, 0, 0)
             Else go to step 5.2.
```
