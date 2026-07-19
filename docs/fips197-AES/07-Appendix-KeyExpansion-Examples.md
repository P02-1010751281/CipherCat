# AES Key Expansion Examples (FIPS 197 Appendix A)

来源: NIST FIPS 197 — Advanced Encryption Standard
https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf


Appendix A — Key Expansion Examples
This appendix shows the development of the key schedule for each key size. Note that multi-byte
values are presented using the notation described in Sec. 3. The intermediate values produced
during the development of the key schedule (see Sec. 5.2) are given in the following table (all
values are in hexadecimal format with the exception of the index column (i)).

A.1       Expansion of a 128-bit Key
This section contains the key expansion of the following key:
          Key = 2b 7e 15 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c
for Nk = 4, which results in

 w0 = 2b7e1516            w1 = 28aed2a6               w2 = abf71588              w3 = 09cf4f3c


                                                                                            w[i] =
    i                     After            After        Rcon[i/Nk] After XOR   w[i − Nk]
             temp                                                                           temp ⊕
  (dec)               R O T W O R D () S U B W O R D ()            with Rcon
                                                                                           w[i − Nk]

      4    09cf4f3c   cf4f3c09      8a84eb01      01000000      8b84eb01       2b7e1516 a0fafe17
      5    a0fafe17                                                            28aed2a6 88542cb1
      6    88542cb1                                                            abf71588 23a33939
      7    23a33939                                                            09cf4f3c 2a6c7605
      8    2a6c7605   6c76052a      50386be5      02000000      52386be5       a0fafe17 f2c295f2
      9    f2c295f2                                                            88542cb1 7a96b943
    10     7a96b943                                                            23a33939 5935807a
    11     5935807a                                                            2a6c7605 7359f67f
    12     7359f67f   59f67f73      cb42d28f      04000000      cf42d28f       f2c295f2 3d80477d
    13     3d80477d                                                            7a96b943 4716fe3e
    14     4716fe3e                                                            5935807a 1e237e44
    15     1e237e44                                                            7359f67f 6d7a883b
    16     6d7a883b   7a883b6d      dac4e23c      08000000      d2c4e23c       3d80477d ef44a541
    17     ef44a541                                                            4716fe3e a8525b7f
    18     a8525b7f                                                            1e237e44 b671253b
    19     b671253b                                                            6d7a883b db0bad00
    20     db0bad00   0bad00db      2b9563b9      10000000      3b9563b9       ef44a541 d4d1c6f8

    21     d4d1c6f8                                                            a8525b7f 7c839d87
    22     7c839d87                                                            b671253b caf2b8bc
    23     caf2b8bc                                                            db0bad00 11f915bc

                                                 29
FIPS 197                                               A DVANCED E NCRYPTION S TANDARD (AES)


    24     11f915bc   f915bc11      99596582      20000000      b9596582       d4d1c6f8 6d88a37a
    25     6d88a37a                                                            7c839d87 110b3efd
    26     110b3efd                                                            caf2b8bc dbf98641
    27     dbf98641                                                            11f915bc ca0093fd
    28     ca0093fd   0093fdca      63dc5474      40000000      23dc5474       6d88a37a 4e54f70e
    29     4e54f70e                                                            110b3efd 5f5fc9f3
    30     5f5fc9f3                                                            dbf98641 84a64fb2
    31     84a64fb2                                                            ca0093fd 4ea6dc4f
    32     4ea6dc4f   a6dc4f4e      2486842f      80000000      a486842f       4e54f70e ead27321
    33     ead27321                                                            5f5fc9f3 b58dbad2
    34     b58dbad2                                                            84a64fb2 312bf560
    35     312bf560                                                            4ea6dc4f 7f8d292f
    36     7f8d292f   8d292f7f      5da515d2      1b000000      46a515d2       ead27321 ac7766f3
    37     ac7766f3                                                            b58dbad2 19fadc21
    38     19fadc21                                                            312bf560 28d12941
    39     28d12941                                                            7f8d292f 575c006e
    40     575c006e   5c006e57      4a639f5b      36000000      7c639f5b       ac7766f3 d014f9a8

    41     d014f9a8                                                            19fadc21 c9ee2589
    42     c9ee2589                                                            28d12941 e13f0cc8
    43     e13f0cc8                                                            575c006e b6630ca6



