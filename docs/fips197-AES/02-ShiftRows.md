# AES ShiftRows (FIPS 197 §5.1.2)

来源: NIST FIPS 197 — Advanced Encryption Standard
https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf


5.1.2       S HIFT R OWS()
S HIFT ROWS() is a transformation of the state in which the bytes in the last three rows of the state
are cyclically shifted. The number of positions by which the bytes are shifted depends on the row
index r, as follows:

                        s0r,c = sr,(c+r) mod 4        for 0 ≤ r < 4 and 0 ≤ c < 4.                      (5.5)

S HIFT ROWS() is illustrated in Figure 3. In that representation of the state, the effect is to move
each byte by r positions to the left in the row, cycling the left-most r bytes around to the right end
of the row. The frst row, where r = 0, is unchanged.




                                                       14
FIPS 197                                                 A DVANCED E NCRYPTION S TANDARD (AES)




                             Figure 3. Illustration of S HIFT ROWS()


