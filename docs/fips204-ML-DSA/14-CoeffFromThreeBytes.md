# Algorithm 14  CoeffFromThreeBytes(𝑏0 , 𝑏1 , 𝑏2 )

**章节**: §3.2  
**类别**: 系数采样辅助

### 规范

```
Algorithm 14 CoeffFromThreeBytes(𝑏0 , 𝑏1 , 𝑏2 )
Generates an element of {0, 1, 2, … , 𝑞 − 1} ∪ {⊥}.
Input: Bytes 𝑏0 , 𝑏1 , 𝑏2 .
Output: An integer modulo 𝑞 or ⊥.
1: 𝑏2′ ← 𝑏2
2: if 𝑏2′ > 127 then
3:
𝑏2′ ← 𝑏2′ − 128
4: end if
5: 𝑧 ← 216 ⋅ 𝑏2′ + 28 ⋅ 𝑏1 + 𝑏0
6: if 𝑧 < 𝑞 then return 𝑧
7: else return ⊥
8: end if

▷ set the top bit of 𝑏2′ to zero
▷ 0 ≤ 𝑧 ≤ 223 − 1
▷ rejection sampling

29

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