A.2       Expansion of a 192-bit Key
This section contains the key expansion of the following key:

                Key =      8e 73 b0 f7 da 0e 64 52 c8 10 f3 2b
                           80 90 79 e5 62 f8 ea d2 52 2c 6b 7b
for Nk = 6, which results in

              w0 = 8e73b0f7             w1 = da0e6452              w2 = c810f32b
              w3 = 809079e5             w4 = 62f8ead2              w5 = 522c6b7b


                                                                                            w[i] =
    i                    After             After        Rcon[i/Nk] After XOR   w[i − Nk]
             temp                                                                           temp ⊕
  (dec)               R O T W O R D () S U B W O R D ()            with Rcon
                                                                                           w[i − Nk]

      6    522c6b7b   2c6b7b52      717f2100      01000000      707f2100       8e73b0f7 fe0c91f7
      7    fe0c91f7                                                            da0e6452 2402f5a5
      8    2402f5a5                                                            c810f32b ec12068e
                                                 30
FIPS 197                                      A DVANCED E NCRYPTION S TANDARD (AES)


   9    ec12068e                                               809079e5 6c827f6b
   10   6c827f6b                                               62f8ead2 0e7a95b9

   11   0e7a95b9                                               522c6b7b 5c56fec2
   12   5c56fec2   56fec25c   b1bb254a   02000000   b3bb254a   fe0c91f7 4db7b4bd
   13   4db7b4bd                                               2402f5a5 69b54118
   14   69b54118                                               ec12068e 85a74796
   15   85a74796                                               6c827f6b e92538fd
   16   e92538fd                                               0e7a95b9 e75fad44
   17   e75fad44                                               5c56fec2 bb095386
   18   bb095386   095386bb   01ed44ea   04000000   05ed44ea   4db7b4bd 485af057
   19   485af057                                               69b54118 21efb14f
   20   21efb14f                                               85a74796 a448f6d9

   21   a448f6d9                                               e92538fd 4d6dce24
   22   4d6dce24                                               e75fad44 aa326360
   23   aa326360                                               bb095386 113b30e6
   24   113b30e6   3b30e611   e2048e82   08000000   ea048e82   485af057 a25e7ed5
   25   a25e7ed5                                               21efb14f 83b1cf9a
   26   83b1cf9a                                               a448f6d9 27f93943
   27   27f93943                                               4d6dce24 6a94f767
   28   6a94f767                                               aa326360 c0a69407
   29   c0a69407                                               113b30e6 d19da4e1
   30   d19da4e1   9da4e1d1   5e49f83e   10000000   4e49f83e   a25e7ed5 ec1786eb

   31   ec1786eb                                               83b1cf9a 6fa64971
   32   6fa64971                                               27f93943 485f7032
   33   485f7032                                               6a94f767 22cb8755
   34   22cb8755                                               c0a69407 e26d1352
   35   e26d1352                                               d19da4e1 33f0b7b3
   36   33f0b7b3   f0b7b333   8ca96dc3   20000000   aca96dc3   ec1786eb 40beeb28
   37   40beeb28                                               6fa64971 2f18a259
   38   2f18a259                                               485f7032 6747d26b
   39   6747d26b                                               22cb8755 458c553e
   40   458c553e                                               e26d1352 a7e1466c

   41   a7e1466c                                               33f0b7b3 9411f1df
   42   9411f1df   11f1df94   82a19e22   40000000   c2a19e22   40beeb28 821f750a
   43   821f750a                                               2f18a259 ad07d753


                                         31
