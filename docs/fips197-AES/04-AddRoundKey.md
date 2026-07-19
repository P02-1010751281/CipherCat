# AES AddRoundKey (FIPS 197 §5.1.4)

来源: NIST FIPS 197

来源: NIST FIPS 197 — Advanced Encryption Standard
https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf


5.1.4   A DD R OUND K EY()
A DD ROUND K EY() is a transformation of the state in which a round key is combined with the
state by applying the bitwise XOR operation. In particular, each round key consists of four words
from the key schedule (described in Section 5.2), each of which is combined with a column of the
state as follows:

             [s00,c , s01,c , s2,c
                               0
                                   , s03,c ] = [s0,c , s1,c , s2,c , s3,c ] ⊕ [w(4∗round+c) ] for 0 ≤ c < 4   (5.9)

where round is a value in the range 0 ≤ round ≤ Nr, and w[i] is the array of key schedule words
described in Section 5.2. In the specifcation of C IPHER(), A DD ROUND K EY() is invoked Nr + 1
times — once prior to the frst application of the round function (see Alg. 1) and once within each
of the Nr rounds, when 1 ≤ round ≤ Nr.
The action of this transformation is illustrated in Fig. 5, where l = 4 ∗ round. The byte address
within words of the key schedule was described in Sec. 3.5.




                             Figure 5. Illustration of A DD ROUND K EY()


                                                          16
FIPS 197                                                       A DVANCED E NCRYPTION S TANDARD (AES)