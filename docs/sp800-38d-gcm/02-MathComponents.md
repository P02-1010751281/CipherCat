# 6.1 Examples of Basic Operations and Functions on Strings
6.1 Examples of Basic Operations and Functions on Strings
In this document, the ‘0’ bit and the ‘1’ bit are indicated in the new courier font to help
distinguish them from the integers 0 and 1.
Given a real number x, the ceiling function, denoted ⎡x⎤, is the least integer that is not less than x.
For example, ⎡2.1⎤ = 3, and ⎡4⎤ = 4.
Given a positive integer s, 0 s denotes the string that consists of s ‘0’ bits. For example, 0 8 =
00000000.
The concatenation operation on bit strings is denoted ||; for example, 001 || 10111 =
00110111.
Given bit strings of equal length, the exclusive-OR (XOR) operation, denoted ⊕, specifies the
addition, modulo 2, of the bits in each bit position, i.e., without carries. For example, 10011 ⊕
10101 = 00110.
10

NIST Special Publication 800-38D
Given a bit string X, the bit length of X is denoted len(X). For example, len(00010)=5.
Given a bit string X and a non-negative integer s such that len(X)≥s, the functions LSB (X) and
s
MSB (X) return the s least significant (i.e., right-most) bits and the s most significant (i.e., left-
s
most) bits, respectively, of X. For example, LSB (111011010) = 010, and
3
MSB (111011010) = 1110.
4
Given a bit string X, the (single) right-shift function, denoted X >> 1, is MSB (0 || X). For
len(X)
example, 0110111 >> 1 = 0011011.
Given a positive integer s and a non-negative integer x that is less than 2s, the integer-to-string
function, denoted [x] , is the binary representation of x as a string of bit length s with the least
s
significant bit on the right. For example, for the (base 10) integer 39, the binary representation
(base 2) is 100111, so [39] = 00100111.
8
Given a (non-empty) bit string X, the string-to-integer function, denoted int(X), is the integer x
such that [x] = X. In other words, int(X) is the non-negative integer less than 2len(X) whose
len(X)
binary representation is X. For example, int(00011010) = 26.
6.2 Incrementing Function
For a positive integer s and a bit string X such that len(X)≥s, let the s-bit incrementing function,
denoted inc (X), be defined as follows:
s
inc (X)=MSB (X) || [int(LSB (X))+1 mod 2s]
s len(X)-s s s
In other words, the function increments the right-most s bits of the string, regarded as the binary
representation of an integer, modulo 2s; the remaining, left-most len(X)-s bits remain unchanged.
6.3 Multiplication Operation on Blocks
Let R be the bit string 11100001 || 0 120. Given two blocks X and Y, Algorithm 1 below
computes a “product” block, denoted X •Y:
Algorithm 1: X •Y
Input:
blocks X, Y.
Output:
block X •Y.
Steps:
1. Let x x ...x denote the sequence of bits in X.
0 1 127
2. Let Z = 0 128 and V = Y.
0 0
3. For i = 0 to 127, calculate blocks Z and V as follows:
i+1 i+1
11

NIST Special Publication 800-38D
⎧ Z if x =0;
Z = ⎨ i i
i+1 ⎩ Z ⊕V if x =1.
i i i
⎧ V >>1 if LSB (V)=0;
i 1 i
V = ⎨
i+1 ⎩ (V >>1 ) ⊕R if LSB (V)=1.
i 1 i
4. Return Z .
128
The • operation on (pairs of) the 2128 possible blocks corresponds to the multiplication operation
for the binary Galois (finite) field of 2128 elements. The fixed block, R, determines a
representation of this field as the modular multiplication of binary polynomials of degree less
than 128. The convention for interpreting strings as polynomials is “little endian”: i.e., if u is
the variable of the polynomial, then the block x x ...x corresponds to the polynomial x + x u +
0 1 127 0 1
x u2 + ... + x u127. The XOR operation is used to add coefficients of “like” terms during the
2 127
multiplication. The reduction modulus is the polynomial of degree 128 that corresponds to R || 1.
Ref. [6] discusses this field in detail.
For a positive integer i, the ith power of a block X with this multiplication operation is denoted
Xi. For example, H2=H•H, H3=H•H•H, etc.
6.4 GHASH Function
Algorithm 2 below specifies the GHASH function:
Algorithm 2: GHASH (X)
H
Prerequisites:
block H, the hash subkey.
Input:
bit string X such that len(X) = 128m for some positive integer m.
Output:
block GHASH (X).
H
Steps:
1. Let X , X , ... , X , X denote the unique sequence of blocks such that X = X || X ||
1 2 m-1 m 1 2
... || X || X .
m-1 m
2. Let Y be the “zero block,” 0 128.
0
3. For i = 1, ..., m, let Y = (Y ⊕ X) • H.
i i-1 i
4. Return Y .
m
In effect, the GHASH function calculates X •Hm ⊕ X •Hm-1 ⊕ ... ⊕ X •H2 ⊕ X •H. Ref. [6]
1 2 m-1 m
describes methods for optimizing implementations of GHASH in both hardware and software.
The GHASH function is illustrated in Figure 1 below, without the zero block, Y , whose
0
exclusive-OR with X does not change X .
1 1
12

