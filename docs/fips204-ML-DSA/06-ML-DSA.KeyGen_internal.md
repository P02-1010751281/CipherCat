# Algorithm 6  ML-DSA.KeyGen_internal(𝜉)

**章节**: §7  
**类别**: ML-DSA 内部 API

### 规范

```
Algorithm 6 ML-DSA.KeyGen_internal(𝜉)
Generates a public-private key pair from a seed.
Input: Seed 𝜉 ∈ 𝔹32
Output: Public key 𝑝𝑘 ∈ 𝔹32+32𝑘(bitlen (𝑞−1)−𝑑)
and private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) .
1: (𝜌, 𝜌′ , 𝐾) ∈ 𝔹32 × 𝔹64 × 𝔹32 ← H(𝜉||IntegerToBytes(𝑘, 1)||IntegerToBytes(ℓ, 1), 128)
2:
▷ expand seed
3: 𝐀̂ ← ExpandA(𝜌)
▷ 𝐀 is generated and stored in NTT representation as 𝐀̂
4: (𝐬1 , 𝐬2 ) ← ExpandS(𝜌′ )
5: 𝐭 ← NTT−1 (𝐀̂ ∘ NTT(𝐬1 )) + 𝐬2
▷ compute 𝐭 = 𝐀𝐬1 + 𝐬2
6: (𝐭1 , 𝐭0 ) ← Power2Round(𝐭)
▷ compress 𝐭
7:
▷ PowerTwoRound is applied componentwise (see explanatory text in Section 7.4)
8: 𝑝𝑘 ← pkEncode(𝜌, 𝐭1 )
9: 𝑡𝑟 ← H(𝑝𝑘, 64)
10: 𝑠𝑘 ← skEncode(𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 )
▷ 𝐾 and 𝑡𝑟 are for use in signing
11: return (𝑝𝑘, 𝑠𝑘)

6.2

ML-DSA Signing (Internal)

ML-DSA.Sign_internal (Algorithm 7) outputs a signature encoded as a byte string. It takes a private
key 𝑠𝑘 encoded as a byte string, a formatted message 𝑀 ′ encoded as a bit string, and a 32-byte string
𝑟𝑛𝑑 as input. There are two ways that a signing algorithm can use ML-DSA.Sign_internal: “hedged”
and “deterministic.” The default “hedged” variants of ML-DSA.Sign and HashML-DSA.Sign use a fresh
random value for 𝑟𝑛𝑑, while the optional deterministic variants use the constant byte string {0}32 (see
Section 3).
In both variants, the signer first extracts the following from the private key: the public random seed 𝜌,
the 32-byte private random seed 𝐾, the 64-byte hash of the public key 𝑡𝑟, the secret polynomial vectors
𝐬1 and 𝐬2 , and the polynomial vector 𝐭0 encoding the 𝑑 least significant bits of each coefficient of the
uncompressed public-key polynomial 𝐭. 𝜌 is then expanded to the same matrix 𝐀 as in key generation.
Before the message 𝑀 is signed, it is concatenated with the public-key hash 𝑡𝑟 and hashed down to a
64-byte message representative 𝜇 using H.
The signer produces an additional 64-byte seed 𝜌″ for private randomness during each signing operation.
𝜌″ is computed as 𝜌″ ← H(𝐾||𝑟𝑛𝑑||𝜇, 64). In the default hedged variant, 𝑟𝑛𝑑 is the output of an RBG,
while in the deterministic variant, 𝑟𝑛𝑑 is a 32-byte string that consists entirely of zeros. This is the only
difference between the deterministic and hedged variant of ML-DSA.Sign.
The main part of the signing algorithm consists of a rejection sampling loop in which each iteration of the
loop either produces a valid signature or an invalid signature whose release would leak information about
the private key. The loop is repeated until a valid signature is produced, which can then be encoded as a
byte string and output.10 The rejection sampling loop follows the Fiat-Shamir With Aborts paradigm [10]
10

Implementations may limit the number of iterations in this loop to not exceed a finite maximum value. If this

23

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

and (aside from the rejection step) is similar in structure to Schnorr signatures [30] (e.g., EdDSA [31]). The
signer first produces a “commitment” 𝐰1 and then pseudorandomly derives a “challenge” 𝑐 from 𝐰1 and
the message representative 𝜇. Finally, the signer computes a response 𝐳.
In more detail, the main computations involved in the rejection sampling loop are as follows:
• Using the ExpandMask function (Algorithm 34), the seed 𝜌″ , and a counter 𝜅, a polynomial vector
𝐲 ∈ 𝑅𝑞ℓ is pseudorandomly sampled from the subset of polynomial vectors whose coefficients are
moderately short (i.e., in the range [−𝛾1 + 1, 𝛾1 ]).
• From 𝐲, the signer computes the commitment 𝐰1 by computing 𝐰 = 𝐀𝐲 and then rounding to a
nearby multiple of 2𝛾2 using HighBits (Algorithm 37).
• 𝐰1 and 𝜇 are concatenated and hashed to produce the commitment hash 𝑐.̃ This uses the function
w1Encode (Algorithm 28). The byte string 𝑐 ̃is used to pseudorandomly sample a polynomial 𝑐 ∈ 𝑅𝑞
that has coefficients in {−1, 0, 1} and Hamming weight 𝜏. The sampling is done with the function
SampleInBall (Algorithm 29).11
• The signer computes the response 𝐳 = 𝐲 + 𝑐𝐬1 and performs various validity checks. If any of the
checks fails, the signer will continue the rejection sampling loop.
• If the checks pass, the signer can compute a hint polynomial 𝐡, which will allow the verifier to
reconstruct 𝐰1 using the compressed public key along with the other components of the signature.
This uses the function MakeHint (Algorithm 39). The signer will then output the final signature,
which is a byte encoding of the commitment hash 𝑐,̃ the response 𝐳, and the hint 𝐡.
In addition, there is an alternative way of implementing the validity checks on 𝐳 and the computation of
𝐡, which is described in Section 5.1 of [6]. This method may also be used in implementations of ML-DSA.
In Algorithm 7, variables are sometimes used to store products to avoid recomputing them later in the
signing algorithm. These precomputed products are denoted in the pseudocode by a pair of double angle
brackets enclosing the variables being multiplied (e.g., ⟨⟨𝑐𝐬1 ⟩⟩).

option is used and the maximum number of iterations is exceeded without producing a valid signature, the signing
algorithm shall return a constant that represents an error and no other output, destroying the results of the
unsuccessful signing attempts. See Appendix C.
11
The length of 𝑐 ̃ is determined by the desired security with respect to the “message-bound signatures” property
described in [14]. Here, a length of 𝜆/4 bytes or equivalently 2𝜆 bits is required for 𝜆 bits of classical security.

24

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
