# Algorithm 40  UseHint(ℎ, 𝑟)

**章节**: §3.4  
**类别**: 舍入与分解

### 规范

```
Algorithm 40 UseHint(ℎ, 𝑟)
Returns the high bits of 𝑟 adjusted according to hint ℎ.
Input: Boolean ℎ, 𝑟 ∈ ℤ𝑞 .
Output: 𝑟1 ∈ ℤ with 0 ≤ 𝑟1 ≤ 𝑞−1
2𝛾 .
2

1: 𝑚 ← (𝑞 − 1)/(2𝛾2 )
2: (𝑟1 , 𝑟0 ) ← Decompose(𝑟)
3: if ℎ = 1 and 𝑟0 > 0 return (𝑟1 + 1) mod 𝑚
4: if ℎ = 1 and 𝑟0 ≤ 0 return (𝑟1 − 1) mod 𝑚
5: return 𝑟1

41

FIPS 204

7.5

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

NTT and NTT−1

The following algorithms implement the NTT and its inverse (NTT−1 ), which is important for efficiency.
There are other optimizations that are not included in this standard. In particular, mod 𝑞 and mod± 𝑞 are
expensive operations whose use can be minimized by using Montgomery Multiplication (see Appendix A).
An element of 𝑅𝑞 is a polynomial in ℤ𝑞 [𝑋]/(𝑋 256 + 1), and an element of 𝑇𝑞 is a tuple in Π255
𝑗=0 ℤ𝑞 . The
NTT algorithm takes a polynomial 𝑤 ∈ 𝑅𝑞 as input and returns 𝑤̂ ∈ 𝑇𝑞 . NTT−1 takes 𝑤̂ ∈ 𝑇𝑞 as input
and returns 𝑤 such that 𝑤̂ = NTT(𝑤).
This document always distinguishes between elements of 𝑅𝑞 and elements of 𝑇𝑞 . However, the natural
data structure for both of these sets is as an integer array of size 256. This would allow the NTT and
NTT−1 algorithms to perform computation in place on an integer array passed by reference. That
optimization is not included in this document.
In Section 2.5, 𝜁 = 1753 ∈ ℤ𝑞 , which is a 512th root of unity modulo 𝑞. On input 𝑤 ∈ 𝑅𝑞 , the algorithm
outputs
(7.1)
NTT(𝑤) = (𝑤(𝜁0 ), 𝑤(𝜁1 ), … , 𝑤(𝜁255 )) ∈ 𝑇𝑞 ,
where 𝜁𝑖 = 𝑤(𝜁 2BitRev8 (𝑖)+1 ) mod 𝑞.
The values 𝜁 BitRev8 (𝑘) mod 𝑞 for 𝑘 = 1, … , 255 used in line 10 of Algorithms 41 and 42 are pre-computed
into an array zetas[1..255]. The table of zetas is given in Appendix B. If Montgomery Multiplication is used
(see Appendix A), then the zetas array would typically be stored in Montgomery form.
NTT and NTT−1 use BitRev8 , which reverses the order of bits in an 8-bit integer.

42

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
