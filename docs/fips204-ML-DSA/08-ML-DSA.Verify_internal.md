# Algorithm 8  ML-DSA.Verify_internal(𝑝𝑘, 𝑀 ′ , 𝜎)

**章节**: §7  
**类别**: ML-DSA 内部 API

### 规范

```
Algorithm 8 ML-DSA.Verify_internal(𝑝𝑘, 𝑀 ′ , 𝜎)
Internal function to verify a signature 𝜎 for a formatted message 𝑀 ′ .
Input: Public key 𝑝𝑘 ∈ 𝔹32+32𝑘(bitlen (𝑞−1)−𝑑) and message 𝑀 ′ ∈ {0, 1}∗ .
Input: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
Output: Boolean
1: (𝜌, 𝐭1 ) ← pkDecode(𝑝𝑘)
2: (𝑐,̃ 𝐳, 𝐡) ← sigDecode(𝜎)
▷ signer’s commitment hash 𝑐,̃ response 𝐳, and hint 𝐡
3: if 𝐡 = ⊥ then return false
▷ hint was not properly encoded
4: end if
5: 𝐀̂ ← ExpandA(𝜌)
▷ 𝐀 is generated and stored in NTT representation as 𝐀̂
6: 𝑡𝑟 ← H(𝑝𝑘, 64)
7: 𝜇 ← (H(BytesToBits(𝑡𝑟)||𝑀 ′ , 64))
▷ message representative that may optionally be
computed in a different cryptographic module
8: 𝑐 ∈ 𝑅𝑞 ← SampleInBall(𝑐)̃
▷ compute verifier’s challenge from 𝑐 ̃
′
−1
′
̂
9: 𝐰Approx ← NTT (𝐀 ∘ NTT(𝐳) − NTT(𝑐) ∘ NTT(𝐭1 ⋅ 2𝑑 ))
▷ 𝐰Approx
= 𝐀𝐳 − 𝑐𝐭1 ⋅ 2𝑑
′
′
10: 𝐰1 ← UseHint(𝐡, 𝐰Approx )
▷ reconstruction of signer’s commitment
11:
▷ UseHint is applied componentwise (see explanatory text in Section 7.4)
12: 𝑐 ′̃ ← H(𝜇||w1Encode(𝐰′1 ), 𝜆/4)
▷ hash it; this should match 𝑐 ̃
′
13: return [[ ||𝐳||∞ < 𝛾1 − 𝛽]] and [[𝑐 ̃ = 𝑐 ̃ ]]

27

FIPS 204

7.

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

Auxiliary Functions

This section provides pseudocode for subroutines utilized by ML-DSA, including functions for data-type
conversions, arithmetic, and sampling.

7.1

Conversion Between Data Types

While the primary data type in ML-DSA is a byte string, other data types are used as well. The goal in
this section is to construct procedures for translating between the various algebraic objects defined in
Section 2.3. Algorithms 9–13 are intermediate procedures for converting between bit strings, byte strings,
and integers.

```

### CipherCat

尚未实现。
