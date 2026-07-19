# SHA-256 Hash Computation (FIPS 180-4 §6.2.2 + §5.3.3)

来源: NIST FIPS 180-4 — Secure Hash Standard
https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf

Message Schedule + Main Loop (64 rounds)


                       5.3.3 SHA-256 ............................................................................................................................. 15
                          6.2.2 SHA-256 Hash Computation .............................................................................................. 22
                6.3       SHA-224 ......................................................................................................................................... 23

                                        6ed9eba1                                20  t  39
                             Kt =                                                                  (4.14)
                                        8f1bbcdc                                40  t  59

                                        ca62c1d6                                60  t  79


4.2.2 SHA-224 and SHA-256 Constants
SHA-224 and SHA-256 use the same sequence of sixty-four constant 32-bit words,
 K 0{256} , K1{256} ,, K 63
                          {256}
                                . These words represent the first thirty-two bits of the fractional parts of
the cube roots of the first sixty-four prime numbers. In hex, these constant words are (from left
to right)

    428a2f98 71374491 b5c0fbcf e9b5dba5 3956c25b 59f111f1 923f82a4 ab1c5ed5
    d807aa98 12835b01 243185be 550c7dc3 72be5d74 80deb1fe 9bdc06a7 c19bf174
    e49b69c1 efbe4786 0fc19dc6 240ca1cc 2de92c6f 4a7484aa 5cb0a9dc 76f988da
    983e5152 a831c66d b00327c8 bf597fc7 c6e00bf3 d5a79147 06ca6351 14292967
    27b70a85 2e1b2138 4d2c6dfc 53380d13 650a7354 766a0abb 81c2c92e 92722c85
    a2bfe8a1 a81a664b c24b8b70 c76c51a3 d192e819 d6990624 f40e3585 106aa070
    19a4c116 1e376c08 2748774c 34b0bcb5 391c0cb3 4ed8aa4a 5b9cca4f 682e6ff3
    748f82ee 78a5636f 84c87814 8cc70208 90befffa a4506ceb bef9a3f7 c67178f2




                                                         11
4.2.3 SHA-384, SHA-512, SHA-512/224 and SHA-512/256 Constants
SHA-384, SHA-512, SHA-512/224 and SHA-512/256 use the same sequence of eighty constant
64-bit words, K 0{512} , K1{512} ,, K 79
                                       {512}
                                             . These words represent the first sixty-four bits of the
fractional parts of the cube roots of the first eighty prime numbers. In hex, these constant words
are (from left to right)

   428a2f98d728ae22 7137449123ef65cd b5c0fbcfec4d3b2f e9b5dba58189dbbc
   3956c25bf348b538 59f111f1b605d019 923f82a4af194f9b ab1c5ed5da6d8118
   d807aa98a3030242 12835b0145706fbe 243185be4ee4b28c 550c7dc3d5ffb4e2
   72be5d74f27b896f 80deb1fe3b1696b1 9bdc06a725c71235 c19bf174cf692694
   e49b69c19ef14ad2 efbe4786384f25e3 0fc19dc68b8cd5b5 240ca1cc77ac9c65
   2de92c6f592b0275 4a7484aa6ea6e483 5cb0a9dcbd41fbd4 76f988da831153b5
   983e5152ee66dfab a831c66d2db43210 b00327c898fb213f bf597fc7beef0ee4
   c6e00bf33da88fc2 d5a79147930aa725 06ca6351e003826f 142929670a0e6e70
   27b70a8546d22ffc 2e1b21385c26c926 4d2c6dfc5ac42aed 53380d139d95b3df
   650a73548baf63de 766a0abb3c77b2a8 81c2c92e47edaee6 92722c851482353b
   a2bfe8a14cf10364 a81a664bbc423001 c24b8b70d0f89791 c76c51a30654be30
   d192e819d6ef5218 d69906245565a910 f40e35855771202a 106aa07032bbd1b8
   19a4c116b8d2d0c8 1e376c085141ab53 2748774cdf8eeb99 34b0bcb5e19b48a8
   391c0cb3c5c95a63 4ed8aa4ae3418acb 5b9cca4f7763e373 682e6ff3d6b2b8a3
   748f82ee5defb2fc 78a5636f43172f60 84c87814a1f0ab72 8cc702081a6439ec
   90befffa23631e28 a4506cebde82bde9 bef9a3f7b2c67915 c67178f2e372532b
   ca273eceea26619c d186b8c721c0c207 eada7dd6cde0eb1e f57d4f7fee6ed178
   06f067aa72176fba 0a637dc5a2c898a6 113f9804bef90dae 1b710b35131c471b
   28db77f523047d84 32caab7b40c72493 3c9ebe0a15c9bebc 431d67c49c100d4c
   4cc5d4becb3e42b6 597f299cfc657e2a 5fcb6fab3ad6faec 6c44198c4a475817




                                                 12
5.       PREPROCESSING
Preprocessing consists of three steps: padding the message, M (Sec. 5.1), parsing the message
into message blocks (Sec. 5.2), and setting the initial hash value, H(0) (Sec. 5.3).

5.1      Padding the Message
The purpose of this padding is to ensure that the padded message is a multiple of 512 or 1024
bits, depending on the algorithm. Padding can be inserted before hash computation begins on a
message, or at any other time during the hash computation prior to processing the block(s) that
will contain the padding.

5.1.1 SHA-1, SHA-224 and SHA-256
Suppose that the length of the message, M, is  bits. Append the bit “1” to the end of the
message, followed by k zero bits, where k is the smallest, non-negative solution to the equation
  1  k  448 mod 512 . Then append the 64-bit block that is equal to the number  expressed
using a binary representation. For example, the (8-bit ASCII) message “abc” has length
8  3  24 , so the message is padded with a one bit, then 448  (24  1)  423 zero bits, and then
the message length, to become the 512-bit padded message
                                                             423            64
                                                                    
            01100001 01100010 01100011 1 00…00 00…011000
                                                              
                 “a”           “b”           “c”                               24


The length of the padded message should now be a multiple of 512 bits.

5.1.2 SHA-384, SHA-512, SHA-512/224 and SHA-512/256
Suppose the length of the message M, in bits, is  bits. Append the bit “1” to the end of the
message, followed by k zero bits, where k is the smallest non-negative solution to the equation
  1  k  896 mod 1024 . Then append the 128-bit block that is equal to the number  expressed
using a binary representation. For example, the (8-bit ASCII) message “abc” has length
8  3  24 , so the message is padded with a one bit, then 896  (24  1)  871 zero bits, and then
the message length, to become the 1024-bit padded message
                                                            871             128
                                                                   
            01100001 01100010 01100011 1 00…00 00…011000
                                                              
                 “a”           “b”           “c”                               24

The length of the padded message should now be a multiple of 1024 bits.




                                                13
5.2        Parsing the Message
The message and its padding must be parsed into N m-bit blocks.

5.2.1 SHA-1, SHA-224 and SHA-256
