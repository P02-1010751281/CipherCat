# Algorithm 43  BitRev8 (𝑚)

**章节**: §3.5  
**类别**: NTT 运算

### 规范

```
Algorithm 43 BitRev8 (𝑚)
Transforms a byte by reversing the order of bits in its 8-bit binary expansion.
Input: A byte 𝑚 ∈ [0, 255].
Output: A byte 𝑟 ∈ [0, 255].
1: 𝑏 ← IntegerToBits(𝑚, 8)
2: 𝑏rev ∈ {0, 1}8 ← (0, … , 0)
3: for 𝑖 from 0 to 7 do
4:
𝑏rev [𝑖] ← 𝑏 [7 − 𝑖]
5: end for
6: 𝑟 ← BitsToInteger(𝑏rev , 8)
7: return r
44

FIPS 204

7.6

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

Arithmetic Under NTT

The NTT converts elements of the ring 𝑅𝑞 (where addition and multiplication are denoted by + and ⋅,
respectively) into elements of the ring 𝑇𝑞 (where addition and multiplication are denoted by + and ∘,
respectively). This section gives explicit algorithms for linear algebra over the ring 𝑇𝑞 .
The ring 𝑇𝑞 is defined to be the direct product ring Π255
𝑖=0 ℤ𝑞 . Thus, an element 𝑎 ̂ ∈ 𝑇𝑞 is an array of length
256, and its elements are denoted by 𝑎[0],
̂ 𝑎[1],
̂ … , 𝑎[255]
̂
∈ ℤ𝑞 .

```

### CipherCat

尚未实现。