FIPS 197                                               A DVANCED E NCRYPTION S TANDARD (AES)


    44     ad07d753                                                            6747d26b ca400538
    45     ca400538                                                            458c553e 8fcc5006
    46     8fcc5006                                                            a7e1466c 282d166a
    47     282d166a                                                            9411f1df bc3ce7b5
    48     bc3ce7b5    3ce7b5bc     eb94d565      80000000      6b94d565       821f750a e98ba06f
    49     e98ba06f                                                            ad07d753 448c773c
    50     448c773c                                                            ca400538 8ecc7204

    51     8ecc7204                                                            8fcc5006 01002202



A.3       Expansion of a 256-bit Key
This section contains the key expansion of the following key:

          Key =     60 3d eb 10 15 ca 71 be 2b 73 ae f0 85 7d 77 81
                    1f 35 2c 07 3b 61 08 d7 2d 98 10 a3 09 14 df f4
for Nk = 8, which results in

 w0 = 603deb10            w1 = 15ca71be               w2 = 2b73aef0              w3 = 857d7781
 w4 = 1f352c07            w5 = 3b6108d7               w6 = 2d9810a3              w7 = 0914dff4


    i                                      After                                            w[i] =
             temp         After                         Rcon[i/Nk] After XOR   w[i − Nk]    temp ⊕
  (dec)               R O T W O R D () S U B W O R D ()            with Rcon               w[i − Nk]

      8    0914dff4    14dff409     fa9ebf01      01000000      fb9ebf01       603deb10 9ba35411
      9    9ba35411                                                            15ca71be 8e6925af
    10     8e6925af                                                            2b73aef0 a51a8b5f

    11     a51a8b5f                                                            857d7781 2067fcde
    12     2067fcde                 b785b01d                                   1f352c07 a8b09c1a
    13     a8b09c1a                                                            3b6108d7 93d194cd
    14     93d194cd                                                            2d9810a3 be49846e
    15     be49846e                                                            0914dff4 b75d5b9a
    16     b75d5b9a    5d5b9ab7     4c39b8a9      02000000      4e39b8a9       9ba35411 d59aecb8
    17     d59aecb8                                                            8e6925af 5bf3c917
    18     5bf3c917                                                            a51a8b5f fee94248
    19     fee94248                                                            2067fcde de8ebe96
    20     de8ebe96                 1d19ae90                                   a8b09c1a b5a9328a

    21     b5a9328a                                                            93d194cd 2678a647
    22     2678a647                                                            be49846e 98312229

                                                 32
FIPS 197                                      A DVANCED E NCRYPTION S TANDARD (AES)


   23   98312229                                               b75d5b9a 2f6c79b3
   24   2f6c79b3   6c79b32f   50b66d15   04000000   54b66d15   d59aecb8 812c81ad
   25   812c81ad                                               5bf3c917 dadf48ba
   26   dadf48ba                                               fee94248 24360af2
   27   24360af2                                               de8ebe96 fab8b464
   28   fab8b464              2d6c8d43                         b5a9328a 98c5bfc9
   29   98c5bfc9                                               2678a647 bebd198e
   30   bebd198e                                               98312229 268c3ba7

   31   268c3ba7                                               2f6c79b3 09e04214
   32   09e04214   e0421409   e12cfa01   08000000   e92cfa01   812c81ad 68007bac
   33   68007bac                                               dadf48ba b2df3316
   34   b2df3316                                               24360af2 96e939e4
   35   96e939e4                                               fab8b464 6c518d80
   36   6c518d80              50d15dcd                         98c5bfc9 c814e204
   37   c814e204                                               bebd198e 76a9fb8a
   38   76a9fb8a                                               268c3ba7 5025c02d
   39   5025c02d                                               09e04214 59c58239
   40   59c58239   c5823959   a61312cb   10000000   b61312cb   68007bac de136967

   41   de136967                                               b2df3316 6ccc5a71
   42   6ccc5a71                                               96e939e4 fa256395
   43   fa256395                                               6c518d80 9674ee15
   44   9674ee15              90922859                         c814e204 5886ca5d
   45   5886ca5d                                               76a9fb8a 2e2f31d7
   46   2e2f31d7                                               5025c02d 7e0af1fa
   47   7e0af1fa                                               59c58239 27cf73c3
   48   27cf73c3   cf73c327   8a8f2ecc   20000000   aa8f2ecc   de136967 749c47ab
   49   749c47ab                                               6ccc5a71 18501dda
   50   18501dda                                               fa256395 e2757e4f

   51   e2757e4f                                               9674ee15 7401905a
   52   7401905a              927c60be                         5886ca5d cafaaae3
   53   cafaaae3                                               2e2f31d7 e4d59b34
   54   e4d59b34                                               7e0af1fa 9adf6ace
   55   9adf6ace                                               27cf73c3 bd10190d
   56   bd10190d   10190dbd   cad4d77a   40000000   8ad4d77a   749c47ab fe4890d1
   57   fe4890d1                                               18501dda e6188d0b
   58   e6188d0b                                               e2757e4f 046df344
   59   046df344                                               7401905a 706c631e


                                         33
