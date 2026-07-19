# AES — 5.1.3  MIXCOLUMNS()

来源: NIST FIPS 197

5.1.3  MIXCOLUMNS()
MIXCOLUMNS() is a transformation of the state that multiplies each of the four columns of the
state by a single fxed matrix, as described in Section 4.3, with its entries taken from the following
word:
Thus,
0
| ⎢ | s ⎥ | ⎢ 0 1 | 0 2 | 0 3   0 | 1 ⎥   ⎢ s ⎥ |
| --- | ---------- | ------ | ------- | ------- | ------------- | --------------- | --- | ----- |
| ⎢ | 1 , c   ⎥ |  |  |  | 1 , c |
|  |  | =  ⎢ |  |  | ⎥ ⎢ ⎥ | for 0 ≤ c < 4, |  | (5.7) |
| ⎢ | s  0   ⎥ | ⎣ 0  1 | 0 1 | 0 2   0 | 3   ⎦   ⎣s  ⎦ |
| ⎣ | 2 , c   ⎦ |  |  |  | 2 , c |
|  | 0 | 03 | 01 | 01  02 | s |
|  | s |  |  |  | 3,c |
3,c
so that the individual output bytes are defned as follows:
s 0
s 0
Figure 4 illustrates MIXCOLUMNS().
15

FIPS 197 ADVANCED ENCRYPTION STANDARD (AES)
Figure 4. Illustration of MIXCOLUMNS()
5.1.4 ADDROUNDKEY()
ADDROUNDKEY() is a transformation of the state in which a round key is combined with the
state by applying the bitwise XOR operation. In particular, each round key consists of four words
from the key schedule (described in Section 5.2), each of which is combined with a column of the
state as follows:
[s0 ,s0 ,s0 ,s0 ]=[s ,s ,s ,s ] ⊕ [w ] for 0 ≤ c < 4 (5.9)
0,c 1,c 2,c 3,c 0,c 1,c 2,c 3,c (4∗round+c)
where round is a value in the range 0 ≤ round ≤ Nr, and w[i] is the array of key schedule words
described in Section 5.2. In the specifcation of CIPHER(), ADDROUNDKEY() is invoked Nr + 1
times — once prior to the frst application of the round function (see Alg. 1) and once within each
of the Nr rounds, when 1 ≤ round ≤ Nr.
The action of this transformation is illustrated in Fig. 5, where l = 4 ∗ round. The byte address
within words of the key schedule was described in Sec. 3.5.
Figure 5. Illustration of ADDROUNDKEY()
16

FIPS 197  ADVANCED ENCRYPTION STANDARD (AES)
