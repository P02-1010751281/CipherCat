# AES — 5.1.1  SUBBYTES()

来源: NIST FIPS 197

5.1.1  SUBBYTES()
SUBBYTES() is an invertible, non-linear transformation of the state in which a substitution table,
called an S-box, is applied independently to each byte in the state. The AES S-box is denoted by
SBOX().
Let b denote an input byte to SBOX(), and let c denote the constant byte {01100011}. The
0
output byte b = SBOX(b) is constructed by composing the following two transformations:
1. Defne an intermediate value b˜, as follows, where b−1 is the multiplicative inverse of b, as
described in Section 4.4:

b˜ = { b⁻¹  if b ≠ 0        (5.2)
     { 0     if b = 0

2. Apply the following affne transformation of the bits of b˜ to produce the bits of b 0
:

b′ᵢ = b̃ᵢ ⊕ b̃₍ᵢ₊₄₎ mod 8 ⊕ b̃₍ᵢ₊₅₎ mod 8 ⊕ b̃₍ᵢ₊₆₎ mod 8 ⊕ b̃₍ᵢ₊₇₎ mod 8 ⊕ cᵢ  (5.3)

其中 c = {01100011}，cᵢ 为 c 的第 i 位。

The matrix form of Eq. (5.3) is given by Eq. (5.4) below:

| b′₀ |   | 1 0 0 0 1 1 1 1 |   | b̃₀ |   | 1 |
| b′₁ |   | 1 1 0 0 0 1 1 1 |   | b̃₁ |   | 1 |
| b′₂ |   | 1 1 1 0 0 0 1 1 |   | b̃₂ |   | 0 |
| b′₃ | = | 1 1 1 1 0 0 0 1 | · | b̃₃ | ⊕ | 0 |   (5.4)
| b′₄ |   | 1 1 1 1 1 0 0 0 |   | b̃₄ |   | 0 |
| b′₅ |   | 0 1 1 1 1 1 0 0 |   | b̃₅ |   | 1 |
| b′₆ |   | 0 0 1 1 1 1 1 0 |   | b̃₆ |   | 1 |
| b′₇ |   | 0 0 0 1 1 1 1 1 |   | b̃₇ |   | 0 |
Figure 2. Illustration of SUBBYTES()
The AES S-box is presented in hexadecimal form in Table 4. For example, if s = {53}, then
r,c
13

FIPS 197 ADVANCED ENCRYPTION STANDARD (AES)
Table 4. SBOX(): substitution values for the byte xy (in hexadecimal format)
y
0 1 2 3 4 5 6 7 8 9 a b c d e f
0 63 7c 77 7b f2 6b 6f c5 30 01 67 2b fe d7 ab 76
1 ca 82 c9 7d fa 59 47 f0 ad d4 a2 af 9c a4 72 c0
2 b7 fd 93 26 36 3f f7 cc 34 a5 e5 f1 71 d8 31 15
3 04 c7 23 c3 18 96 05 9a 07 12 80 e2 eb 27 b2 75
4 09 83 2c 1a 1b 6e 5a a0 52 3b d6 b3 29 e3 2f 84
5 53 d1 00 ed 20 fc b1 5b 6a cb be 39 4a 4c 58 cf
6 d0 ef aa fb 43 4d 33 85 45 f9 02 7f 50 3c 9f a8
x 7 51 a3 40 8f 92 9d 38 f5 bc b6 da 21 10 ff f3 d2
8 cd 0c 13 ec 5f 97 44 17 c4 a7 7e 3d 64 5d 19 73
9 60 81 4f dc 22 2a 90 88 46 ee b8 14 de 5e 0b db
a e0 32 3a 0a 49 06 24 5c c2 d3 ac 62 91 95 e4 79
b e7 c8 37 6d 8d d5 4e a9 6c 56 f4 ea 65 7a ae 08
c ba 78 25 2e 1c a6 b4 c6 e8 dd 74 1f 4b bd 8b 8a
d 70 3e b5 66 48 03 f6 0e 61 35 57 b9 86 c1 1d 9e
e e1 f8 98 11 69 d9 8e 94 9b 1e 87 e9 ce 55 28 df
f 8c a1 89 0d bf e6 42 68 41 99 2d 0f b0 54 bb 16
the substitution value would be determined by the intersection of the row with index ‘5’ and the
column with index ‘3’ in Table 4, so that s0 = {ed}.
r,c