FIPS 197                                                     A DVANCED E NCRYPTION S TANDARD (AES)


Appendix B — Cipher Example
The following diagram shows the values in the state array as the cipher progresses for a block
length and a key length of 16 bytes each (i.e., Nb = 4 and Nk = 4).

       Input     = 32 43 f6 a8 88 5a 30 8d 31 31 98 a2 e0 37 07 34
       Key       = 2b 7e 15 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c

The Round Key values are taken from the Key Expansion example in Appendix A.1.

 Round      Start of              After               After                After             Round Key
Number       Round              SubBytes            ShiftRows           MixColumns             Value


           32   88   31   e0                                                                2b   28   ab   09
           43   5a   31   37                                                                7e   ae   f7   cf
 input
           f6   30   98   07                                                                15   d2   15   4f
           a8   8d   a2   34                                                                16   a6   88   3c


           19   a0   9a   e9   d4   e0   b8   1e   d4   e0    b8   1e   04   e0   48   28   a0   88   23   2a
           3d   f4   c6   f8   27   bf   b4   41   bf   b4    41   27   66   cb   f8   06   fa   54   a3   6c
   1
           e3   e2   8d   48   11   98   5d   52   5d   52    11   98   81   19   d3   26   fe   2c   39   76
           be   2b   2a   08   ae   f1   e5   30   30   ae    f1   e5   e5   9a   7a   4c   17   b1   39   05


           a4 68 6b 02         49   45   7f   77   49   45    7f   77   58   1b   db   1b   f2   7a   59   73
           9c 9f 5b 6a         de   db   39   02   db   39    02   de   4d   4b   e7   6b   c2   96   35   59
   2
           7f 35 ea 50         d2   96   87   53   87   53    d2   96   ca   5a   ca   b0   95   b9   80   f6
           f2 2b 43 49         89   f1   1a   3b   3b   89    f1   1a   f1   ac   a8   e5   f2   43   7a   7f


           aa   61   82   68   ac   ef   13   45   ac   ef    13   45   75   20   53   bb   3d   47   1e   6d
           8f   dd   d2   32   73   c1   b5   23   c1   b5    23   73   ec   0b   c0   25   80   16   23   7a
   3
           5f   e3   4a   46   cf   11   d6   5a   d6   5a    cf   11   09   63   cf   d0   47   fe   7e   88
           03   ef   d2   9a   7b   df   b5   b8   b8   7b    df   b5   93   33   7c   dc   7d   3e   44   3b


           48   67   4d   d6   52   85   e3   f6   52   85    e3   f6   0f   60   6f   5e   ef   a8   b6   db
           6c   1d   e3   5f   50   a4   11   cf   a4   11    cf   50   d6   31   c0   b3   44   52   71   0b
   4
           4e   9d   b1   58   2f   5e   c8   6a   c8   6a    2f   5e   da   38   10   13   a5   5b   25   ad
           ee   0d   38   e7   28   d7   07   94   94   28    d7   07   a9   bf   6b   01   41   7f   3b   00


           e0   c8   d9   85   e1   e8   35   97   e1 e8 35 97          25   bd   b6   4c   d4   7c   ca   11
           92   63   b1   b8   4f   fb   c8   6c   fb c8 6c 4f          d1   11   3a   4c   d1   83   f2   f9
   5
           7f   63   35   be   d2   fb   96   ae   96 ae d2 fb          a9   d1   33   c0   c6   9d   b8   15
           e8   c0   50   01   9b   ba   53   7c   7c 9b ba 53          ad   68   8e   b0   f8   87   bc   bc


                                                    34
