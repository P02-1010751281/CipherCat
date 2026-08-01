# Algorithm 19  BitUnpack(𝑣, 𝑎, 𝑏)

**章节**: §3.2  
**类别**: 比特打包

### 规范

```
Algorithm 19 BitUnpack(𝑣, 𝑎, 𝑏)
Reverses the procedure BitPack.
Input: 𝑎, 𝑏 ∈ ℕ and a byte string 𝑣 of length 32 ⋅ bitlen (𝑎 + 𝑏).
Output: A polynomial 𝑤 ∈ 𝑅 with coefficients in [𝑏 − 2𝑐 + 1, 𝑏], where 𝑐 = bitlen (𝑎 + 𝑏).
When 𝑎 + 𝑏 + 1 is a power of 2, the coefficients are in [−𝑎, 𝑏].
1: 𝑐 ← bitlen (𝑎 + 𝑏)
2: 𝑧 ← BytesToBits(𝑣)
3: for 𝑖 from 0 to 255 do
4:
𝑤𝑖 ← 𝑏 − BitsToInteger((𝑧[𝑖𝑐], 𝑧[𝑖𝑐 + 1], … 𝑧[𝑖𝑐 + 𝑐 − 1]), 𝑐)
5: end for
6: return 𝑤
Algorithms 20 and 21 carry out byte-string-to-polynomial conversions for polynomials with sparse binary
coefficients. In particular, the signing and verification algorithms (Sections 6.2 and 6.3) make use of a “hint,”
which is a vector of polynomials 𝐡 ∈ 𝑅2𝑘 such that the total number of coefficients in 𝐡[0], 𝐡[1], … , 𝐡[𝑘−1]
that are equal to 1 is no more than 𝜔. This constraint enables encoding and decoding procedures that are
more efficient (although more complex) than BitPack and BitUnpack.
HintBitPack (𝐡) outputs a byte string 𝑦 of length 𝜔 + 𝑘. The last 𝑘 bytes of 𝑦 contain information about
how many nonzero coefficients are present in each of the polynomials 𝐡[0], 𝐡[1], … , 𝐡[𝑘 − 1], and the
first 𝜔 bytes of 𝑦 contain information about exactly where those nonzero terms occur. HintBitUnpack
reverses the procedure performed by HintBitPack and recovers the vector 𝐡.

31

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
