# Algorithm 1  ML-DSA.KeyGen()

**章节**: §4  
**类别**: ML-DSA 公开 API

### 规范

```
Algorithm 1 ML-DSA.KeyGen()
Generates a public-private key pair.
Output: Public key 𝑝𝑘 ∈ 𝔹32+32𝑘(bitlen (𝑞−1)−𝑑)
and private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) .
▷ choose random seed
1: 𝜉 ← 𝔹32
2: if 𝜉 = NULL then
return ⊥
▷ return an error indication if random bit generation failed
3:
4: end if
5: return ML-DSA.KeyGen_internal (𝜉)

5.2

ML-DSA Signing

The signing algorithm ML-DSA.Sign (Algorithm 2) takes a private key, a message, and a context string as
input4 . It outputs a signature that is encoded as a byte string.
For the default “hedged” version of ML-DSA signing, the algorithm (at line 5) uses an approved RBG to
generate a 256-bit (32-byte) random seed 𝑟𝑛𝑑. If the deterministic variant is desired, then 𝑟𝑛𝑑 is set
to the fixed zero string {0}32 . The value 𝑟𝑛𝑑, the private key, and the encoded message are input to
ML-DSA.Sign_internal (Algorithm 7), which produces the signature.

4

By default, the context is the empty string, though applications may specify the use of a non-empty context string.

17

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
