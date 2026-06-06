# Algorithm 20  HintBitPack(𝐡)

**章节**: §3.2  
**类别**: 比特打包

### 规范

```
Algorithm 20 HintBitPack(𝐡)
Encodes a polynomial vector 𝐡 with binary coefficients into a byte string.
Input: A polynomial vector 𝐡 ∈ 𝑅2𝑘 such that the polynomials 𝐡[0], 𝐡[1],...,𝐡[𝑘 − 1] have
collectively at most 𝜔 nonzero coefficients.
Output: A byte string 𝑦 of length 𝜔 + 𝑘 that encodes 𝐡 as described above.
1: 𝑦 ∈ 𝔹𝜔+𝑘 ← 0𝜔+𝑘
2: Index ← 0
▷ Index for writing the first 𝜔 bytes of 𝑦
3: for 𝑖 from 0 to 𝑘 − 1 do
▷ look at 𝐡[𝑖]
4:
for 𝑗 from 0 to 255 do
5:
if 𝐡[𝑖]𝑗 ≠ 0 then
6:
𝑦[Index] ← 𝑗
▷ store the locations of the nonzero coefficients in 𝐡[𝑖]
7:
Index ← Index + 1
8:
end if
9:
end for
10:
𝑦[𝜔 + 𝑖] ← Index
▷ after processing 𝐡[𝑖], store the value of Index
11: end for
12: return 𝑦
```

### CipherCat

尚未实现。
