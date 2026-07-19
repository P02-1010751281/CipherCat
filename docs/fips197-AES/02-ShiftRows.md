# AES — 5.1.2 SHIFTROWS()

来源: NIST FIPS 197

5.1.2 SHIFTROWS()
SHIFTROWS() is a transformation of the state in which the bytes in the last three rows of the state
are cyclically shifted. The number of positions by which the bytes are shifted depends on the row
index r, as follows:
s 0 = s for0 ≤ r < 4 and 0 ≤ c < 4. (5.5)
r,c r,(c+r) mod4
SHIFTROWS() is illustrated in Figure 3. In that representation of the state, the effect is to move
each byte by r positions to the left in the row, cycling the left-most r bytes around to the right end
of the row. The frst row, where r = 0, is unchanged.
14

FIPS 197  ADVANCED ENCRYPTION STANDARD (AES)
Figure 3. Illustration of SHIFTROWS()
