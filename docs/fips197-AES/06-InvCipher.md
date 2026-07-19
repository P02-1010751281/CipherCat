# AES Inverse Cipher (FIPS 197 §5.3)

含 InvShiftRows, InvSubBytes, InvMixColumns, EqInvCipher

来源: NIST FIPS 197 — Advanced Encryption Standard
https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf


5.3     I NV C IPHER()
To implement I NV C IPHER(), the transformations in the specifcation of C IPHER() (Section 5.1)
are inverted and executed in reverse order. The inverted transformations of the state — denoted
by I NV S HIFT ROWS(), I NV S UB B YTES(), I NV M IX C OLUMNS(), and A DD ROUND K EY() — are
described in Sections 5.3.1–5.3.4.
I NV C IPHER() is described in the pseudocode in Alg. 3, where the array w denotes the key
schedule, as described in Section 5.2.




                                              18
FIPS 197                                        A DVANCED E NCRYPTION S TANDARD (AES)




Figure 6. K EY E XPANSION() of AES-128 to generate the words w[i] for 4 ≤ i < 44, where l
ranges over the multiples of 4 between 0 and 36




                                           19
FIPS 197                                        A DVANCED E NCRYPTION S TANDARD (AES)




Figure 7. K EY E XPANSION() of AES-192 to generate the words w[i] for 6 ≤ i < 52, where l
ranges over the multiples of 6 between 0 and 42




                                           20
FIPS 197                                        A DVANCED E NCRYPTION S TANDARD (AES)




Figure 8. K EY E XPANSION() of AES-256 to generate the words w[i] for 8 ≤ i < 60, where l
ranges over the multiples of 8 between 0 and 48




                                           21
FIPS 197                                              A DVANCED E NCRYPTION S TANDARD (AES)



    Algorithm 3 Pseudocode for I NV C IPHER()
     1: procedure I NV C IPHER(in, Nr, w)
     2:    state ← in                                                . See Sec. 3.4
     3:    state ← A DD ROUND K EY(state, w[4 ∗ Nr..4 ∗ Nr + 3])     . See Sec. 5.1.4
     4:    for round from Nr − 1 downto 1 do
     5:        state ← I NV S HIFT ROWS(state)                       . See Sec. 5.3.1
     6:        state ← I NV S UB B YTES(state)                       . See Sec. 5.3.2
     7:        state ← A DD ROUND K EY(state, w[4 ∗ round..4 ∗ round + 3])
     8:        state ← I NV M IX C OLUMNS(state)                     . See Sec. 5.3.3
     9:    end for
    10:    state ← I NV S HIFT ROWS(state)
    11:    state ← I NV S UB B YTES(state)
    12:    state ← A DD ROUND K EY(state, w[0..3])
    13:    return state
    14: end procedure


5.3.1   I NV S HIFT R OWS()
I NV S HIFT ROWS() is the inverse of the S HIFT ROWS(). In particular, the bytes in the last three
rows of the state are cyclically shifted as follows:

                       s0r,c = sr,(c−r) mod 4   for 0 ≤ r < 4 and 0 ≤ c < 4.                 (5.12)

I NV S HIFT ROWS() is illustrated in Figure 9. In that representation of the state, the effect is to
move each byte by r positions to the right in the row, cycling the right-most r bytes around to the
left end of the row. The frst row, where r = 0, is unchanged.




                                                 22
FIPS 197                                               A DVANCED E NCRYPTION S TANDARD (AES)




                            Figure 9. Illustration of I NV S HIFT ROWS()


