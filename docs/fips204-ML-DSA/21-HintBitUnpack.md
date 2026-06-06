# Algorithm 21  HintBitUnpack(𝑦)

**章节**: §3.2  
**类别**: 比特打包

### 规范

```
Algorithm 21 HintBitUnpack(𝑦)
Reverses the procedure HintBitPack.
Input: A byte string 𝑦 of length 𝜔 + 𝑘 that encodes 𝐡 as described above.
Output: A polynomial vector 𝐡 ∈ 𝑅2𝑘 or ⊥.
1: 𝐡 ∈ 𝑅2𝑘 ← 0𝑘
2: Index ← 0
▷ Index for reading the first 𝜔 bytes of 𝑦
3: for 𝑖 from 0 to 𝑘 − 1 do
▷ reconstruct 𝐡[𝑖]
4:
if 𝑦[𝜔 + 𝑖] < Index or 𝑦[𝜔 + 𝑖] > 𝜔 then return ⊥
▷ malformed input
5:
end if
6:
First ← Index
7:
while Index < 𝑦[𝜔 + 𝑖] do
▷ 𝑦[𝜔 + 𝑖] says how far one can advance Index
8:
if Index > First then
9:
if 𝑦[Index − 1] ≥ 𝑦[Index] then return ⊥
▷ malformed input
10:
end if
11:
end if
12:
𝐡[𝑖]𝑦[Index] ← 1
▷ 𝑦[Index] says which coefficient in 𝐡[𝑖] should be 1
13:
Index ← Index + 1
14:
end while
15: end for
16: for 𝑖 from Index to 𝜔 − 1 do
▷ read any leftover bytes in the first 𝜔 bytes of 𝑦
17:
if 𝑦[𝑖] ≠ 0 then return ⊥
▷ malformed input
18:
end if
19: end for
20: return 𝐡
32

FIPS 204

7.2

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

Encodings of ML-DSA Keys and Signatures

Algorithms 22–27 translate keys and signatures for ML-DSA into byte strings. These procedures take
certain sequences of algebraic objects, encode them consecutively into byte strings, and perform the
respective decoding procedures.
First, pkEncode and pkDecode translate ML-DSA public keys into byte strings and vice versa. When
verifying a signature, pkDecode might be run on an input that comes from an untrusted source. Thus,
care is required when using SimpleBitUnpack. As used here, SimpleBitUnpack always returns values in
the correct range.

```

### CipherCat

尚未实现。
