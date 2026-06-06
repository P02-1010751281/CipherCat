# Algorithm 7  ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)

**章节**: §7  
**类别**: ML-DSA 内部 API

### 规范

```
Algorithm 7 ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)
Deterministic algorithm to generate a signature for a formatted message 𝑀 ′ .
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) , formatted message 𝑀 ′ ∈ {0, 1}∗ , and
per message randomness or dummy variable 𝑟𝑛𝑑 ∈ 𝔹32 .
Output: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
1: (𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 ) ← skDecode(𝑠𝑘)
2: 𝐬1̂ ← NTT(𝐬1 )
3: 𝐬2̂ ← NTT(𝐬2 )
4: 𝐭0̂ ← NTT(𝐭0 )
5: 𝐀̂ ← ExpandA(𝜌)
▷ 𝐀 is generated and stored in NTT representation as 𝐀̂
′
6: 𝜇 ← H(BytesToBits(𝑡𝑟)||𝑀 , 64)
▷ message representative that may optionally be
computed in a different cryptographic module
7: 𝜌″ ← H(𝐾||𝑟𝑛𝑑||𝜇, 64)
▷ compute private random seed
8: 𝜅 ← 0
▷ initialize counter 𝜅
9: (𝐳, 𝐡) ← ⊥
10: while (𝐳, 𝐡) = ⊥ do
▷ rejection sampling loop
″
ℓ
11:
𝐲 ∈ 𝑅𝑞 ← ExpandMask(𝜌 , 𝜅)
12:
𝐰 ← NTT−1 (𝐀̂ ∘ NTT(𝐲))
13:
𝐰1 ← HighBits(𝐰)
▷ signer’s commitment
14:
▷ HighBits is applied componentwise (see explanatory text in Section 7.4)
15:
𝑐 ̃ ← H(𝜇||w1Encode(𝐰1 ), 𝜆/4)
▷ commitment hash
16:
𝑐 ∈ 𝑅𝑞 ← SampleInBall(𝑐)̃
▷ verifier’s challenge
17:
𝑐 ̂ ← NTT(𝑐)
18:
⟨⟨𝑐𝐬1 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐬1̂ )
19:
⟨⟨𝑐𝐬2 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐬2̂ )
20:
𝐳 ← 𝐲 + ⟨⟨𝑐𝐬1 ⟩⟩
▷ signer’s response
21:
𝐫0 ← LowBits(𝐰 − ⟨⟨𝑐𝐬2 ⟩⟩)
22:
▷ LowBits is applied componentwise (see explanatory text in Section 7.4)
23:
if ||𝐳||∞ ≥ 𝛾1 − 𝛽 or ||𝐫0 ||∞ ≥ 𝛾2 − 𝛽 then (z, h) ← ⊥
▷ validity checks
24:
else
25:
⟨⟨𝑐𝐭0 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐭0̂ )
26:
𝐡 ← MakeHint(−⟨⟨𝑐𝐭0 ⟩⟩, 𝐰 − ⟨⟨𝑐𝐬2 ⟩⟩ + ⟨⟨𝑐𝐭0 ⟩⟩)
▷ Signer’s hint
27:
▷ MakeHint is applied componentwise (see explanatory text in Section 7.4)
28:
if ||⟨⟨𝑐𝐭0 ⟩⟩||∞ ≥ 𝛾2 or the number of 1’s in 𝐡 is greater than 𝜔, then (z, h) ← ⊥
29:
end if
30:
end if
31:
𝜅←𝜅+ℓ
▷ increment counter
32: end while
±
33: 𝜎 ← sigEncode(𝑐,̃ 𝐳 mod 𝑞, 𝐡)
34: return 𝜎

6.3

ML-DSA Verifying (Internal)

The algorithm ML-DSA.Verify_internal (Algorithm 8) takes a public key 𝑝𝑘 encoded as a byte string, a
message 𝑀 encoded as a bit string, and a signature 𝜎 encoded as a byte string as input. No randomness is

25

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

required for ML-DSA.Verify_internal. It produces a Boolean value (i.e., a value that is true if the signature
is valid with respect to the message and public key and false if the signature is invalid) as output. Algorithm 8
specifies the lengths of the signature 𝜎 and the public key 𝑝𝑘 in terms of the parameters described in
Table 1. If an implementation of ML-DSA.Verify_internal can accept inputs for 𝜎 or 𝑝𝑘 of any other
length, it shall return false whenever the length of either of these inputs differs from its specified length.
The verifier first extracts the public random seed 𝜌 and the compressed polynomial vector 𝐭1 from the
public key 𝑝𝑘 and then extracts the signer’s commitment hash 𝑐,̃ response 𝐳, and hint 𝐡 from the signature
𝜎. The verifier may find that the hint was not properly byte-encoded, denoted by the symbol “⊥,” in
which case the verification algorithm will immediately return false to indicate that the signature is invalid.
Assuming that the signature is successfully extracted from its byte encoding, the verifier pseudorandomly
derives 𝐀 from 𝜌, as is done in key generation and signing, and creates a message representative 𝜇 by
hashing the concatenation of 𝑡𝑟 (i.e., the hash of the public key 𝑝𝑘) and the message 𝑀. The verifier
then attempts to reconstruct the signer’s commitment (i.e., the polynomial vector 𝐰1 ) from the public
key 𝑝𝑘 and the signature 𝜎. In ML-DSA.Sign_internal, 𝐰1 is computed by rounding 𝐰 = 𝐀𝐲. In
ML-DSA.Verify_internal, the reconstructed value of 𝐰1 is called 𝐰′1 since it may have been computed in
a different way if the signature is invalid. This 𝐰′1 is computed through the following process:
• Derive the challenge polynomial 𝑐 from the signer’s commitment hash 𝑐,̃ just as similarly is done in
ML-DSA.Sign_internal.
• Use the signer’s response 𝐳 to compute
𝐰′Approx = 𝐀𝐳 − 𝑐𝐭1 ⋅ 2𝑑 .
Assuming the signature was computed correctly, as in ML-DSA.Sign_internal, it follows that
𝐰 = 𝐀𝐲 = 𝐀𝐳 − 𝑐𝐭 + 𝑐𝐬2 ≈ 𝐰′Approx = 𝐀𝐳 − 𝑐𝐭1 ⋅ 2𝑑
because 𝑐 and 𝐬2 have small coefficients, and 𝐭1 ⋅ 2𝑑 ≈ 𝐭 .
• Use the signer’s hint 𝐡 to obtain 𝐰′1 from 𝐰′Approx .
Finally, the verifier checks that the signer’s response 𝐳 and the signer’s hint 𝐡 are valid and that the
reconstructed 𝐰′1 is consistent with the signer’s commitment hash 𝑐.̃ More precisely, the verifier checks
that all of the coefficients of 𝐳 are sufficiently small (i.e., in the range (−(𝛾1 − 𝛽), 𝛾1 − 𝛽)), 𝐡 contains no
more than 𝜔 nonzero coefficients, and 𝑐 ̃matches the hash 𝑐′̃ of the message representative 𝜇 concatenated
with 𝐰′1 (represented as a byte string). If all of these checks succeed, then ML-DSA.Verify_internal returns
true. Otherwise, it returns false.

26

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
