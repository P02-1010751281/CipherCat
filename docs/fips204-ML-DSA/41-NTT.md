# Algorithm 41  NTT(𝑤)

**章节**: §3.5  
**类别**: NTT 运算

### 规范

```
Algorithm 41 NTT(𝑤)
Computes the NTT.
255

Input: Polynomial 𝑤(𝑋) = ∑𝑗=0 𝑤𝑗 𝑋 𝑗 ∈ 𝑅𝑞 .
Output: 𝑤̂ = (𝑤[0],
̂
… , 𝑤[255])
̂
∈ 𝑇𝑞 .
1: for 𝑗 from 0 to 255 do
2:
𝑤[𝑗]
̂ ← 𝑤𝑗
3: end for
4: 𝑚 ← 0
5: 𝑙𝑒𝑛 ← 128
6: while 𝑙𝑒𝑛 ≥ 1 do
7:
𝑠𝑡𝑎𝑟𝑡 ← 0
8:
while 𝑠𝑡𝑎𝑟𝑡 < 256 do
9:
𝑚←𝑚+1
10:
𝑧 ← zetas[𝑚]
11:
for 𝑗 from 𝑠𝑡𝑎𝑟𝑡 to 𝑠𝑡𝑎𝑟𝑡 + 𝑙𝑒𝑛 − 1 do
12:
𝑡 ← (𝑧 ⋅ 𝑤[𝑗
̂ + 𝑙𝑒𝑛]) mod 𝑞
13:
𝑤[𝑗
̂ + 𝑙𝑒𝑛] ← (𝑤[𝑗]
̂ − 𝑡) mod 𝑞
14:
𝑤[𝑗]
̂ ← (𝑤[𝑗]
̂ + 𝑡) mod 𝑞
15:
end for
16:
𝑠𝑡𝑎𝑟𝑡 ← 𝑠𝑡𝑎𝑟𝑡 + 2 ⋅ 𝑙𝑒𝑛
17:
end while
18:
𝑙𝑒𝑛 ← ⌊𝑙𝑒𝑛/2⌋
19: end while
20: return 𝑤̂

43

▷ 𝑧 ← 𝜁 BitRev8 (𝑚) mod 𝑞

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