5.3.2    I NV S UB B YTES()
I NV S UB B YTES() is the inverse of S UB B YTES(), in which the inverse of SB OX(), denoted by
I NV SB OX(), is applied to each byte of the state. I NV SB OX() is derived from Table 4 by switching
the roles of inputs and outputs, as presented in Table 6:

     Table 6. I NV SB OX(): substitution values for the byte xy (in hexadecimal format)

                                                       y
              0    1    2      3   4    5    6     7       8    9    a    b    c    d    e    f
         0   52   09   6a     d5   30   36   a5   38       bf   40   a3   9e   81   f3   d7   fb
         1   7c   e3   39     82   9b   2f   ff   87       34   8e   43   44   c4   de   e9   cb
         2   54   7b   94     32   a6   c2   23   3d       ee   4c   95   0b   42   fa   c3   4e
         3   08   2e   a1     66   28   d9   24   b2       76   5b   a2   49   6d   8b   d1   25
         4   72   f8   f6     64   86   68   98   16       d4   a4   5c   cc   5d   65   b6   92
         5   6c   70   48     50   fd   ed   b9   da       5e   15   46   57   a7   8d   9d   84
         6   90   d8   ab     00   8c   bc   d3   0a       f7   e4   58   05   b8   b3   45   06
         7   d0   2c   1e     8f   ca   3f   0f   02       c1   af   bd   03   01   13   8a   6b
     x
         8   3a   91   11     41   4f   67   dc   ea       97   f2   cf   ce   f0   b4   e6   73
         9   96   ac   74     22   e7   ad   35   85       e2   f9   37   e8   1c   75   df   6e
         a   47   f1   1a     71   1d   29   c5   89       6f   b7   62   0e   aa   18   be   1b
         b   fc   56   3e     4b   c6   d2   79   20       9a   db   c0   fe   78   cd   5a   f4
         c   1f   dd   a8     33   88   07   c7   31       b1   12   10   59   27   80   ec   5f
         d   60   51   7f     a9   19   b5   4a   0d       2d   e5   7a   9f   93   c9   9c   ef
         e   a0   e0   3b     4d   ae   2a   f5   b0       c8   eb   bb   3c   83   53   99   61
         f   17   2b   04     7e   ba   77   d6   26       e1   69   14   63   55   21   0c   7d



                                                  23
FIPS 197                                                  A DVANCED E NCRYPTION S TANDARD (AES)


5.3.3   I NV M IX C OLUMNS()
I NV M IX C OLUMNS() is the inverse of M IX C OLUMNS(). In particular, I NV M IX C OLUMNS()
multiplies each of the four columns of the state by a single fxed matrix, as described in Section 4.3,
with its entries taken from the following word:

                             [a0 , a1 , a2 , a3 ] = [{0e}, {09}, {0d}, {0b}].                  (5.13)

Thus,                 ⎡0 ⎤ ⎡                          ⎤⎡ ⎤
                       s0,c     0e       0b    0d   09 s0,c
                      ⎢s01,c ⎥ ⎢09       0e    0b     ⎥ ⎢s1,c ⎥
                                                    0d⎥ ⎢ ⎥
                      ⎢ 0 ⎥=⎢
                      ⎣s2,c ⎦ ⎣0d                                    for 0 ≤ c < 4.            (5.14)
                                         09    0e   0b⎦ ⎣s2,c ⎦
                       s03,c    0b       0d    09   0e s3,c

As a result of this matrix multiplication, the four bytes in a column are replaced by the following:

                 s00,c = ({0e} • s0,c ) ⊕ ({0b} • s1,c ) ⊕ ({0d} • s2,c ) ⊕ ({09} • s3,c )
                 s01,c = ({09} • s0,c ) ⊕ ({0e} • s1,c ) ⊕ ({0b} • s2,c ) ⊕ ({0d} • s3,c )
                                                                                               (5.15)
                 s02,c = ({0d} • s0,c ) ⊕ ({09} • s1,c ) ⊕ ({0e} • s2,c ) ⊕ ({0b} • s3,c )
                 s03,c = ({0b} • s0,c ) ⊕ ({0d} • s1,c ) ⊕ ({09} • s2,c ) ⊕ ({0e} • s3,c ).

5.3.4   Inverse of A DD R OUND K EY()
A DD ROUND K EY(), described in Section 5.1.4, is its own inverse.

