# Algorithm 2  ML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥)

**章节**: §4  
**类别**: ML-DSA 公开 API

### 规范

```
Algorithm 2 ML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥)
Generates an ML-DSA signature.
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) , message 𝑀 ∈ {0, 1}∗ ,
context string 𝑐𝑡𝑥 (a byte string of 255 or fewer bytes).
Output: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
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
10: 𝑀 ′ ← BytesToBits(IntegerToBytes(0, 1) ∥ IntegerToBytes(|𝑐𝑡𝑥|, 1) ∥ 𝑐𝑡𝑥) ∥ 𝑀
11: 𝜎 ← ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)
12: return 𝜎

5.3

ML-DSA Verifying

The verification algorithm ML-DSA.Verify (Algorithm 3) takes a public key, a message, a signature, and a
context string as input. The public key, signature, and context string are all encoded as byte strings, while
the message is a bit string. ML-DSA.Verify outputs a Boolean value that is true if the signature is valid
with respect to the message and the public key and false if the signature is invalid. The verification is
accomplished by calling ML-DSA.Verify_internal (Algorithm 8) with the public key, the encoded message,
and the signature.

```

### CipherCat

尚未实现。
