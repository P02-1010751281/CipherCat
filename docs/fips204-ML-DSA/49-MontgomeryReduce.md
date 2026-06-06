# Algorithm 49  MontgomeryReduce(𝑎)

**章节**: §3.1  
**类别**: Montgomery 约简

### 规范

```
Algorithm 49 MontgomeryReduce(𝑎)
Computes 𝑎 ⋅ 2−32 mod 𝑞.
Input: Integer 𝑎 with −231 𝑞 ≤ 𝑎 ≤ 231 𝑞.
Output: 𝑟 ≡ 𝑎 ⋅ 2−32 mod 𝑞.
1: QINV ← 58728449
2: 𝑡 ← ((𝑎 mod 232 ) ⋅ QINV) mod 232
3: 𝑟 ← (𝑎 − 𝑡 ⋅ 𝑞)/232
4: return 𝑟

▷ the inverse of 𝑞 modulo 232

With this algorithm, the modular product of 𝑎 and 𝑏 is 𝑐 = MontgomeryReduce(𝑎 ⋅ 𝑏), where 𝑎, 𝑏, and 𝑐
are in Montgomery form. The return value of the algorithm is not necessarily less than 𝑞 in absolute value,
but it is less than 2𝑞 in absolute value. This is not a concern in practice since the objective of Montgomery
Multiplication is to efficiently work with modular values that fit in a 32-bit register. If necessary, the result
can be normalized to an integer in (−𝑞, 𝑞) using a comparison and an integer addition.
Converting an integer modulo 𝑞 to Montgomery form by multiplying by 232 modulo 𝑞 is an expensive
operation. When a sequence of modular operations is to be performed, the operands are converted once
to Montgomery form. The operations are then performed, and the factor 232 is extracted from the final
result.

13

This section does not distinguish between different versions of the “mod” operator. There are three such versions
of “𝑥 = 𝑎 modulo 𝑞”: i) 𝑥 ∈ [0, 𝑞 − 1]; ii) 𝑥 ∈ [−⌈𝑞/2⌉, ⌊𝑞/2⌋] ; iii) 𝑥 ∈ [−𝑞 + 1, 𝑞 − 1]. The last version
corresponds to the ‶ %″ operator in most programming languages.

50

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

Appendix B — Zetas Array
The values 𝜁 BitRev8 (𝑘) mod 𝑞 for 𝑘 = 1, … , 255 used in the NTT Algorithms 41 and 42 may be pre-computed
and stored in an array zetas[1..255]. This table of zetas is given below.
zetas[0..255] = {
0,

4808194,

3765607,

3761513,

5178923,

5496691,

5234739,

5178987,

7778734,

3542485,

2682288,

2129892,

3764867,

7375178,

557458,

7159240,

5010068,

4317364,

2663378,

6705802,

4855975,

7946292,

```

### CipherCat

尚未实现。
