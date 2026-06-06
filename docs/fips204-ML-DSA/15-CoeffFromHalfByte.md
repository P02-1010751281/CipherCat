# Algorithm 15  CoeffFromHalfByte(𝑏)

**章节**: §3.2  
**类别**: 系数采样辅助

### 规范

```
Algorithm 15 CoeffFromHalfByte(𝑏)
Let 𝜂 ∈ {2, 4}. Generates an element of {−𝜂, −𝜂 + 1, … , 𝜂} ∪ {⊥}.
Input: Integer 𝑏 ∈ {0, 1, … , 15}.
Output: An integer between −𝜂 and 𝜂, or ⊥.
1: if 𝜂 = 2 and 𝑏 < 15 then return 2 − (𝑏 mod 5)
2: else
3:
if 𝜂 = 4 and 𝑏 < 9 then return 4 − 𝑏
else return ⊥
4:
5:
end if
6: end if

▷ rejection sampling from {−2, … , 2}
▷ rejection sampling from {−4, … , 4}

Algorithms 16–19 efficiently translate an element 𝑤 ∈ 𝑅 into a byte string and vice versa under the
assumption that the coefficients of 𝑤 are in a restricted range. SimpleBitPack assumes that 𝑤𝑖 ∈ [0, 𝑏]
for some positive integer 𝑏 and packs 𝑤 into a byte string of length 32 ⋅ bitlen 𝑏. BitPack allows for the
more general restriction 𝑤𝑖 ∈ [−𝑎, 𝑏]. The BitPack algorithm works by merely subtracting 𝑤 from the
255
polynomial ∑𝑖=0 𝑏𝑋 𝑖 .

```

### CipherCat

尚未实现。
