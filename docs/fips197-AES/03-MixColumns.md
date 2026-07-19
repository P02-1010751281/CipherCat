# AES MixColumns (FIPS 197 §5.1.3)

来源: NIST FIPS 197 — Advanced Encryption Standard
https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf


5.1.3   M IX C OLUMNS()
M IX C OLUMNS() is a transformation of the state that multiplies each of the four columns of the
state by a single fxed matrix, as described in Section 4.3, with its entries taken from the following
word:
                            [a0 , a1 , a2 , a3 ] = [{02}, {01}, {01}, {03}].                     (5.6)

Thus,
                      ⎡0 ⎤ ⎡
                       s0,c
                                                     ⎤⎡ ⎤
                               02       03   01    01 s0,c
                      ⎢s0 ⎥ ⎢
                      ⎢ 1,c ⎥ ⎢01       02   03      ⎥ ⎢s1,c ⎥
                                                   01⎥ ⎢ ⎥
                      ⎢ 0 ⎥=⎣                                      for 0 ≤ c < 4,               (5.7)
                      ⎣s2,c ⎦  01       01   02    03⎦ ⎣s2,c ⎦
                        0      03       01   01    02 s3,c
                       s3,c

so that the individual output bytes are defned as follows:

                          s00,c = ({02} • s0,c ) ⊕ ({03} • s1,c ) ⊕ s2,c ⊕ s3,c
                          s01,c = s0,c ⊕ ({02} • s1,c ) ⊕ ({03} • s2,c ) ⊕ s3,c
                           0                                                                    (5.8)
                          s2,c = s0,c ⊕ s1,c ⊕ ({02} • s2,c ) ⊕ ({03} • s3,c )
                          s03,c = ({03} • s0,c ) ⊕ s1,c ⊕ s2,c ⊕ ({02} • s3,c ).

Figure 4 illustrates M IX C OLUMNS().




                                                   15
FIPS 197                                                         A DVANCED E NCRYPTION S TANDARD (AES)




                              Figure 4. Illustration of M IX C OLUMNS()