FIPS 197                                                      A DVANCED E NCRYPTION S TANDARD (AES)


           f1   c1   7c   5d   a1   78   10   4c   a1   78     10   4c   4b   2c   33   37   6d   11   db   ca
           00   92   c8   b5   63   4f   e8   d5   4f   e8     d5   63   86   4a   9d   d2   88   0b   f9   00
  6
           6f   4c   8b   d5   a8   29   3d   03   3d   03     a8   29   8d   89   f4   18   a3   3e   86   93
           55   ef   32   0c   fc   df   23   fe   fe   fc     df   23   6d   80   e8   d8   7a   fd   41   fd


           26   3d   e8   fd   f7   27   9b   54   f7    27    9b 54     14   46   27   34   4e   5f   84   4e
           0e   41   64   d2   ab   83   43   b5   83    43    b5 ab     15   16   46   2a   54   5f   a6   a6
  7
           2e   b7   72   8b   31   a9   40   3d   40    3d    31 a9     b5   15   56   d8   f7   c9   4f   dc
           17   7d   a9   25   f0   ff   d3   3f   3f    f0    ff d3     bf   ec   d7   43   0e   f3   b2   4f


           5a   19   a3   7a   be   d4   0a   da   be   d4     0a   da   00   b1   54   fa   ea   b5   31   7f
           41   49   e0   8c   83   3b   e1   64   3b   e1     64   83   51   c8   76   1b   d2   8d   2b   8d
  8
           42   dc   19   04   2c   86   d4   f2   d4   f2     2c   86   2f   89   6d   99   73   ba   f5   29
           b1   1f   65   0c   c8   c0   4d   fe   fe   c8     c0   4d   d1   ff   cd   ea   21   d2   60   2f


           ea   04   65   85   87 f2 4d 97         87   f2     4d   97   47   40   a3   4c   ac   19   28   57
           83   45   5d   96   ec 6e 4c 90         6e   4c     90   ec   37   d4   70   9f   77   fa   d1   5c
  9
           5c   33   98   b0   4a c3 46 e7         46   e7     4a   c3   94   e4   3a   42   66   dc   29   00
           f0   2d   ad   c5   8c d8 95 a6         a6   8c     d8   95   ed   a5   a6   bc   f3   21   41   6e


           eb   59   8b   1b   e9   cb   3d   af   e9   cb     3d   af                       d0   c9   e1   b6
           40   2e   a1   c3   09   31   32   2e   31   32     2e   09                       14   ee   3f   63
  10
           f2   38   13   42   89   07   7d   2c   7d   2c     89   07                       f9   25   0c   0c
           1e   84   e7   d2   72   5f   94   b5   b5   72     5f   94                       a8   89   c8   a6


           39 02 dc 19
           25 dc 11 6a
output
           84 09 85 0b
           1d fb 97 32




                                                    35
FIPS 197                                        A DVANCED E NCRYPTION S TANDARD (AES)


Appendix C — Example Vectors
The NIST Computer Security Resource Center provides a website with “examples with interme-
diate values” for AES [8].




                                           36
FIPS 197                                              A DVANCED E NCRYPTION S TANDARD (AES)