5.3.5   E Q I NV C IPHER()
Several properties of the AES algorithm allow for an alternative specifcation of the inverse of
C IPHER(), called the equivalent inverse cipher, denoted by E Q I NV C IPHER(). In the specifcation
of E Q I NV C IPHER(), the transformations of the round function of the cipher in Alg. 1 are directly
replaced by their inverses in E Q I NV C IPHER(), in the same order. The effciency of this structure
in comparison to the specifcation of I NV C IPHER() in Alg. 3 is explained in the Rijndael proposal
document [2].
The pseudocode for the equivalent inverse cipher, given in Alg. 4, uses a modifed key schedule,
denoted by the word array dw. The routine to generate dw is an extension of K EY E XPANSION(),
denoted by K EY E XPANSION EIC(), whose pseudocode is given in Alg. 5.




                                                    24
FIPS 197                                            A DVANCED E NCRYPTION S TANDARD (AES)


    Algorithm 4 Pseudocode for E Q I NV C IPHER()
     1: procedure E Q I NV C IPHER(in, Nr, dw)
     2:    state ← in
     3:    state ← A DD ROUND K EY(state, dw[4 ∗ Nr..4 ∗ Nr + 3])
     4:    for round from Nr − 1 downto 1 do
     5:        state ← I NV S UB B YTES(state)
     6:        state ← I NV S HIFT ROWS(state)
     7:        state ← I NV M IX C OLUMNS(state)
     8:        state ← A DD ROUND K EY(state, dw[4 ∗ round..4 ∗ round + 3])
     9:    end for
    10:    state ← I NV S UB B YTES(state)
    11:    state ← I NV S HIFT ROWS(state)
    12:    state ← A DD ROUND K EY(state, dw[0..3])
    13:    return state
    14: end procedure



    Algorithm 5 Pseudocode for K EY E XPANSION EIC()
     1: procedure K EY E XPANSION EIC(key)
     2:    i←0
     3:    while i ≤ Nk − 1 do
     4:        w[i] ← key[4i..4i + 3]
     5:        dw[i] ← w[i]
     6:        i ← i+1
     7:    end while                                . When the loop concludes, i = Nk.
     8:    while i ≤ 4 ∗ Nr + 3 do
     9:        temp ← w[i − 1]
    10:        if i mod Nk = 0 then
    11:             temp ← S UB W ORD(ROT W ORD(temp)) ⊕ Rcon[i/Nk]
    12:        else if Nk > 6 and i mod Nk = 4 then
    13:             temp ← S UB W ORD(temp)
    14:        end if
    15:        w[i] ← w[i − Nk] ⊕ temp
    16:        dw[i] ← w[i]
    17:        i ← i+1
    18:    end while
    19:    for round from 1 to Nr − 1 do
    20:        i ← 4 ∗ round
    21:        dw[i..i + 3] ← I NV M IX C OLUMNS(dw[i..i + 3]) . Note change of type.
    22:    end for
    23:    return dw
    24: end procedure

The frst and last round keys in dw are the same as in w; the modifcation of the other round keys
is described in Lines 19–22. The comment in Line 21 refers to the input to I NV M IX C OLUMNS():
the one-dimensional array of words is converted to a two-dimensional array of bytes, as in Fig. 1.
                                               25
FIPS 197                                             A DVANCED E NCRYPTION S TANDARD (AES)



6.    Implementation Considerations
6.1    Key Length Requirements
An implementation of the AES algorithm shall support at least one of the three key lengths
specifed in Sec. 5: 128, 192, or 256 bits (i.e., Nk = 4, 6, or 8, respectively). Implementations
may optionally support two or three key lengths, which may promote the interoperability of
algorithm implementations.

6.2    Keying Restrictions
When a cryptographic key has been generated appropriately (see NIST Special Publication 800-
133, Rev. 2 [6] for guidelines), no restriction is imposed when the resulting key is used for the
AES algorithm.

6.3    Parameter Extensions
In Table 3, this Standard explicitly defnes the allowed values for the key length (Nk), block
size (Nb), and number of rounds (Nr). However, future revisions of this Standard could include
changes or additions to the allowed values for those parameters. Therefore, implementers may
choose to design their AES implementations with future fexibility in mind.

