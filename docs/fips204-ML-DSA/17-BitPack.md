# Algorithm 17  BitPack(𝑤, 𝑎, 𝑏)

**章节**: §3.2  
**类别**: 比特打包

### 规范

```
Algorithm 17 BitPack(𝑤, 𝑎, 𝑏)
Encodes a polynomial 𝑤 into a byte string.
Input: 𝑎, 𝑏 ∈ ℕ and 𝑤 ∈ 𝑅 such that the coefficients of 𝑤 are all in [−𝑎, 𝑏].
Output: A byte string of length 32 ⋅ bitlen (𝑎 + 𝑏).
1: 𝑧 ← ()
▷ set 𝑧 to the empty bit string
2: for 𝑖 from 0 to 255 do
3:
𝑧 ← 𝑧||IntegerToBits(𝑏 − 𝑤𝑖 , bitlen (𝑎 + 𝑏))
4: end for
5: return BitsToBytes(𝑧)
SimpleBitUnpack and BitUnpack are used to decode the byte strings produced by the above functions.
For some choices of 𝑎 and 𝑏, there exist malformed byte strings that will cause SimpleBitUnpack and
BitUnpack to output polynomials whose coefficients are not in the ranges [0, 𝑏] and [−𝑎, 𝑏], respectively.
This can be a concern when running SimpleBitUnpack and BitUnpack on inputs that may come from an
untrusted source.

30

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
