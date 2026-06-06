# Algorithm 13  BytesToBits(𝑧)

**章节**: §3.2  
**类别**: 整数/比特/字节编码

### 规范

```
Algorithm 13 BytesToBits(𝑧)
Converts a byte string into a bit string using little-endian order.
Input: A byte string 𝑧 of length 𝛼.
Output: A bit string 𝑦 of length 8𝛼.
1: 𝑧 ′ ← 𝑧
2: for 𝑖 from 0 to 𝛼 − 1 do
3:
for 𝑗 from 0 to 7 do
4:
𝑦[8𝑖 + 𝑗] ← 𝑧′ [𝑖] mod 2
5:
𝑧 ′ [𝑖] ← ⌊𝑧 ′ [𝑖]/2⌋
6:
end for
7: end for
8: return 𝑦

▷ convert the byte 𝑧[𝑖] into 8 bits

Algorithms 14 and 15 translate byte strings into coefficients of polynomials in 𝑅. CoeffFromThreeBytes
uses a 3-byte string to either generate an element of {0, 1, … , 𝑞 − 1} or return the blank symbol ⊥.
CoeffFromHalfByte uses an element of {0, 1, … , 15} to either generate an element of {−𝜂, −𝜂+1, … , 𝜂}
or return ⊥. These two procedures will be used in the uniform sampling algorithms RejNTTPoly and
RejBoundedPoly, which are discussed in Section 7.3.

```

### CipherCat

尚未实现。