NIST Special Publication 800-38D
X
1
X
2
... X
m
⊕ ⊕
• H •H •H
Y
1
Y
2
Y
m
Figure 1: GHASH (X || X || ... || X ) = Y .
H 1 2 m m
6.5 GCTR Function
Algorithm 3 below specifies the GCTR function. The suggested notation does not indicate the
choice of the underlying block cipher.
Algorithm 3: GCTR (ICB, X)
K
Prerequisites:
approved block cipher CIPH with a 128-bit block size;
key K.
Input:
initial counter block ICB;
bit string X, of arbitrary length.
Output:
bit string Y of bit length len(X).
Steps:
1. If X is the empty string, then return the empty string as Y.
2. Let n = ⎡len
(
X
)
128⎤.
3. Let X , X , ... , X , X * denote the unique sequence of bit strings such that
1 2 n-1 n
X = X || X ||...|| X || X∗ ;
1 2 n−1 n
X , X ,..., X are complete blocks.2
1 2 n-1
4. Let CB = ICB.
1
5. For i = 2 to n, let CB = inc (CB ).
i 32 i-1
6. For i =1 to n−1, let Y = X ⊕CIPH
(
CB
)
.
i i K i
7. Let Y∗ = X∗ ⊕MSB (CIPH (CB )).
n n len ( X n ∗) K n
2 Consequently, X * is either a complete block or a nonempty partial block, and if 1 ≤ len(X) ≤128, then X = X *.
n 1
13

NIST Special Publication 800-38D
8. Let Y =Y ||Y ||...||Y∗.
1 2 n
9. Return Y.
In Steps 1 and 2, the input string of arbitrary length is partitioned into a sequence of blocks to the
greatest extent possible, so that only the rightmost string in the sequence may be a “partial”
block. In Steps 3 and 4, the 32-bit incrementing function is iterated on the initial counter block
input to generate a sequence of counter blocks; the input block is the first block of the sequence.
In Steps 5 and 6, the block cipher is applied to the counter blocks and the results are XORed with
the corresponding blocks (or partial block) of the partition of the input string. In Step 7, the
sequence of results is concatenated to form the output.
Figure 2 below illustrates the GCTR function.
ICB inc CB … CB inc CB
2 n-1 n
CIPH CIPH CIPH CIPH
K K K K
X ⊕ X ⊕ X ⊕ X * ⊕
1 2 n-1 n
Y Y … Y Y *
1 2 n-1 n
Figure 2: GCTR (ICB, X || X || ... || X *) = Y || Y || ... || Y *.
K 1 2 n 1 2 n
7 GCM Specification
Algorithms 4 and 5 for the authenticated encryption and authenticated decryption functions of
GCM are specified in Secs. 7.1 and 7.2 below. The specifications include the inputs, the outputs,
the steps of the algorithm, diagrams, and summaries. The suggested notation does not indicate
the choice of the underlying block cipher. The inputs that are typically fixed across many
invocations of the function are called the prerequisites; however, some of the prerequisites may
also be regarded as (varying) input. The prerequisites and the other inputs shall meet the
requirements in Sec. 5.
For both algorithms, equivalent sets of steps that produce the correct output are permitted. For
example, in Algorithm 5, the verification of the tag may precede the computation of the
plaintext.

来源: NIST SP 800-38D — GCM and GMAC