Appendix D — Change Log (Informative)
The original FIPS 197 (November 26, 2001) was reviewed and updated under the auspices of
NIST’s Crypto Publication Review Board [9]. Public comments and analyses of the security of
the AES that are described in NIST IR 8319 [10] were the basis for the decision to maintain the
technical specifcations of the Standard.
The following is a summary of the editorial changes to the original FIPS 197 in the May 9, 2023
update, NIST FIPS 197-upd1:
   1. The formatting of many elements of the publication was improved, and the text was revised
      for clarity.
   2. The following items were added to the front matter: title page, foreword, abstract, and
      keywords. Offcials’ names and affliations on the title page refect the original publication.
   3. The announcement sections were updated to refect current statutes, regulations, standards,
      guidelines, and validation programs.
   4. Section 1 was revised to 1) add and update references to the AES development effort and 2)
      explicitly name AES-128, AES-192, and AES-256.
   5. The material in the previous Section 2.2 (Algorithm Parameters, Symbols and Functions)
      was split into two new sections: 2.2 (List of Functions) and 2.3 (Algorithm Parameters and
      Symbols).
   6. The terms, functions, and symbols from the specifcations are comprehensively included in
      the lists in Sections 2.1–2.3.
   7. The description of the indexing convention was removed from Section 3.1.
   8. Table 1 was revised, and the text in the previous Section 3.2 on the polynomial interpretation
      of bytes was revised and moved to Section 4.
   9. A general defnition of the indexing of byte sequences was added to Section 3.3 before
      specializing to the example of a block, and Table 2 was revised.
 10. The heading for Section 3.5 was changed to focus on word arrays, and notation for them
     was included in the text. The column words of the state were presented in a vertical format,
     with an improved description of the indices.
 11. A reference for additional information on fnite felds [4] was included in a footnote within
     Section 4, and the headings for Sections 4.1 and 4.2 were revised to explicitly mention
     GF(28 ).
 12. Section 4.2 was revised to provide an explicit, general description of fnite feld multiplica-
     tion. The previous Section 4.2.1 was incorporated into the revised Section 4.2 by replacing
     the original example of modular polynomial reduction with an illustration of fnite feld
     multiplication using xtime.
 13. The heading of Section 4.3 was revised to focus on multiplication by a fxed matrix, and the
     text of the section was simplifed by removing the secondary interpretation as polynomial


                                                37
FIPS 197                                            A DVANCED E NCRYPTION S TANDARD (AES)


     reduction. The descriptions of M IX C OLUMNS() and I NV M IX C OLUMNS() in Sections 5.1.3
     and 5.3.3 were revised accordingly, to refer back to this construction.
 14. The text on multiplicative inverses in GF(28 ) from the previous Section 4.2 was revised
     and moved to the new Section 4.4.
 15. The discussion of the algorithm specifcations in Section 5 was expanded to elaborate on the
     relationships among its components. A new brief explanation of Nb as a Rijndael parameter
     enabled the replacement of Nb with its constant value 4 in the rest of the Standard.
 16. The pseudocode for the cipher, the key expansion routine, and the inverse cipher in Sections
     5.1, 5.2, and 5.3 was reformatted, and some of the text in these sections was revised for
     clarity.
 17. The descriptions of S HIFT ROWS() in Section 5.1.2 and I NV S HIFT ROWS() in Section 5.3.2
     were improved, and a mistake in the latter was corrected.
 18. Illustrations of the three instances of K EY E XPANSION() in the new Figs. 6, 7, and 8 were
     added to Section 5.2. The text in the section was also revised, including an explicit display
     of the round constants in the new Fig. 5.
 19. A separate algorithm for the modifed key expansion routine for the equivalent inverse
     cipher was added to Section 5.3.5 instead of only the supplementary lines. The description
     of the equivalent inverse cipher was simplifed in favor of the citation of an updated
     reference [3].
 20. Section 6.2 was revised to include a reference to NIST Special Publication 800-133,
     Rev. 2 [6].
 21. Section 6.4 was revised to expand the discussion of implementation attacks.
 22. The References section is no longer labeled as an appendix. The references were updated
     to replace withdrawn publications and correct citation information and URLs.
 23. The examples in Appendix C were removed in favor of a reference to the detailed example
     vectors that are now maintained at [8].
 24. Appendix D was created to summarize the changes in this update to FIPS 197.




                                               38
