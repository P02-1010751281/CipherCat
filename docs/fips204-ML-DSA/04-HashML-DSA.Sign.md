# Algorithm 4  HashML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥, PH)

**章节**: §5  
**类别**: HashML-DSA 公开 API

### 规范

```
Algorithm 4 HashML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥, PH)
Generate a “pre-hash” ML-DSA signature.
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) , message 𝑀 ∈ {0, 1}∗ ,
context string 𝑐𝑡𝑥 (a byte string of 255 or fewer bytes), pre-hash function PH.
Output: ML-DSA signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
1: if |𝑐𝑡𝑥| > 255 then
2:
return ⊥
▷ return an error indication if the context string is too long
3: end if
4:
5: 𝑟𝑛𝑑 ← 𝔹32
▷ for the optional deterministic variant, substitute 𝑟𝑛𝑑 ← {0}32
6: if 𝑟𝑛𝑑 = NULL then
7:
return ⊥
▷ return an error indication if random bit generation failed
8: end if
9:
10: switch PH do
11:
case SHA-256:
12:
OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01

▷ 2.16.840.1.101.3.4.2.1
PH𝑀 ← SHA256(𝑀 )
14:
case SHA-512:
15:
OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x03
▷ 2.16.840.1.101.3.4.2.3
16:
PH𝑀 ← SHA512(𝑀 )
17:
case SHAKE128:
18:
OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x0B
▷ 2.16.840.1.101.3.4.2.11
19:
PH𝑀 ← SHAKE128(𝑀 , 256)
20:
case …
21:
…
22: end switch
23: 𝑀 ′ ← BytesToBits(IntegerToBytes(1, 1) ∥ IntegerToBytes(|𝑐𝑡𝑥|, 1) ∥ 𝑐𝑡𝑥 ∥ OID ∥ PH𝑀 )
24: 𝜎 ← ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)
25: return 𝜎
13:

Algorithm 5 presents the signature verification for HashML-DSA . This function constructs 𝑀 ′ in the same
way as Algorithm 4 and passes the resulting 𝑀 ′ to Algorithm ML-DSA.Verify_internal for verification. As
with the pre-hash signature generation, 𝑀 ′ may be constructed outside of the cryptographic module
that performs ML-DSA.Verify_internal. However, in the case of HashML-DSA , the hash or XOF of the
content must be computed within a FIPS 140-validated cryptographic module, which may be a different
cryptographic module than the one that performs ML-DSA.Verify_internal.
As noted in Section 5.4, the identifier associated with the signature should indicate whether ML-DSA or

20

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

the pre-hash version HashML-DSA of signature verification should be used, as well as the hash function or
XOF to be used to compute the pre-hash. A non-empty context string should be used in verification if one
is specified either in the signature’s identifier or by the application with which the signature is being used.

```

### CipherCat

尚未实现。
