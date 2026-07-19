# AES GF(2⁸) Multiplication (FIPS 197)

来源: NIST FIPS 197

来源: FIPS 197 §4

4.     Mathematical Preliminaries

For some transformations of the AES algorithms specified in Sec. 5, each byte in the state array
is interpreted as one of the 256 elements of a finite field, also known as a Galois Field, denoted
by GF(2⁸).
In order to define addition and multiplication in GF(2⁸), each byte {b7 b6 b5 b4 b3 b2 b1 b0 } is
interpreted as a polynomial, denoted by b(x), as follows:

                     b(x) = b7 x⁷ + b6 x⁶ + b5 x⁵ + b4 x⁴ + b3 x³ + b2 x² + b1 x + b0 .                      (4.1)

For example, {01100011} is represented by the polynomial x⁶ + x⁵ + x + 1.

## 4.1 Addition in GF(2⁸)

In order to add two elements in the finite field GF(2⁸), the coefficients of the polynomials that
represent the elements are added modulo 2 (i.e., with the exclusive-OR operation, denoted by ⊕),
so that 1 ⊕ 1 = 0, 1 ⊕ 0 = 1, and 0 ⊕ 0 = 0.
Equivalently, two bytes can be added by applying the exclusive-OR operation to each pair of corre-
sponding bits in the bytes. Thus, the sum of {a7 a6 a5 a4 a3 a2 a1 a0 } and {b7 b6 b5 b4 b3 b2 b1 b0 }
is {a7 ⊕ b7 a6 ⊕ b6 a5 ⊕ b5 a4 ⊕ b4 a3 ⊕ b3 a2 ⊕ b2 a1 ⊕ b1 a0 ⊕ b0 }. (In Section 5.1.4, this
definition is extended to words.)
For example, the following three representations of addition are equivalent:


       (x⁶ + x⁴ + x² + x + 1) + (x⁷ + x + 1) = x⁷ + x⁶ + x⁴ + x²                      (polynomial)
       {01010111} ⊕ {10000011} = {11010100}                                                (binary)          (4.2)
       {57} ⊕ {83} = {d4}                                                           (hexadecimal).

Because the coefficients of the polynomials are reduced modulo 2, the coefficient 1 is equivalent
to the coefficient –1, so addition is equivalent to subtraction. For example, x⁴ + x² represents the
same finite field element as x⁴ − x² , −x⁴ + x² , and −x⁴ − x² . Similarly, the sum of any element
with itself is the zero element.

## 4.2 Multiplication in GF(2⁸)

The symbol • denotes multiplication in GF(2⁸). Conceptually, this multiplication is defined
on two bytes in two steps: 1) the two polynomials that represent the bytes are multiplied as
polynomials, and 2) the resulting polynomial is reduced modulo the following fixed polynomial:

                                        m(x) = x⁸ + x⁴ + x³ + x + 1.                                         (4.3)

Within both steps, the individual coefficients of the polynomials are reduced modulo 2.

Thus, if b(x) and c(x) represent bytes b and c, then b • c is represented by the following modular
reduction of their product as polynomials:

                                       b(x)c(x)     mod m(x).                                    (4.4)

The modular reduction by m(x) may be applied to intermediate steps in the calculation of b(x)c(x);
consequently, it is useful to consider the special case that c(x) = x (i.e., c = {02}). In particular,
the product b • {02} can be expressed as a function of b, denoted by XTimes(b), as follows:

                           (
                            {b6 b5 b4 b3 b2 b1 b0 0}                            if b7 = 0
            XTimes(b) =                                                                       (4.5)
                            {b6 b5 b4 b3 b2 b1 b0 0} ⊕ {0 0 0 1 1 0 1 1}        if b7 = 1.

Multiplication by higher powers of x (such as {04}, {08}, and {10}) can be implemented by the
repeated application of XTimes(). For example, let b = {57}:


                              {57} • {01} = {57}
                              {57} • {02} = XTimes({57}) = {ae}
                              {57} • {04} = XTimes({ae}) = {47}
                              {57} • {08} = XTimes({47}) = {8e}
                                                                                                 (4.6)
                              {57} • {10} = XTimes({8e}) = {07}
                              {57} • {20} = XTimes({07}) = {0e}
                              {57} • {40} = XTimes({0e}) = {1c}
                              {57} • {80} = XTimes({1c}) = {38}.

These products facilitate the computation of any multiple of {57}. For example, because {13} =
{10} ⊕ {02} ⊕ {01}, it follows that

                           {57} • {13} = {57} • ({01} ⊕ {02} ⊕ {10})
                                       = {57} ⊕ {ae} ⊕ {07}                                      (4.7)
                                       = {fe}.

## 4.3 Multiplication of Words by a Fixed Matrix

Two transformations – MixColumns() and InvMixColumns() – in the algorithms for the
AES block ciphers can be expressed in terms of matrix multiplication. In particular, a distinct
fixed matrix is specified for each transformation. For both matrices, each of the 16 entries of the
matrix is a byte of a single specified word, denoted here by [a0 , a1 , a2 , a3 ].
Given an input word [b0 , b1 , b2 , b3 ] to the transformation, the output word [d0 , d1 , d2 , d3 ] is
determined by finite field arithmetic as follows:

                         d0 = (a0 • b0 ) ⊕ (a3 • b1 ) ⊕ (a2 • b2 ) ⊕ (a1 • b3 )
                         d1 = (a1 • b0 ) ⊕ (a0 • b1 ) ⊕ (a3 • b2 ) ⊕ (a2 • b3 )
                                                                                              (4.8)
                         d2 = (a2 • b0 ) ⊕ (a1 • b1 ) ⊕ (a0 • b2 ) ⊕ (a3 • b3 )
                         d3 = (a3 • b0 ) ⊕ (a2 • b1 ) ⊕ (a1 • b2 ) ⊕ (a0 • b3 ).

The matrix form of Eq. (4.8) is

                                ⎡ ⎤ ⎡                          ⎤⎡ ⎤
                                 d0    a0        a3    a2   a1 b0
                                ⎢d1 ⎥ ⎢a1        a0    a3      ⎥ ⎢b1 ⎥ .
                                                            a2 ⎥ ⎢ ⎥
                                ⎢ ⎥=⎢                                                         (4.9)
                                ⎣d2 ⎦ ⎣a2        a1    a0   a3 ⎣b2 ⎦
                                                               ⎦
                                 d3    a3        a2    a1   a0 b3

## 4.4 Multiplicative Inverses in GF(2⁸)

For a byte b 6= {00}, its multiplicative inverse is the unique byte, denoted by b−1 , such that

                                           b • b−1 = {01}.                                   (4.10)

The definition of the SubBytes() transformation in the specifications of the AES block cipher
involves multiplicative inverses in GF(2⁸), which can be calculated as follows:

                                             b−1 = b²⁵⁴.                                    (4.11)

Alternatively, let b(x) be the polynomial that represents b. The extended Euclidean algorithm [5]
can be applied to b(x) and m(x) to find polynomials a(x) and c(x) such that

                                     b(x)a(x) + m(x)c(x) = 1.                                (4.12)

It follows that a(x) is the polynomial that represents b−1 .