6.4    Implementation Suggestions Regarding Various Platforms
Implementation variations are possible that may, in many cases, offer performance or other
advantages. Given the same input key and data (plaintext or ciphertext), any implementation that
produces the same output (ciphertext or plaintext) as the algorithm specifed in this Standard is an
equivalent implementation of the AES algorithm.
The AES proposal document [2] and other resources located on the AES page [7] include
suggestions on how to effciently implement the AES algorithm on a variety of platforms.
Suggested implementations are intended to explain the inner workings of the AES algorithm but
do not provide protection against various implementation attacks.
A physical implementation may leak key-dependent information through side channels, such
as the time taken to perform a computation, or when faults are injected into the computation.
When such attacks are non-invasive, they can be effective even when there are mechanisms to
detect physical tampering of the device. For example, cache-timing attacks may affect AES
implementations on software platforms that use a cache to accelerate the access to data from main
memory.
Protecting implementations of the AES algorithm against implementation attacks where applicable
should be considered. Such considerations are outside of the scope of this document but are taken
into account when testing for conformance to the algorithm in this Standard according to the
validation program developed by NIST (see https://nist.gov/cmvp).




                                                26
FIPS 197                                             A DVANCED E NCRYPTION S TANDARD (AES)


6.5    Modes of Operation
Block cipher modes of operation are cryptographic functions that feature a block cipher to provide
information services, such as confdentiality and authentication. NIST-recommended modes of
operation are specifed in the 800-38 series of NIST Special Publications. Further information is
available at https://csrc.nist.gov/Projects/block-cipher-techniques/BCM.




                                               27
FIPS 197                                            A DVANCED E NCRYPTION S TANDARD (AES)


References
 [1] James Nechvatal, Elaine Barker, Lawrence Bassham, William Burr, Morris Dworkin, James
     Foti, and Edward Roback. Report on the Development of the Advanced Encryption Standard
     (AES). Journal of Research of NIST (NIST JRES), May 2001. https://doi.org/10.6028/jres.
     106.023.
 [2] Joan Daemen and Vincent Rijmen.                 AES Proposal:       Rijndael Document
     Version 2.         AES Algorithm Submission, September 1999.               Available at
     https://csrc.nist.gov/csrc/media/projects/cryptographic-standards-and-guidelines/
     documents/aes-development/rijndael-ammended.pdf.
 [3] Joan Daemen and Vincent Rijmen. The Design of Rijndael - The Advanced Encryption
     Standard (AES), Second Edition. Information Security and Cryptography. Springer, 2020.
     https://doi.org/10.1007/978-3-662-60769-5.
 [4] Michael Artin. Algebra. Pearson Modern Classic. Pearson, second edition, 2017.
 [5] Alfred J. Menezes, Scott A. Vanstone, and Paul C. Van Oorschot. Handbook of Applied Cryp-
     tography. CRC Press, Inc., USA, 1st edition, 1997. https://doi.org/10.1201/9780429466335.
 [6] Elaine Barker, Allen Roginsky, and Richard Davis. Recommendation for Cryptographic
     Key Generation. (National Institute of Standards and Technology, Gaithersburg, MD), NIST
     Special Publication (SP) 800-133, Rev. 2, June 2020. https://doi.org/10.6028/NIST.SP.
     800-133r2.
 [7] National Institute of Standards and Technology. AES Development, 2022. Available at
     https://csrc.nist.gov/projects/aes.
 [8] National Institute of Standards and Technology. Cryptographic Standards and Guide-
     lines: Examples with Intermediate Values, 2022. Available at https://csrc.nist.gov/projects/
     cryptographic-standards-and-guidelines/example-values.
 [9] National Institute of Standards and Technology. Crypto Publications Review Board, 2022.
     Available at https://csrc.nist.gov/projects/crypto-publication-review-project.
[10] Nicky Mouha. Review of the Advanced Encryption Standard. (National Institute of
     Standards and Technology, Gaithersburg, MD), NIST Interagency Report (IR) 8319. https:
     //doi.org/10.6028/NIST.IR.8319.




                                              28
FIPS 197                                               A DVANCED E NCRYPTION S TANDARD (AES)


