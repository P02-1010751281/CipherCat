# 研究材料原文提取参考

> 本页是仓库内 PDF 的可搜索证据层，由 pdftotext -layout 重新提取生成。它保留原文中的章节线索、公式、伪代码、函数定义、表格和测试向量；断行和版式异常必须回看同目录 PDF，不把本页单独当作认证依据。
>
> 面向用户的解释、实现映射和证据边界见同目录的 README.md 与结构化页面；本页不替代结构化参考页。

## 对应本地 PDF

- [SEC 2 v2.0](./ecc-sec2/sec2-v2.pdf)
- [The Rijndael Block Cipher / AES Proposal](./rijndael-gf/rijndael-ammended.pdf)

## 原文提取：papers__ecc-sec2__sec2-v2

> 对应提取源标识：papers__ecc-sec2__sec2-v2
>
> 对应 PDF：[sec2-v2.pdf](./ecc-sec2/sec2-v2.pdf)

~~~text

                 Standards for Efficient Cryptography




SEC 2: Recommended Elliptic Curve Domain Parameters

                                    Certicom Research
            Contact: Daniel R. L. Brown (dbrown@certicom.com)

                                     January 27, 2010
                                       Version 2.0



                                     c 2010 Certicom Corp.
  License to copy this document is granted provided it is identified as “Standards for Efficient
             Cryptography 2 (SEC 2)”, in all material mentioning or referencing it.
SEC 2 (Draft) Ver. 2.0

Contents
1 Introduction                                                                                           1
   1.1   Overview . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .     1
   1.2   Compliance . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       1
   1.3   Document Evolution . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         1
   1.4   Intellectual Property . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .      1
   1.5   Organization    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .    1

2 Recommended Elliptic Curve Domain Parameters over Fp                                                   3
   2.1   Properties of Elliptic Curve Domain Parameters over Fp          . . . . . . . . . . . . . . .    3
   2.2   Recommended 192-bit Elliptic Curve Domain Parameters over Fp . . . . . . . . . .                 6
         2.2.1   Recommended Parameters secp192k1 . . . . . . . . . . . . . . . . . . . . . .             6
         2.2.2   Recommended Parameters secp192r1 . . . . . . . . . . . . . . . . . . . . . .             6
   2.3   Recommended 224-bit Elliptic Curve Domain Parameters over Fp . . . . . . . . . .                 7
         2.3.1   Recommended Parameters secp224k1 . . . . . . . . . . . . . . . . . . . . . .             7
         2.3.2   Recommended Parameters secp224r1 . . . . . . . . . . . . . . . . . . . . . .             8
   2.4   Recommended 256-bit Elliptic Curve Domain Parameters over Fp . . . . . . . . . .                 9
         2.4.1   Recommended Parameters secp256k1 . . . . . . . . . . . . . . . . . . . . . .             9
         2.4.2   Recommended Parameters secp256r1 . . . . . . . . . . . . . . . . . . . . . .             9
   2.5   Recommended 384-bit Elliptic Curve Domain Parameters over Fp . . . . . . . . . . 10
         2.5.1   Recommended Parameters secp384r1 . . . . . . . . . . . . . . . . . . . . . . 10
   2.6   Recommended 521-bit Elliptic Curve Domain Parameters over Fp . . . . . . . . . . 11
         2.6.1   Recommended Parameters secp521r1 . . . . . . . . . . . . . . . . . . . . . . 11

3 Recommended Elliptic Curve Domain Parameters over F2m                                                  13
   3.1   Properties of Elliptic Curve Domain Parameters over F2m . . . . . . . . . . . . . . . 13
   3.2   Recommended 163-bit Elliptic Curve Domain Parameters over F2m               . . . . . . . . . 17
         3.2.1   Recommended Parameters sect163k1 . . . . . . . . . . . . . . . . . . . . . . 17
         3.2.2   Recommended Parameters sect163r1 . . . . . . . . . . . . . . . . . . . . . . 17
         3.2.3   Recommended Parameters sect163r2 . . . . . . . . . . . . . . . . . . . . . . 18
   3.3   Recommended 233-bit Elliptic Curve Domain Parameters over F2m               . . . . . . . . . 19
         3.3.1   Recommended Parameters sect233k1 . . . . . . . . . . . . . . . . . . . . . . 19
         3.3.2   Recommended Parameters sect233r1 . . . . . . . . . . . . . . . . . . . . . . 19

Contents                                                                                      Page i of iii
                                                                          SEC 2 (Draft) Ver. 2.0

   3.4    Recommended 239-bit Elliptic Curve Domain Parameters over F2m        . . . . . . . . . 20
          3.4.1   Recommended Parameters sect239k1 . . . . . . . . . . . . . . . . . . . . . . 20
   3.5    Recommended 283-bit Elliptic Curve Domain Parameters over F2m        . . . . . . . . . 21
          3.5.1   Recommended Parameters sect283k1 . . . . . . . . . . . . . . . . . . . . . . 21
          3.5.2   Recommended Parameters sect283r1 . . . . . . . . . . . . . . . . . . . . . . 22
   3.6    Recommended 409-bit Elliptic Curve Domain Parameters over F2m        . . . . . . . . . 23
          3.6.1   Recommended Parameters sect409k1 . . . . . . . . . . . . . . . . . . . . . . 23
          3.6.2   Recommended Parameters sect409r1 . . . . . . . . . . . . . . . . . . . . . . 24
   3.7    Recommended 571-bit Elliptic Curve Domain Parameters over F2m        . . . . . . . . . 25
          3.7.1   Recommended Parameters sect571k1 . . . . . . . . . . . . . . . . . . . . . . 25
          3.7.2   Recommended Parameters sect571r1 . . . . . . . . . . . . . . . . . . . . . . 26

A ASN.1 Syntax                                                                                   28
   A.1 Syntax for Elliptic Curve Domain Parameters . . . . . . . . . . . . . . . . . . . . . 28
   A.2 Object Identifiers for Recommended Parameters . . . . . . . . . . . . . . . . . . . . 29
          A.2.1 OIDs for Recommended Parameters over Fp . . . . . . . . . . . . . . . . . . 29
          A.2.2 OIDs for Recommended Parameters over F2m        . . . . . . . . . . . . . . . . . 30
          A.2.3 The Information Object Set SECGCurveNames . . . . . . . . . . . . . . . . . 30

B References                                                                                     33




Page ii of iii                                                                            Contents
SEC 2 (Draft) Ver. 2.0

List of Tables
   1    Properties of Recommended Elliptic Curve Domain Parameters over Fp . . . . . . .            4
   2    Status of Recommended Elliptic Curve Domain Parameters over Fp . . . . . . . . .            5
   3    Representations of F2m . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
   4    Properties of Recommended Elliptic Curve Domain Parameters over F2m . . . . . . 15
   5    Status of Recommended Elliptic Curve Domain Parameters over F2m           . . . . . . . . 16




List of Tables                                                                         Page iii of iii
SEC 2 (Draft) Ver. 2.0

1     Introduction

1.1    Overview
This document lists example elliptic curve domain parameters at commonly required security levels
for use by implementers of SEC 1 [SEC 1] and other ECC standards like ANSI X9.62 [X9.62], ANSI
X9.63 [X9.63], and IEEE 1363 [1363] and IEEE 1363a [1363A].
It is strongly recommended that implementers select parameters from among the parameters listed
in this document when they deploy ECC-based products in order to encourage the deployment of
interoperable ECC-based solutions.


1.2    Compliance
Implementations may claim compliance with the recommended parameters specified in this docu-
ment provided some subset of the recommended parameters is used by the cryptographic schemes
based on elliptic curve cryptography included in the implementation.
It is envisioned that implementations choosing to comply with this document will typically choose
also to comply with its companion document, SEC 1 [SEC 1].
It is intended to make a validation system available so that implementors can check compliance
with this document—see the SECG website, www.secg.org, for further information.


1.3    Document Evolution
This document will be reviewed every five years to ensure it remains up to date with cryptographic
advances. The next scheduled review will therefore take place in February 2015.
Additional intermittent reviews may also be performed from time-to-time as deemed necessary by
the Standards for Efficient Cryptography Group.


1.4    Intellectual Property
The reader’s attention is called to the possibility that compliance with this document may require
use of an invention covered by patent rights. By publication of this document, no position is taken
with respect to the validity of this claim or of any patent rights in connection therewith. The
patent holder(s) may have filed with the SECG a statement of willingness to grant a license under
these rights on fair, reasonable and nondiscriminatory terms and conditions to applicants desiring
to obtain such a license. Additional details may be obtained from the patent holder and from the
SECG website, www.secg.org.


1.5    Organization
This document is organized as follows.

§1 Introduction                                                                       Page 1 of 33
1.5 Organization                                                       SEC 2 (Draft) Ver. 2.0

The main body of the document focuses on the specification of recommended elliptic curve domain
parameters. Section 2 describes recommended elliptic curve domain parameters over Fp , and
Section 3 describes recommended elliptic curve domain parameters over F2m .
The appendices to the document provide additional relevant material. Appendix A provides ref-
erence ASN.1 syntax for implementations to use to identify the parameters. Appendix B lists the
references cited in the document.




Page 2 of 33                                                                  §1 Introduction
SEC 2 (Draft) Ver. 2.0

2     Recommended Elliptic Curve Domain Parameters over
      Fp
This section specifies the elliptic curve domain parameters over Fp recommended in this document.
The section is organized as follows. First Section 2.1 describes relevant properties of the rec-
ommended parameters over Fp . Then Section 2.2 specifies recommended 192-bit elliptic curve
domain parameters over Fp , Section 2.3 specifies recommended 224-bit elliptic curve domain pa-
rameters over Fp , Section 2.4 specifies recommended 256-bit elliptic curve domain parameters over
Fp , Section 2.5 specifies recommended 384-bit elliptic curve domain parameters over Fp , Section 2.6
specifies recommended 521-bit elliptic curve domain parameters over Fp ,


2.1    Properties of Elliptic Curve Domain Parameters over Fp
Following SEC 1 [SEC 1], elliptic curve domain parameters over Fp are a sextuple:
                                          T = (p, a, b, G, n, h)
consisting of an integer p specifying the finite field Fp , two elements a, b ∈ Fp specifying an elliptic
curve E(Fp ) defined by the equation:
                                  E : y 2 ≡ x3 + a.x + b     (mod p),
a base point G = (xG , yG ) on E(Fp ), a prime n which is the order of G, and an integer h which is
the cofactor h = #E(Fp )/n.
When elliptic curve domain parameters are specified in this document, each component of this sex-
tuple is represented as an octet string converted using the conventions specified in SEC 1 [SEC 1].
Again following SEC 1 [SEC 1], elliptic curve domain parameters over Fp must have:
                                 dlog2 pe ∈ {192, 224, 256, 384, 521}.
This restriction is designed to encourage interoperability while allowing implementers to sup-
ply commonly required security levels—recall that elliptic curve domain parameters over Fp with
dlog2 pe = 2t supply approximately t bits of security—meaning that solving the logarithm problem
on the associated elliptic curve is believed to take approximately 2t operations.
Here recommended elliptic curve domain parameters are supplied at each of the sizes allowed in
SEC 1.
All the recommended elliptic curve domain parameters over Fp use special form primes for their field
order p. These special form primes facilitate especially efficient implementations like those described
in [Nat99]. Recommended elliptic curve domain parameters over Fp which use random primes for
their field order p may be added later if commercial demand for such parameters increases.
The elliptic curve domain parameters over Fp supplied at each security level typically consist of
examples of two different types of parameters—one type being parameters associated with a Koblitz
curve and the other type being parameters chosen verifiably at random—although only verifiably
random parameters are supplied at export strength and at extremely high strength.

§2 Recommended Elliptic Curve Domain Parameters over Fp                                    Page 3 of 33
2.1 Properties of Elliptic Curve Domain Parameters over Fp                SEC 2 (Draft) Ver. 2.0

Parameters associated with a Koblitz curve admit especially efficient implementation. The name
Koblitz curve is best-known when used to describe binary anomalous curves over F2m which have
a, b ∈ {0, 1} [Kob92]. Here it is generalized to refer also to curves over Fp which possess an
efficiently computable endomorphism [GLV01]. The recommended parameters associated with a
Koblitz curve were chosen by repeatedly selecting parameters admitting an efficiently computable
endomorphism until a prime order curve was found.
Verifiably random parameters offer some additional conservative features. These parameters are
chosen from a seed using SHA-1 as specified in ANSI X9.62 [X9.62]. This process ensures that
the parameters cannot be predetermined. The parameters are therefore extremely unlikely to
be susceptible to future special-purpose attacks, and no trapdoors can have been placed in the
parameters during their generation. When elliptic curve domain parameters are chosen verifiably
at random, the seed S used to generate the parameters may optionally be stored along with the
parameters so that users can verify the parameters were chosen verifiably at random.
Here verifiably random parameters have been chosen either so that the associated elliptic curve
has prime order, or so that scalar multiplication of points on the associated elliptic curve can be
accelerated using Montgomery’s method [Mon87]. The recommended verifiably random parameters
were chosen by repeatedly selecting a random seed and counting the number of points on the
corresponding curve until appropriate parameters were found. Typically the parameters were
chosen so that a = p − 3 because such parameters admit efficient implementation. For a given p,
approximately half the isomorphism classes of elliptic curves over Fp contain a curve with a = p−3.
See SEC 1 [SEC 1] for further guidance on the selection of elliptic curve domain parameters over
Fp .

                                                                       Koblitz
                 Parameters    Section   Strength   Size   RSA/DSA     or   ran-
                                                                       dom
                  secp192k1     2.2.1       96      192      1536         k
                  secp192r1     2.2.2       96      192      1536           r
                  secp224k1     2.3.1      112      224      2048           k
                  secp224r1     2.3.2      112      224      2048           r
                  secp256k1     2.4.1      128      256      3072           k
                  secp256r1     2.4.2      128      256      3072           r
                  secp384r1     2.5.1      192      384      7680           r
                  secp521r1     2.6.1      256      521      15360          r

        Table 1: Properties of Recommended Elliptic Curve Domain Parameters over Fp


The recommended elliptic curve domain parameters over Fp have been given nicknames to enable
them to be easily identified. The nicknames were chosen as follows. Each name begins with
sec to denote ‘Standards for Efficient Cryptography’, followed by a p to denote parameters over

Page 4 of 33                       §2 Recommended Elliptic Curve Domain Parameters over Fp
SEC 2 (Draft) Ver. 2.0               2.1 Properties of Elliptic Curve Domain Parameters over Fp

Fp , followed by a number denoting the length in bits of the field size p, followed by a k to denote
parameters associated with a Koblitz curve or an r to denote verifiably random parameters, followed
by a sequence number.
Table 1 summarizes salient properties of the recommended elliptic curve domain parameters over
Fp .
Information is represented in Table 1 as follows. The column labelled ‘parameters’ gives the
nickname of the elliptic curve domain parameters. The column labelled ‘section’ refers to the
section of this document where the parameters are specified. The column labelled ‘strength’ gives
the approximate number of bits of security the parameters offer. The column labelled ‘size’ gives
the length in bits of the field order. The column labelled ‘RSA/DSA’ gives the approximate
size of an RSA or DSA modulus at comparable strength. (See SEC 1 [SEC 1] for precise technical
guidance on the strength of elliptic curve domain parameters.) Finally the column labelled ‘Koblitz
or random’ indicates whether the parameters are associated with a Koblitz curve — ‘k’ — or were
chosen verifiably at random — ‘r’.


 Parameters    Section   ANSI X9.62     ANSI X9.63     echeck    IEEE P1363     IPSec   NIST     WAP
 secp192k1      2.2.1          c              c           c            c           -       -       c
  secp192r1     2.2.2          r              r           c            c           r       r       c
 secp224k1      2.3.1          c              c           c            c           -       -       c
  secp224r1     2.3.2          r              r           c            c           r       r       c
 secp256k1      2.4.1          c              c           c            c           -       -       c
  secp256r1     2.4.2          r              r           c            c           r       r       c
  secp384r1     2.5.1          c              r           c            c           r       r       c
  secp521r1     2.6.1          r              r           c            c           r       r       c

          Table 2: Status of Recommended Elliptic Curve Domain Parameters over Fp


Table 2 summarizes the status of the recommended elliptic curve domain parameters over Fp with
respect to their alignment with other standards.
Information is represented in Table 2 as follows. The column labelled ‘parameters’ gives the
nickname of the elliptic curve domain parameters. The column labelled ‘section’ refers to the section
of this document where the parameters are specified. The remaining columns give the status of
the parameters with respect to various other standards which specify mechanisms based on elliptic
curve cryptography: ‘ANSI X9.62’ refers to the ANSI X9.62 standard [X9.62], ‘ANSI X9.63’ refers
to the ANSI X9.63 standard [X9.63], ‘echeck’ refers to the draft FSML standard [Fin99], ‘IEEE
P1363’ refers to the IEEE 1363 standard [1363], ‘IPSec’ refers to the recent internet draft related to
ECC [Int06] submitted to the IETF’s IPSec working group, ‘NIST’ refers to the list of recommended
parameters recently released by the U.S. government [Nat99], and ’WAP’ refers to the Wireless
Application Forum’s WTLS standard [WTLS]. In these columns, a ‘-’ denotes parameters non-

§2 Recommended Elliptic Curve Domain Parameters over Fp                                  Page 5 of 33
2.2 Recommended 192-bit Elliptic Curve Domain Parameters over Fp          SEC 2 (Draft) Ver. 2.0

conformant with the standard, a ‘c’ denotes parameters conformant with the standard, and an ‘r’
denotes parameters explicitly recommended in the standard.
Note that ANSI X9.62 has been updated. The set of recommended parameters in the updated
ANSI X9.62 [X9.62] is a subset of the set of recommended parameters in this document.



2.2     Recommended 192-bit Elliptic Curve Domain Parameters over Fp

This section specifies the two recommended 192-bit elliptic curve domain parameters over Fp in
this document: parameters secp192k1 associated with a Koblitz curve, and verifiably random
parameters secp192r1.
Section 2.2.1 specifies the elliptic curve domain parameters secp192k1, and Section 2.2.2 specifies
the elliptic curve domain parameters secp192r1.


2.2.1    Recommended Parameters secp192k1

The elliptic curve domain parameters over Fp associated with a Koblitz curve secp192k1 are
specified by the sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

        p = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFEE37
          = 2192 − 232 − 212 − 28 − 27 − 26 − 23 − 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000
        b = 00000000 00000000 00000000 00000000 00000000 00000003
The base point G in compressed form is:

        G =          03 DB4FF10E C057E9AE 26B07D02 80B7F434 1DA5D1B1 EAE06C7D
and in uncompressed form is:

        G =          04 DB4FF10E C057E9AE 26B07D02 80B7F434 1DA5D1B1 EAE06C7D
               9B2F2F6D 9C5628A7 844163D0 15BE8634 4082AA88 D95E2F9D
Finally the order n of G and the cofactor are:

        n = FFFFFFFF FFFFFFFF FFFFFFFE 26F2FC17 0F69466A 74DEFD8D
        h =          01


2.2.2    Recommended Parameters secp192r1

The verifiably random elliptic curve domain parameters over Fp secp192r1 are specified by the
sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

Page 6 of 33                       §2 Recommended Elliptic Curve Domain Parameters over Fp
SEC 2 (Draft) Ver. 2.0       2.3 Recommended 224-bit Elliptic Curve Domain Parameters over Fp

        p = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFFFF FFFFFFFF
          = 2192 − 264 − 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

        a = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFFFF FFFFFFFC
        b = 64210519 E59C80E7 0FA7E9AB 72243049 FEB8DEEC C146B9B1
E was chosen verifiably at random as specified in ANSI X9.62 [X9.62] from the seed:

        S = 3045AE6F C8422F64 ED579528 D38120EA E12196D5
The base point G in compressed form is:

        G =         03 188DA80E B03090F6 7CBF20EB 43A18800 F4FF0AFD 82FF1012
and in uncompressed form is:

        G =         04 188DA80E B03090F6 7CBF20EB 43A18800 F4FF0AFD 82FF1012
              07192B95 FFC8DA78 631011ED 6B24CDD5 73F977A1 1E794811
Finally the order n of G and the cofactor are:

        n = FFFFFFFF FFFFFFFF FFFFFFFF 99DEF836 146BC9B1 B4D22831
        h =         01


2.3     Recommended 224-bit Elliptic Curve Domain Parameters over Fp
This section specifies the two recommended 224-bit elliptic curve domain parameters over Fp in
this document: parameters secp224k1 associated with a Koblitz curve, and verifiably random
parameters secp224r1.
Section 2.3.1 specifies the elliptic curve domain parameters secp224k1, and Section 2.3.2 specifies
the elliptic curve domain parameters secp224r1.


2.3.1    Recommended Parameters secp224k1

The elliptic curve domain parameters over Fp associated with a Koblitz curve secp224k1 are
specified by the sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

        p = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFE56D
          = 2224 − 232 − 212 − 211 − 29 − 27 − 24 − 2 − 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
        b = 00000000 00000000 00000000 00000000 00000000 00000000 00000005
The base point G in compressed form is:

§2 Recommended Elliptic Curve Domain Parameters over Fp                               Page 7 of 33
2.3 Recommended 224-bit Elliptic Curve Domain Parameters over Fp       SEC 2 (Draft) Ver. 2.0

        G =          03 A1455B33 4DF099DF 30FC28A1 69A467E9 E47075A9 0F7E650E
               B6B7A45C
and in uncompressed form is:

        G =          04 A1455B33 4DF099DF 30FC28A1 69A467E9 E47075A9 0F7E650E
               B6B7A45C 7E089FED 7FBA3442 82CAFBD6 F7E319F7 C0B0BD59 E2CA4BDB
               556D61A5
Finally the order n of G and the cofactor are:

        n =          01 00000000 00000000 00000000 0001DCE8 D2EC6184 CAF0A971
               769FB1F7
        h =          01



2.3.2    Recommended Parameters secp224r1

The verifiably random elliptic curve domain parameters over Fp secp224r1 are specified by the
sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

        p = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF 00000000 00000000 00000001
          = 2224 − 296 + 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

        a = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFE
        b = B4050A85 0C04B3AB F5413256 5044B0B7 D7BFD8BA 270B3943 2355FFB4
E was chosen verifiably at random as specified in ANSI X9.62 [X9.62] from the seed:

        S = BD713447 99D5C7FC DC45B59F A3B9AB8F 6A948BC5
The base point G in compressed form is:

        G =          02 B70E0CBD 6BB4BF7F 321390B9 4A03C1D3 56C21122 343280D6
               115C1D21
and in uncompressed form is:

        G =          04 B70E0CBD 6BB4BF7F 321390B9 4A03C1D3 56C21122 343280D6
               115C1D21 BD376388 B5F723FB 4C22DFE6 CD4375A0 5A074764 44D58199
               85007E34
Finally the order n of G and the cofactor are:

        n = FFFFFFFF FFFFFFFF FFFFFFFF FFFF16A2 E0B8F03E 13DD2945 5C5C2A3D
        h =          01

Page 8 of 33                       §2 Recommended Elliptic Curve Domain Parameters over Fp
SEC 2 (Draft) Ver. 2.0     2.4 Recommended 256-bit Elliptic Curve Domain Parameters over Fp

2.4     Recommended 256-bit Elliptic Curve Domain Parameters over Fp
This section specifies the two recommended 256-bit elliptic curve domain parameters over Fp in
this document: parameters secp256k1 associated with a Koblitz curve, and verifiably random
parameters secp256r1.
Section 2.4.1 specifies the elliptic curve domain parameters secp256k1, and Section 2.4.2 specifies
the elliptic curve domain parameters secp256r1.


2.4.1    Recommended Parameters secp256k1

The elliptic curve domain parameters over Fp associated with a Koblitz curve secp256k1 are
specified by the sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

        p = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE
              FFFFFC2F
          = 2256 − 232 − 29 − 28 − 27 − 26 − 24 − 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000
        b = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000007
The base point G in compressed form is:

        G =         02 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9
              59F2815B 16F81798
and in uncompressed form is:

        G =         04 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9
              59F2815B 16F81798 483ADA77 26A3C465 5DA4FBFC 0E1108A8 FD17B448
              A6855419 9C47D08F FB10D4B8
Finally the order n of G and the cofactor are:

        n = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C
              D0364141
        h =         01


2.4.2    Recommended Parameters secp256r1

The verifiably random elliptic curve domain parameters over Fp secp256r1 are specified by the
sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

§2 Recommended Elliptic Curve Domain Parameters over Fp                               Page 9 of 33
2.5 Recommended 384-bit Elliptic Curve Domain Parameters over Fp          SEC 2 (Draft) Ver. 2.0

        p = FFFFFFFF 00000001 00000000 00000000 00000000 FFFFFFFF FFFFFFFF
              FFFFFFFF
          = 2224 (232 − 1) + 2192 + 296 − 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

        a = FFFFFFFF 00000001 00000000 00000000 00000000 FFFFFFFF FFFFFFFF
              FFFFFFFC
        b = 5AC635D8 AA3A93E7 B3EBBD55 769886BC 651D06B0 CC53B0F6 3BCE3C3E
              27D2604B
E was chosen verifiably at random as specified in ANSI X9.62 [X9.62] from the seed:

        S = C49D3608 86E70493 6A6678E1 139D26B7 819F7E90
The base point G in compressed form is:

        G =           03 6B17D1F2 E12C4247 F8BCE6E5 63A440F2 77037D81 2DEB33A0
                F4A13945 D898C296
and in uncompressed form is:

        G =           04 6B17D1F2 E12C4247 F8BCE6E5 63A440F2 77037D81 2DEB33A0
                F4A13945 D898C296 4FE342E2 FE1A7F9B 8EE7EB4A 7C0F9E16 2BCE3357
                6B315ECE CBB64068 37BF51F5
Finally the order n of G and the cofactor are:

        n = FFFFFFFF 00000000 FFFFFFFF FFFFFFFF BCE6FAAD A7179E84 F3B9CAC2
                FC632551
        h = 01



2.5     Recommended 384-bit Elliptic Curve Domain Parameters over Fp

This section specifies the recommended 384-bit elliptic curve domain parameters over Fp in this
document: verifiably random parameters secp384r1.
Section 2.5.1 specifies the elliptic curve domain parameters secp384r1.



2.5.1    Recommended Parameters secp384r1

The verifiably random elliptic curve domain parameters over Fp secp384r1 are specified by the
sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

Page 10 of 33                       §2 Recommended Elliptic Curve Domain Parameters over Fp
SEC 2 (Draft) Ver. 2.0    2.6 Recommended 521-bit Elliptic Curve Domain Parameters over Fp

        p = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
              FFFFFFFE FFFFFFFF 00000000 00000000 FFFFFFFF
          = 2384 − 2128 − 296 + 232 − 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

        a = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
              FFFFFFFE FFFFFFFF 00000000 00000000 FFFFFFFC
        b = B3312FA7 E23EE7E4 988E056B E3F82D19 181D9C6E FE814112 0314088F
              5013875A C656398D 8A2ED19D 2A85C8ED D3EC2AEF
E was chosen verifiably at random as specified in ANSI X9.62 [X9.62] from the seed:

        S = A335926A A319A27A 1D00896A 6773A482 7ACDAC73
The base point G in compressed form is:

        G =         03 AA87CA22 BE8B0537 8EB1C71E F320AD74 6E1D3B62 8BA79B98
              59F741E0 82542A38 5502F25D BF55296C 3A545E38 72760AB7
and in uncompressed form is:

        G =         04 AA87CA22 BE8B0537 8EB1C71E F320AD74 6E1D3B62 8BA79B98
              59F741E0 82542A38 5502F25D BF55296C 3A545E38 72760AB7 3617DE4A
              96262C6F 5D9E98BF 9292DC29 F8F41DBD 289A147C E9DA3113 B5F0B8C0
              0A60B1CE 1D7E819D 7A431D7C 90EA0E5F
Finally the order n of G and the cofactor are:

        n = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF C7634D81
              F4372DDF 581A0DB2 48B0A77A ECEC196A CCC52973
        h =         01



2.6     Recommended 521-bit Elliptic Curve Domain Parameters over Fp

This section specifies the recommended 521-bit elliptic curve domain parameters over Fp in this
document: verifiably random parameters secp521r1.
Section 2.6.1 specifies the elliptic curve domain parameters secp521r1.



2.6.1    Recommended Parameters secp521r1

The verifiably random elliptic curve domain parameters over Fp secp521r1 are specified by the
sextuple T = (p, a, b, G, n, h) where the finite field Fp is defined by:

§2 Recommended Elliptic Curve Domain Parameters over Fp                           Page 11 of 33
2.6 Recommended 521-bit Elliptic Curve Domain Parameters over Fp       SEC 2 (Draft) Ver. 2.0

      p =          01FF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
             FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
             FFFFFFFF FFFFFFFF FFFFFFFF
         = 2521 − 1
The curve E: y 2 = x3 + ax + b over Fp is defined by:

      a =          01FF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
             FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
             FFFFFFFF FFFFFFFF FFFFFFFC
      b =          0051 953EB961 8E1C9A1F 929A21A0 B68540EE A2DA725B 99B315F3
             B8B48991 8EF109E1 56193951 EC7E937B 1652C0BD 3BB1BF07 3573DF88
             3D2C34F1 EF451FD4 6B503F00
E was chosen verifiably at random as specified in ANSI X9.62 [X9.62] from the seed:

      S = D09E8800 291CB853 96CC6717 393284AA A0DA64BA
The base point G in compressed form is:

      G =         0200C6 858E06B7 0404E9CD 9E3ECB66 2395B442 9C648139 053FB521
                F828AF60 6B4D3DBA A14B5E77 EFE75928 FE1DC127 A2FFA8DE 3348B3C1
                856A429B F97E7E31 C2E5BD66
and in uncompressed form is:

      G =             04 00C6858E 06B70404 E9CD9E3E CB662395 B4429C64 8139053F
                B521F828 AF606B4D 3DBAA14B 5E77EFE7 5928FE1D C127A2FF A8DE3348
                B3C1856A 429BF97E 7E31C2E5 BD660118 39296A78 9A3BC004 5C8A5FB4
                2C7D1BD9 98F54449 579B4468 17AFBD17 273E662C 97EE7299 5EF42640
                C550B901 3FAD0761 353C7086 A272C240 88BE9476 9FD16650
Finally the order n of G and the cofactor are:

      n =           01FF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
                FFFFFFFF FFFFFFFA 51868783 BF2F966B 7FCC0148 F709A5D0 3BB5C9B8
                899C47AE BB6FB71E 91386409
      h =             01




Page 12 of 33                      §2 Recommended Elliptic Curve Domain Parameters over Fp
SEC 2 (Draft) Ver. 2.0

3     Recommended Elliptic Curve Domain Parameters over
      F2m
This section specifies the elliptic curve domain parameters over F2m recommended in this document.
The section is organized as follows. First Section 3.1 describes relevant properties of the rec-
ommended parameters over F2m . Then Section 3.2 specifies recommended 163-bit elliptic curve
domain parameters over F2m , Section 3.3 specifies recommended 233-bit elliptic curve domain pa-
rameters over F2m , Section 3.4 specifies recommended 239-bit elliptic curve domain parameters over
F2m , Section 3.5 specifies recommended 283-bit elliptic curve domain parameters over F2m , Sec-
tion 3.6 specifies recommended 409-bit elliptic curve domain parameters over F2m , and Section 3.7
specifies recommended 571-bit elliptic curve domain parameters over F2m .


3.1    Properties of Elliptic Curve Domain Parameters over F2m
Following SEC 1 [SEC 1], elliptic curve domain parameters over F2m are a septuple:

                                     T = (m, f (x), a, b, G, n, h)

consisting of an integer m specifying the finite field F2m , an irreducible binary polynomial f (x) of
degree m specifying the polynomial basis representation of F2m , two elements a, b ∈ F2m specifying
an elliptic curve E(F2m ) defined by the equation:

                                E : y 2 + x.y = x3 + a.x2 + b in F2m ,

a base point G = (xG , yG ) on E(F2m ), a prime n which is the order of G, and an integer h which
is the cofactor h = #E(F2m )/n.
When elliptic curve domain parameters over F2m are specified in this document, m is represented
directly as an integer, f (x) is represented directly as a polynomial, and the remaining components
are represented as octet strings converted using the conventions specified in SEC 1 [SEC 1].
Again following SEC 1 [SEC 1], elliptic curve domain parameters over F2m must have:

                                 m ∈ {163, 233, 239, 283, 409, 571}.

Furthermore elliptic curve domain parameters over F2m must use the reduction polynomials listed
in Table 3 below.
This restriction is designed to encourage interoperability while allowing implementers to supply
efficient implementations at commonly required security levels.
Here recommended elliptic curve domain parameters are supplied at each of the sizes allowed by
SEC 1.
The elliptic curve domain parameters over F2m supplied at each security level typically consist
of examples of two different types of parameters — one type being parameters associated with a
Koblitz curve and the other type being parameters chosen verifiably at random — although only
verifiably random parameters are supplied at export strength.

§3 Recommended Elliptic Curve Domain Parameters over F2m                               Page 13 of 33
3.1 Properties of Elliptic Curve Domain Parameters over F2m                   SEC 2 (Draft) Ver. 2.0

                         Field           Reduction Polynomial(s)
                          F2163       f (x) = x163 + x7 + x6 + x3 + 1
                          F2233            f (x) = x233 + x74 + 1
                          F2239   f (x) = x239 + x36 + 1 or x239 + x158 + 1
                          F2283       f (x) = x283 + x12 + x7 + x5 + 1
                          F2409            f (x) = x409 + x87 + 1
                          F2571       f (x) = x571 + x10 + x5 + x2 + 1

                                  Table 3: Representations of F2m



Parameters associated with a Koblitz curve admit especially efficient implementation. Koblitz
curves over F2m are binary anomalous curves which have a, b ∈ {0, 1} [Kob92].
Verifiably random parameters offer some additional conservative features. These parameters are
chosen from a seed using SHA-1 as specified in ANSI X9.62 [X9.62]. This process ensures that
the parameters cannot be predetermined. The parameters are therefore extremely unlikely to
be susceptible to future special-purpose attacks, and no trapdoors can have been placed in the
parameters during their generation. When elliptic curve domain parameters are chosen verifiably
at random, the seed S used to generate the parameters may optionally be stored along with the
parameters so that users can verify the parameters were chosen verifiably at random.
The recommended verifiably random parameters were chosen by repeatedly selecting a random
seed and counting the points on the corresponding curve using Schoof’s algorithm until appropriate
parameters were found. The parameters were chosen so that either a is random or a = 1. For a
given m, approximately half the isomorphism classes of elliptic curves over F2m contain a curve
with a = 1.
See SEC 1 [SEC 1] for further guidance on the selection of elliptic curve domain parameters over
F2 m .
The example elliptic curve domain parameters over F2m have been given nicknames to enable them
to be easily identified. The nicknames were chosen as follows. Each name begins with sec to denote
‘Standards for Efficient Cryptography’, followed by a t to denote parameters over F2m , followed by
a number denoting the field size m, followed by a k to denote parameters associated with a Koblitz
curve or an r to denote verifiably random parameters, followed by a sequence number.
Table 4 summarizes salient properties of the recommended elliptic curve domain parameters over
F2 m .
Information is represented in Table 4 as follows. The column labelled ‘parameters’ gives the
nickname of the elliptic curve domain parameters. The column labelled ‘section’ refers to the
section of this document where the parameters are specified. The column labelled ‘strength’ gives
the approximate number of bits of security the parameters offer. The column labelled ‘size’ gives
the field size m. The column labelled ‘RSA/DSA’ gives the approximate size of an RSA or DSA
modulus at comparable strength. (See SEC 1 [SEC 1] for precise technical guidance on the strength

Page 14 of 33                      §3 Recommended Elliptic Curve Domain Parameters over F2m
SEC 2 (Draft) Ver. 2.0          3.1 Properties of Elliptic Curve Domain Parameters over F2m




                                                                  Koblitz
               Parameters   Section   Strength   Size   RSA/DSA   or   ran-
                                                                  dom
                sect163k1    3.2.1      80       163     1024        k
                sect163r1    3.2.2      80       163     1024         r
                sect163r2    3.2.3      80       163     1024         r
                sect233k1    3.3.1      112      233     2240        k
                sect233r1    3.3.2      112      233     2240         r
                sect239k1    3.4.1      115      239     2304        k
                sect283k1    3.5.1      128      283     3456        k
                sect283r1    3.5.2      128      283     3456         r
                sect409k1    3.6.1      192      409     7680        k
                sect409r1    3.6.2      192      409     7680         r
                sect571k1    3.7.1      256      571     15360       k
                sect571r1    3.7.2      256      571     15360        r

       Table 4: Properties of Recommended Elliptic Curve Domain Parameters over F2m




§3 Recommended Elliptic Curve Domain Parameters over F2m                      Page 15 of 33
3.1 Properties of Elliptic Curve Domain Parameters over F2m                 SEC 2 (Draft) Ver. 2.0

of elliptic curve domain parameters.) Finally the column labelled ‘Koblitz or random’ indicates
whether the parameters are associated with a Koblitz curve — ‘k’ — or were chosen verifiably at
random — ‘r’.



 Parameters     Section   ANSI X9.62    ANSI X9.63     echeck   IEEE P1363     IPSec    NIST    WAP
  sect163k1      3.2.1         r              r           r           c           r       r       r
  sect163r1      3.2.2         c              c           r           c           -       -       c
  sect163r2      3.2.3         r              r           r           c           r       r       c
  sect233k1      3.3.1         r              r           c           c           r       r       c
  sect233r1      3.3.2         r              r           c           c           r       r       c
  sect239k1      3.4.1         c              c           c           c           -       -       c
  sect283k1      3.5.1         r              r           r           c           r       r       c
  sect283r1      3.5.2         r              r           r           c           r       r       c
  sect409k1      3.6.1         r              r           c           c           r       r       c
  sect409r1      3.6.2         r              r           c           c           r       r       c
  sect571k1      3.7.1         r              r           c           c           r       r       c
  sect571r1      3.7.2         r              r           c           c           r       r       c

          Table 5: Status of Recommended Elliptic Curve Domain Parameters over F2m




Table 5 summarizes the status of the recommended elliptic curve domain parameters over F2m with
respect to their alignment with other standards.
Information is represented in Table 5 as follows. The column labelled ‘parameters’ gives the
nickname of the elliptic curve domain parameters. The column labelled ‘section’ refers to the section
of this document where the parameters are specified. The remaining columns give the status of
the parameters with respect to various other standards which specify mechanisms based on elliptic
curve cryptography: ‘ANSI X9.62’ refers to the ANSI X9.62 standard [X9.62], ‘ANSI X9.63’ refers
to the draft ANSI X9.63 standard [X9.63], ‘echeck’ refers to the draft FSML standard [Fin99],
‘IEEE P1363’ refers to the IEEE 1363 standard [1363], ‘IPSec’ refers to the recent internet draft
related to ECC [Int06] submitted to the IETF’s IPSec working group, ‘NIST’ refers to the list of
recommended parameters recently released by the U.S. government [Nat99], and ’WAP’ refers to the
Wireless Application Forum’s WTLS standard [WTLS]. In these columns, a ‘-’ denotes parameters
non-conformant with the standard, a ‘c’ denotes parameters conformant with the standard, and
an ‘r’ denotes parameters explicitly recommended in the standard.
Note that ANSI X9.62 has been updated. The set of recommended parameters in the updated
ANSI X9.62 [X9.62] is a subset of the set of recommended parameters in this document.

Page 16 of 33                      §3 Recommended Elliptic Curve Domain Parameters over F2m
SEC 2 (Draft) Ver. 2.0 3.2 Recommended 163-bit Elliptic Curve Domain Parameters over F2m

3.2     Recommended 163-bit Elliptic Curve Domain Parameters over F2m
This section specifies the three recommended 163-bit elliptic curve domain parameters over F2m in
this document: parameters sect163k1 associated with a Koblitz curve, verifiably random param-
eters sect163r1, and verifiably random parameters sect163r2.
Section 3.2.1 specifies the elliptic curve domain parameters sect163k1, Section 3.2.2 specifies the
elliptic curve domain parameters sect163r1, and Section 3.2.3 specifies the elliptic curve domain
parameters sect163r2.


3.2.1    Recommended Parameters sect163k1

The elliptic curve domain parameters over F2m associated with a Koblitz curve sect163k1 are
specified by the septuple T = (m, f (x), a, b, G, n, h) where m = 163 and the representation of F2163
is defined by:

        f (x) = x163 + x7 + x6 + x3 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a =          00 00000000 00000000 00000000 00000000 00000001
        b =          00 00000000 00000000 00000000 00000000 00000001
The base point G in compressed form is:

        G =        0302 FE13C053 7BBC11AC AA07D793 DE4E6D5E 5C94EEE8
and in uncompressed form is:

        G =     0402FE 13C0537B BC11ACAA 07D793DE 4E6D5E5C 94EEE802 89070FB0
              5D38FF58 321F2E80 0536D538 CCDAA3D9
Finally the order n of G and the cofactor are:

        n =          04 00000000 00000000 00020108 A2E0CC0D 99F8A5EF
        h =          02


3.2.2    Recommended Parameters sect163r1

The verifiably random elliptic curve domain parameters over F2m sect163r1 are specified by the
septuple T = (m, f (x), a, b, G, n, h) where m = 163 and the representation of F2163 is defined by:

        f (x) = x163 + x7 + x6 + x3 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a =          07 B6882CAA EFA84F95 54FF8428 BD88E246 D2782AE2
        b =          07 13612DCD DCB40AAB 946BDA29 CA91F73A F958AFD9
E was chosen verifiably at random from the seed:


§3 Recommended Elliptic Curve Domain Parameters over F2m                               Page 17 of 33
3.2 Recommended 163-bit Elliptic Curve Domain Parameters over F2m SEC 2 (Draft) Ver. 2.0

        S = 24B7B137 C8A14D69 6E676875 6151756F D0DA2E5C
However for historical reasons the method used to generate E from S differs slightly from the
method described in ANSI X9.62 [X9.62]. Specifically the coefficient b produced from S is the
reverse of the coefficient that would have been produced by the method described in ANSI X9.62.
The base point G in compressed form is:

        G =         0303 69979697 AB438977 89566789 567F787A 7876A654
and in uncompressed form is:

        G =       040369 979697AB 43897789 56678956 7F787A78 76A65400 435EDB42
                EFAFB298 9D51FEFC E3C80988 F41FF883
Finally the order n of G and the cofactor are:

        n =           03 FFFFFFFF FFFFFFFF FFFF48AA B689C29C A710279B
        h =           02


3.2.3    Recommended Parameters sect163r2

The verifiably random elliptic curve domain parameters over F2m sect163r2 are specified by the
septuple T = (m, f (x), a, b, G, n, h) where m = 163 and the representation of F2163 is defined by:

        f (x) = x163 + x7 + x6 + x3 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a =          00 00000000 00000000 00000000 00000000 00000001
        b =          02 0A601907 B8C953CA 1481EB10 512F7874 4A3205FD
E was chosen verifiably at random from the seed:

        S = 85E25BFE 5C86226C DB12016F 7553F9D0 E693A268
E was selected from S as specified in ANSI X9.62 [X9.62] in normal basis representation and
converted into polynomial basis representation.
The base point G in compressed form is:

        G =         0303 F0EBA162 86A2D57E A0991168 D4994637 E8343E36
and in uncompressed form is:

        G =       0403F0 EBA16286 A2D57EA0 991168D4 994637E8 343E3600 D51FBC6C
                71A0094F A2CDD545 B11C5C0C 797324F1
Finally the order n of G and the cofactor are:

        n =           04 00000000 00000000 000292FE 77E70C12 A4234C33
        h =           02

Page 18 of 33                     §3 Recommended Elliptic Curve Domain Parameters over F2m
SEC 2 (Draft) Ver. 2.0 3.3 Recommended 233-bit Elliptic Curve Domain Parameters over F2m

3.3     Recommended 233-bit Elliptic Curve Domain Parameters over F2m
This section specifies the two recommended 233-bit elliptic curve domain parameters over F2m
in this document: parameters sect233k1 associated with a Koblitz curve, and verifiably random
parameters sect233r1.
Section 3.3.1 specifies the elliptic curve domain parameters sect233k1, and Section 3.3.2 specifies
the elliptic curve domain parameters sect233r1.


3.3.1    Recommended Parameters sect233k1

The elliptic curve domain parameters over F2m associated with a Koblitz curve sect233k1 are
specified by the septuple T = (m, f (x), a, b, G, n, h) where m = 233 and the representation of F2233
is defined by:

        f (x) = x233 + x74 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a =       0000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000
        b =       0000 00000000 00000000 00000000 00000000 00000000 00000000
              00000001
The base point G in compressed form is:

        G =     020172 32BA853A 7E731AF1 29F22FF4 149563A4 19C26BF5 0A4C9D6E
              EFAD6126
and in uncompressed form is:

        G =          04 017232BA 853A7E73 1AF129F2 2FF41495 63A419C2 6BF50A4C
              9D6EEFAD 612601DB 537DECE8 19B7F70F 555A67C4 27A8CD9B F18AEB9B
              56E0C11056FAE6A3
Finally the order n of G and the cofactor are:

        n =          80 00000000 00000000 00000000 00069D5B B915BCD4 6EFB1AD5
              F173ABDF
        h =          04


3.3.2    Recommended Parameters sect233r1

The verifiably random elliptic curve domain parameters over F2m sect233r1 are specified by the
septuple T = (m, f (x), a, b, G, n, h) where m = 233 and the representation of F2233 is defined by:

        f (x) = x233 + x74 + 1

§3 Recommended Elliptic Curve Domain Parameters over F2m                               Page 19 of 33
3.4 Recommended 239-bit Elliptic Curve Domain Parameters over F2m SEC 2 (Draft) Ver. 2.0

The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a =        0000 00000000 00000000 00000000 00000000 00000000 00000000
              00000001
        b =        0066 647EDE6C 332C7F8C 0923BB58 213B333B 20E9CE42 81FE115F
              7D8F90AD
E was chosen verifiably at random from the seed:

        S = 74D59FF0 7F6B413D 0EA14B34 4B20A2DB 049B50C3
E was selected from S as specified in ANSI X9.62 [X9.62] in normal basis representation and
converted into polynomial basis representation.
The base point G in compressed form is:

        G =       0300FA C9DFCBAC 8313BB21 39F1BB75 5FEF65BC 391F8B36 F8F8EB73
                71FD558B
and in uncompressed form is:

        G =           04 00FAC9DF CBAC8313 BB2139F1 BB755FEF 65BC391F 8B36F8F8
                EB7371FD 558B0100 6A08A419 03350678 E58528BE BF8A0BEF F867A7CA
                36716F7E 01F81052
Finally the order n of G and the cofactor are:

        n =         0100 00000000 00000000 00000000 0013E974 E72F8A69 22031D26
                03CFE0D7
        h =           02


3.4     Recommended 239-bit Elliptic Curve Domain Parameters over F2m

This section specifies the recommended 239-bit elliptic curve domain parameters over F2m in this
document: parameters sect239k1 associated with a Koblitz curve.
Section 3.4.1 specifies the elliptic curve domain parameters sect239k1.


3.4.1    Recommended Parameters sect239k1

The elliptic curve domain parameters over F2m associated with a Koblitz curve sect239k1 are
specified by the septuple T = (m, f (x), a, b, G, n, h) where m = 239 and the representation of F2239
is defined by:

        f (x) = x239 + x158 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

Page 20 of 33                       §3 Recommended Elliptic Curve Domain Parameters over F2m
SEC 2 (Draft) Ver. 2.0 3.5 Recommended 283-bit Elliptic Curve Domain Parameters over F2m

        a =       0000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000
        b =       0000 00000000 00000000 00000000 00000000 00000000 00000000
              00000001
The base point G in compressed form is:

        G =     0329A0 B6A887A9 83E97309 88A68727 A8B2D126 C44CC2CC 7B2A6555
              193035DC
and in uncompressed form is:

        G =          04 29A0B6A8 87A983E9 730988A6 8727A8B2 D126C44C C2CC7B2A
              65551930 35DC7631 0804F12E 549BDB01 1C103089 E73510AC B275FC31
              2A5DC6B7 6553F0CA
Finally the order n of G and the cofactor are:

        n =        2000 00000000 00000000 00000000 005A79FE C67CB6E9 1F1C1DA8
              00E478A5
        h =          04


3.5     Recommended 283-bit Elliptic Curve Domain Parameters over F2m
This section specifies the two recommended 283-bit elliptic curve domain parameters over F2m
in this document: parameters sect283k1 associated with a Koblitz curve, and verifiably random
parameters sect283r1.
Section 3.5.1 specifies the elliptic curve domain parameters sect283k1, and Section 3.5.2 specifies
the elliptic curve domain parameters sect283r1.


3.5.1    Recommended Parameters sect283k1

The elliptic curve domain parameters over F2m associated with a Koblitz curve sect283k1 are
specified by the septuple T = (m, f (x), a, b, G, n, h) where m = 283 and the representation of F2283
is defined by:

        f (x) = x283 + x12 + x7 + x5 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000
        b = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000001

§3 Recommended Elliptic Curve Domain Parameters over F2m                               Page 21 of 33
3.5 Recommended 283-bit Elliptic Curve Domain Parameters over F2m SEC 2 (Draft) Ver. 2.0

The base point G in compressed form is:

        G =           02 0503213F 78CA4488 3F1A3B81 62F188E5 53CD265F 23C1567A
                16876913 B0C2AC24 58492836
and in uncompressed form is:

        G =           04 0503213F 78CA4488 3F1A3B81 62F188E5 53CD265F 23C1567A
                16876913 B0C2AC24 58492836 01CCDA38 0F1C9E31 8D90F95D 07E5426F
                E87E45C0 E8184698 E4596236 4E341161 77DD2259
Finally the order n of G and the cofactor are:

        n = 01FFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFE9AE 2ED07577 265DFF7F
                94451E06 1E163C61
        h =           04


3.5.2    Recommended Parameters sect283r1

The verifiably random elliptic curve domain parameters over F2m sect283r1 are specified by the
septuple T = (m, f (x), a, b, G, n, h) where m = 283 and the representation of F2283 is defined by:

        f (x) = x283 + x12 + x7 + x5 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000001
        b = 027B680A C8B8596D A5A4AF8A 19A0303F CA97FD76 45309FA2 A581485A
              F6263E31 3B79A2F5
E was chosen verifiably at random from the seed:

        S = 77E2B073 70EB0F83 2A6DD5B6 2DFC88CD 06BB84BE
E was selected from S as specified in ANSI X9.62 [X9.62] in normal basis representation and
converted into polynomial basis representation.
The base point G in compressed form is:

        G =           03 05F93925 8DB7DD90 E1934F8C 70B0DFEC 2EED25B8 557EAC9C
                80E2E198 F8CDBECD 86B12053
and in uncompressed form is:

        G =           04 05F93925 8DB7DD90 E1934F8C 70B0DFEC 2EED25B8 557EAC9C
                80E2E198 F8CDBECD 86B12053 03676854 FE24141C B98FE6D4 B20D02B4
                516FF702 350EDDB0 826779C8 13F0DF45 BE8112F4

Page 22 of 33                       §3 Recommended Elliptic Curve Domain Parameters over F2m
SEC 2 (Draft) Ver. 2.0 3.6 Recommended 409-bit Elliptic Curve Domain Parameters over F2m

Finally the order n of G and the cofactor are:

        n = 03FFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFEF90 399660FC 938A9016
              5B042A7C EFADB307
        h =          02



3.6     Recommended 409-bit Elliptic Curve Domain Parameters over F2m

This section specifies the two recommended 409-bit elliptic curve domain parameters over F2m
in this document: parameters sect409k1 associated with a Koblitz curve, and verifiably random
parameters sect409r1.
Section 3.6.1 specifies the elliptic curve domain parameters sect409k1, and Section 3.6.2 specifies
the elliptic curve domain parameters sect409r1.



3.6.1    Recommended Parameters sect409k1

The elliptic curve domain parameters over F2m associated with a Koblitz curve sect409k1 are
specified by the septuple T = (m, f (x), a, b, G, n, h) where m = 409 and the representation of F2409
is defined by:

        f (x) = x409 + x87 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000000 00000000 00000000
        b = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000000 00000000 00000001
The base point G in compressed form is:

        G =          03 0060F05F 658F49C1 AD3AB189 0F718421 0EFD0987 E307C84C
              27ACCFB8 F9F67CC2 C460189E B5AAAA62 EE222EB1 B35540CF E9023746
and in uncompressed form is:

        G =          04 0060F05F 658F49C1 AD3AB189 0F718421 0EFD0987 E307C84C
              27ACCFB8 F9F67CC2 C460189E B5AAAA62 EE222EB1 B35540CF E9023746
              01E36905 0B7C4E42 ACBA1DAC BF04299C 3460782F 918EA427 E6325165
              E9EA10E3 DA5F6C42 E9C55215 AA9CA27A 5863EC48 D8E0286B
Finally the order n of G and the cofactor are:

§3 Recommended Elliptic Curve Domain Parameters over F2m                               Page 23 of 33
3.6 Recommended 409-bit Elliptic Curve Domain Parameters over F2m SEC 2 (Draft) Ver. 2.0

        n =       7FFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFE5F
                83B2D4EA 20400EC4 557D5ED3 E3E7CA5B 4B5C83B8 E01E5FCF
        h =           04




3.6.2    Recommended Parameters sect409r1


The verifiably random elliptic curve domain parameters over F2m sect409r1 are specified by the
septuple T = (m, f (x), a, b, G, n, h) where m = 409 and the representation of F2409 is defined by:

        f (x) = x409 + x87 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000000 00000000 00000001
        b = 0021A5C2 C8EE9FEB 5C4B9A75 3B7B476B 7FD6422E F1F3DD67 4761FA99
              D6AC27C8 A9A197B2 72822F6C D57A55AA 4F50AE31 7B13545F
E was chosen verifiably at random from the seed:

        S = 4099B5A4 57F9D69F 79213D09 4C4BCD4D 4262210B
E was selected from S as specified in ANSI X9.62 [X9.62] in normal basis representation and
converted into polynomial basis representation.
The base point G in compressed form is:

        G =           03 015D4860 D088DDB3 496B0C60 64756260 441CDE4A F1771D4D
                B01FFE5B 34E59703 DC255A86 8A118051 5603AEAB 60794E54 BB7996A7
and in uncompressed form is:

        G =           04 015D4860 D088DDB3 496B0C60 64756260 441CDE4A F1771D4D
                B01FFE5B 34E59703 DC255A86 8A118051 5603AEAB 60794E54 BB7996A7
                0061B1CF AB6BE5F3 2BBFA783 24ED106A 7636B9C5 A7BD198D 0158AA4F
                5488D08F 38514F1F DF4B4F40 D2181B36 81C364BA 0273C706
Finally the order n of G and the cofactor are:

        n = 01000000 00000000 00000000 00000000 00000000 00000000 000001E2
                AAD6A612 F33307BE 5FA47C3C 9E052F83 8164CD37 D9A21173
        h =           02

Page 24 of 33                     §3 Recommended Elliptic Curve Domain Parameters over F2m
SEC 2 (Draft) Ver. 2.0 3.7 Recommended 571-bit Elliptic Curve Domain Parameters over F2m

3.7     Recommended 571-bit Elliptic Curve Domain Parameters over F2m

This section specifies the two recommended 571-bit elliptic curve domain parameters over F2m
in this document: parameters sect571k1 associated with a Koblitz curve, and verifiably random
parameters sect571r1.
Section 3.7.1 specifies the elliptic curve domain parameters sect571k1, and Section 3.7.2 specifies
the elliptic curve domain parameters sect571r1.




3.7.1    Recommended Parameters sect571k1

The elliptic curve domain parameters over F2m associated with a Koblitz curve sect571k1 are
specified by the septuple T = (m, f (x), a, b, G, n, h) where m = 571 and the representation of F2571
is defined by:

        f (x) = x571 + x10 + x5 + x2 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000000
        b = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000001
The base point G in compressed form is:

        G =          02 026EB7A8 59923FBC 82189631 F8103FE4 AC9CA297 0012D5D4
              60248048 01841CA4 43709584 93B205E6 47DA304D B4CEB08C BBD1BA39
              494776FB 988B4717 4DCA88C7 E2945283 A01C8972
and in uncompressed form is:

        G =          04 026EB7A8 59923FBC 82189631 F8103FE4 AC9CA297 0012D5D4
              60248048 01841CA4 43709584 93B205E6 47DA304D B4CEB08C BBD1BA39
              494776FB 988B4717 4DCA88C7 E2945283 A01C8972 0349DC80 7F4FBF37
              4F4AEADE 3BCA9531 4DD58CEC 9F307A54 FFC61EFC 006D8A2C 9D4979C0
              AC44AEA7 4FBEBBB9 F772AEDC B620B01A 7BA7AF1B 320430C8 591984F6
              01CD4C14 3EF1C7A3
Finally the order n of G and the cofactor are:


§3 Recommended Elliptic Curve Domain Parameters over F2m                               Page 25 of 33
3.7 Recommended 571-bit Elliptic Curve Domain Parameters over F2m SEC 2 (Draft) Ver. 2.0

        n = 02000000 00000000 00000000 00000000 00000000 00000000 00000000
                00000000 00000000 131850E1 F19A63E4 B391A8DB 917F4138 B630D84B
                E5D63938 1E91DEB4 5CFE778F 637C1001
        h =           04



3.7.2    Recommended Parameters sect571r1

The verifiably random elliptic curve domain parameters over F2m sect571r1 are specified by the
septuple T = (m, f (x), a, b, G, n, h) where m = 571 and the representation of F2571 is defined by:

        f (x) = x571 + x10 + x5 + x2 + 1
The curve E: y 2 + xy = x3 + ax2 + b over F2m is defined by:

        a = 00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000000 00000000 00000000 00000000
              00000000 00000000 00000000 00000001
        b = 02F40E7E 2221F295 DE297117 B7F3D62F 5C6A97FF CB8CEFF1 CD6BA8CE
              4A9A18AD 84FFABBD 8EFA5933 2BE7AD67 56A66E29 4AFD185A 78FF12AA
              520E4DE7 39BACA0C 7FFEFF7F 2955727A
E was chosen verifiably at random from the seed:

        S = 2AA058F7 3A0E33AB 486B0F61 0410C53A 7F132310
E was selected from S as specified in ANSI X9.62 [X9.62] in normal basis representation and
converted into polynomial basis representation.
The base point G in compressed form is:

        G =           03 0303001D 34B85629 6C16C0D4 0D3CD775 0A93D1D2 955FA80A
                A5F40FC8 DB7B2ABD BDE53950 F4C0D293 CDD711A3 5B67FB14 99AE6003
                8614F139 4ABFA3B4 C850D927 E1E7769C 8EEC2D19
and in uncompressed form is:

        G =           04 0303001D 34B85629 6C16C0D4 0D3CD775 0A93D1D2 955FA80A
                A5F40FC8 DB7B2ABD BDE53950 F4C0D293 CDD711A3 5B67FB14 99AE6003
                8614F139 4ABFA3B4 C850D927 E1E7769C 8EEC2D19 037BF273 42DA639B
                6DCCFFFE B73D69D7 8C6C27A6 009CBBCA 1980F853 3921E8A6 84423E43
                BAB08A57 6291AF8F 461BB2A8 B3531D2F 0485C19B 16E2F151 6E23DD3C
                1A4827AF 1B8AC15B
Finally the order n of G and the cofactor are:

Page 26 of 33                       §3 Recommended Elliptic Curve Domain Parameters over F2m
SEC 2 (Draft) Ver. 2.0 3.7 Recommended 571-bit Elliptic Curve Domain Parameters over F2m

     n = 03FFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
            FFFFFFFF FFFFFFFF E661CE18 FF559873 08059B18 6823851E C7DD9CA1
            161DE93D 5174D66E 8382E9BB 2FE84E47
     h =          02




§3 Recommended Elliptic Curve Domain Parameters over F2m                    Page 27 of 33
                                                                         SEC 2 (Draft) Ver. 2.0

A       ASN.1 Syntax
This section discusses the representation of elliptic curve domain parameters using ASN.1 syntax
and specifies ASN.1 object identifiers for the elliptic curve domain parameters recommended in
this document.


A.1     Syntax for Elliptic Curve Domain Parameters

There are a number of ways of representing elliptic curve domain parameters using ASN.1 syntax.
The following syntax is recommended in SEC 1 [SEC 1] for use in X.509 certificates and elsewhere
(following [RFC 3279]).
Parameters{CURVES:IOSet} ::= CHOICE {
     ecParameters ECParameters,
     namedCurve CURVES.&id({IOSet}),
     implicitCA NULL
}

where

    • ecParameters of type ECParameters indicates that the full elliptic curve domain parameters
      are given,

    • namedCurve of type CURVES indicates that a named curve from the set delimited by CurveNames
      is to be used, and

    • implicitCA of type NULL indicates that the curve is known implicitly, that is, the actual
      curve is known to both parties by other means.

The following syntax is then used to describe explicit representations of elliptic curve domain
parameters, if need be.
ECParameters ::= SEQUENCE {
     version INTEGER { ecpVer1(1) } (ecpVer1),
     fieldID FieldID {{FieldTypes}},
     curve Curve,
     base ECPoint,
     order INTEGER,
     cofactor INTEGER OPTIONAL,
     ...
}

See SEC 1 [SEC 1] for more details on the explicit representation of elliptic curve domain param-
eters.

Page 28 of 33                                                                §A ASN.1 Syntax
SEC 2 (Draft) Ver. 2.0                        A.2 Object Identifiers for Recommended Parameters

A.2     Object Identifiers for Recommended Parameters

This section specifies object identifiers for the elliptic curve domain parameters recommended in
this document. These object identifiers may be used, for example, to represent parameters using
the namedCurve syntax described in the previous section.
Parameters that have not previously been assigned object identifiers appear in the tree whose root
is designated by the object identifier certicom-arc. It has the following value.
certicom-arc OBJECT IDENTIFIER ::= {
     iso(1) identified-organization(3) certicom(132)
}

Parameters that are given as examples in ANSI X9.62 [X9.62] appear in the tree whose root is
designated by the object identifier ansi-X9-62. It has the following value.
ansi-X9-62 OBJECT IDENTIFIER ::= {
     iso(1) member-body(2) us(840) 10045
}

The values of the object identifiers of parameters given in ANSI X9.62 are duplicated here for
convenience.
To reduce the encoded lengths, the parameters under certicom-arc appear just below the main
node. The object identifier ellipticCurve represents the root of the tree containing all such
parameters in this document and has the following value.
ellipticCurve OBJECT IDENTIFIER ::= { certicom-arc curve(0) }
The actual parameters appear immediately below this; their object identifiers may be found in the
following sections. Section A.2.1 specifies object identifiers for the parameters over Fp , and Section
A.2.2 specifies object identifiers for the parameters over F2m .


A.2.1    OIDs for Recommended Parameters over Fp

The object identifiers for the recommended parameters over Fp have the following values. The
names of the identifiers agree with the nicknames given to the parameters in this document. In
ANSI X9.62 [X9.62], the curve secp192r1 is designated prime192v1, and the curve secp256r1 is
designated prime256v1.
--
-- Curves over prime-order fields:
--
secp192k1 OBJECT IDENTIFIER ::= { ellipticCurve 31 }
secp192r1 OBJECT IDENTIFIER ::= { ansi-X9-62 curves(3) prime(1) 1 }

secp224k1 OBJECT IDENTIFIER ::= { ellipticCurve 32 }
secp224r1 OBJECT IDENTIFIER ::= { ellipticCurve 33 }

§A ASN.1 Syntax                                                                         Page 29 of 33
A.2 Object Identifiers for Recommended Parameters                     SEC 2 (Draft) Ver. 2.0


secp256k1 OBJECT IDENTIFIER ::= { ellipticCurve 10 }
secp256r1 OBJECT IDENTIFIER ::= { ansi-X9-62 curves(3) prime(1) 7 }

secp384r1 OBJECT IDENTIFIER ::= { ellipticCurve 34 }

secp521r1 OBJECT IDENTIFIER ::= { ellipticCurve 35 }



A.2.2   OIDs for Recommended Parameters over F2m

The object identifiers for the recommended parameters over F2m have the following values. The
names of the identifiers agree with the nicknames given to the parameters in this document.
--
-- Curves over characteristic 2 fields.
--
sect163k1 OBJECT IDENTIFIER ::= { ellipticCurve 1 }
sect163r1 OBJECT IDENTIFIER ::= { ellipticCurve 2 }
sect163r2 OBJECT IDENTIFIER ::= { ellipticCurve 15 }

sect233k1 OBJECT IDENTIFIER ::= { ellipticCurve 26 }
sect233r1 OBJECT IDENTIFIER ::= { ellipticCurve 27 }

sect239k1 OBJECT IDENTIFIER ::= { ellipticCurve 3 }

sect283k1 OBJECT IDENTIFIER ::= { ellipticCurve 16 }
sect283r1 OBJECT IDENTIFIER ::= { ellipticCurve 17 }

sect409k1 OBJECT IDENTIFIER ::= { ellipticCurve 36 }
sect409r1 OBJECT IDENTIFIER ::= { ellipticCurve 37 }

sect571k1 OBJECT IDENTIFIER ::= { ellipticCurve 38 }
sect571r1 OBJECT IDENTIFIER ::= { ellipticCurve 39 }



A.2.3   The Information Object Set SECGCurveNames

The following information object set SECGCurveNames of class CURVES may be used to delineate
the use of a curve recommended in this document. When it is used to govern the component
namedCurve of Parameters (defined in section A.1), the value of namedCurve must be one of the
values of the set.
SECGCurveNames CURVES ::= {
     -- Curves over prime-order fields:
     { ID secp192k1 } |

Page 30 of 33                                                             §A ASN.1 Syntax
SEC 2 (Draft) Ver. 2.0                   A.2 Object Identifiers for Recommended Parameters

     { ID secp192r1 } |
     { ID secp224k1 } |
     { ID secp224r1 } |
     { ID secp256k1 } |
     { ID secp256r1 } |
     { ID secp384r1 } |
     { ID secp521r1 } |
     -- Curves over characteristic 2 fields:
     { ID sect163k1 } |
     { ID sect163r1 } |
     { ID sect163r2 } |
     { ID sect233k1 } |
     { ID sect233r1 } |
     { ID sect239k1 } |
     { ID sect283k1 } |
     { ID sect283r1 } |
     { ID sect409k1 } |
     { ID sect409r1 } |
     { ID sect571k1 } |
     { ID sect571r1 } ,
     ...
     }

The type CURVES used above is defined below.
CURVES ::= CLASS {
     &curve-id OBJECT IDENTIFIER UNIQUE
} WITH SYNTAX { ID &curve-id }




§A ASN.1 Syntax                                                              Page 31 of 33
References                                                                SEC 2 (Draft) Ver. 2.0

B References
[1363]       Institute of Electrical and Electronics Engineers. Specifications for Public-Key Cryp-
             tography, IEEE Standard 1363-2000, Aug. 2000. http://standards.ieee.org/
             catalog/olis/busarch.html.

[1363A]      ———. Specifications for Public-Key Cryptography — Amendment 1: Additional
             Techniques, IEEE Standard 1363A-2004, Oct. 2004. http://standards.ieee.org/
             catalog/olis/busarch.html.

[Fin99]      Financial Services Technology Consortium. Financial Services Markup Language, Aug.
             1999. Working Draft.

[Int06]      D. R. L. Brown.        Additional ECC Groups For IKE and IKEv2.       Inter-
             net Engineering Task Force, Oct. 2006. Expired. http://tools.ietf.org/html/
             draft-ietf-ipsec-ike-ecc-groups-10.

[Nat99]      National Institute of Standards and Technology. Recommended Elliptic Curves for
             Federal Government Use, Jul. 1999. csrc.nist.gov/encryption.

[RFC 3279] L. Bassham, R. Housley and W. Polk. RFC 3279: Algorithms and Identifiers
           for the Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation
           List (CRL) Profile. Internet Engineering Task Force, Apr. 2002. www.ietf/rfc/
           rfc3279.txt.

[SEC 1]      Standards for Efficient Cryptography Group. SEC 1: Elliptic Curve Cryptography,
             Mar. 2009. Version 2.0. http://www.secg.org/download/aid-780/sec1-v2.pdf.

[WTLS]       Wireless Application Forum. WAP WTLS: Wireless Application Protocol Wireless
             Transport Layer Security Specification, Feb. 1999.

[X9.62]      American National Standards Institute. Public Key Cryptography for the Finan-
             cial Services Industry: The Elliptic Curve Digital Signature Algorithm (ECDSA),
             American National Standard X9.62-2005, 2005.         http://webstore.ansi.org/
             ansidocstore.

[X9.63]      ———. Public-Key Cryptography for the Financial Services Industry: Key Agreement
             and Key Transport Using Elliptic Curve Cryptography, American National Standard
             X9.63-2001, 2001. http://webstore.ansi.org/ansidocstore.

[GLV01]      R. P. Gallant, R. J. Lambert and S. A. Vanstone. Faster point multiplication
             on elliptic curves with efficient endomorphisms. In J. Kilian (ed.), Advances in
             Cryptology — CRYPTO 2001, Lecture Notes in Computer Science 2139, pp. 190–200.
             International Association for Cryptologic Research, Springer, 2001.

[Kob92]      N. Koblitz. CM-curves with good cryptographic properties. In J. Feigenbaum (ed.),
             Advances in Cryptology — CRYPTO ’91, Lecture Notes in Computer Science 576, pp.
             279–287. International Association for Cryptologic Research, Springer, 1992.

Page 32 of 33                                                                          §References
SEC 2 (Draft) Ver. 2.0                                                              References

[Mon87]       P. Montgomery. Speeding the pollard and elliptic curve methods of factorization.
              Mathematics of Computation, 48:243–264, 1987.




§References                                                                      Page 33 of 33
~~~
## 原文提取：papers__rijndael-gf__rijndael-ammended

> 对应提取源标识：papers__rijndael-gf__rijndael-ammended
>
> 对应 PDF：[rijndael-ammended.pdf](./rijndael-gf/rijndael-ammended.pdf)

~~~text

Joan Daemen
Vincent Rijmen                    Note on naming                                  Rijndael

                                  Note on naming
1. Introduction
After the selection of Rijndael as the AES, it was decided to change the names of some of its
component functions in order to improve the readability of the standard. However, we see that
many recent publications on Rijndael and the AES still use the old names, mainly because the
original submission documents using the old names, are still available on the Internet. In this
note we repeat quickly the new names for the component functions. Additionally, we remind
the reader on the difference between AES and Rijndael and present an overview of the most
important references for Rijndael and the AES.

2. References
[1]   Joan Daemen and Vincent Rijmen, AES submission document on Rijndael, June 1998.
[2]   Joan Daemen and Vincent Rijmen, AES submission document on Rijndael, Version 2,
      September 1999. http://csrc.nist.gov/CryptoToolkit/aes/rijndael/Rijndael.pdf
[3]   FIPS PUB 197, Advanced Encryption Standard (AES), National Institute of Standards
      and Technology, U.S. Department of Commerce, November 2001.
      http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf
[4]   Joan Daemen and Vincent Rijmen, The Design of Rijndael, AES - The Advanced
      Encryption Standard, Springer-Verlag 2002 (238 pp.)


3. Naming
The names of the component functions of Rijndael have been modified between the
publication of [2] and that of [3]. Table 1 lists the two versions of names. We recommend
using the new names.
                         Old naming                       New naming
                                     ByteSub                         SubBytes
                                    ShiftRow                        ShiftRows
                                  MixColumn                       MixColumns
                               AddRoundKey                       AddRoundKey

              Table 1: Old and new names of the Rijndael component functions


4. Range of key and block lengths in Rijndael and AES
Rijndael and AES differ only in the range of supported values for the block length and cipher
key length.
For Rijndael, the block length and the key length can be independently specified to any
multiple of 32 bits, with a minimum of 128 bits, and a maximum of 256 bits. The support for
block and key lengths 160 and 224 bits was introduced in reference [2].
AES fixes the block length to 128 bits, and supports key lengths of 128, 192 or 256 bits only.


Date: 9/04/2003                                                                         Page: 1/2
Joan Daemen
Vincent Rijmen                   Note on naming                                Rijndael

5. Referencing
Reference [3] is the US Federal Information Processing Standard defining AES and hence the
definitive reference on AES.
Reference [4] is the definitive reference on Rijndael. It is a book we have written after the
selection of Rijndael as AES and was published in February 2002. It describes all aspects of
Rijndael and is only available on paper.
Reference [1] is the original Rijndael documentation submitted to AES and dates from June
11, 1998. Reference [2] is an improved version dating from September 3, 1999 that
supersedes reference [1]. Both were made available electronically in PDF formats on several
sites. Both references should be used only when referring to the actual historical documents.
Technical or scientific references should be restricted to [3] and [4].
We propose to use the following BibTex entries:

@Book{Daemen:2002:DRA,
  author =       "Joan Daemen and Vincent Rijmen",
  title =        "The design of {Rijndael}: {AES} --- the {Advanced
                 Encryption Standard}",
  publisher =    "Spring{\-}er-Ver{\-}lag",
  pages =        "238",
  year =         "2002",
  ISBN =         "3-540-42580-2"
}

@misc{AES-FIPS,
   title = "Specification for the Advanced Encryption Standard (AES)",
   howpublished = "Federal Information Processing Standards Publication 197",
   year = "2001",
   url = " http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf"
}




Date: 9/04/2003                                                                      Page: 2/2
Authors:                                                                   AES Proposal
Joan Daemen                     The Rijndael Block Cipher
Vincent Rijmen


                          AES Proposal: Rijndael
                                Joan Daemen, Vincent Rijmen
               Joan Daemen                                          Vincent Rijmen
              Proton World Int.l                    Katholieke Universiteit Leuven, ESAT-COSIC
            Zweefvliegtuigstraat 10                                K. Mercierlaan 94
           B-1130 Brussel, Belgium                           B-3001 Heverlee, Belgium
          daemen.j@protonworld.com                      vincent.rijmen@esat.kuleuven.ac.be




Table of Contents
1. Introduction                                                                               4
  1.1 Document history                                                                        4
2. Mathematical preliminaries                                                                 4
                      8
  2.1 The field GF(2 )                                                                        4
    2.1.1 Addition                                                                            4
    2.1.2 Multiplication                                                                      5
    2.1.3 Multiplication by x                                                                 6
                                           8
  2.2 Polynomials with coefficients in GF(2 )                                                 6
    2.2.1 Multiplication by x                                                                 7

3. Design rationale                                                                           8
4. Specification                                                                              8
  4.1 The State, the Cipher Key and the number of rounds                                      8
  4.2 The round transformation                                                               10
    4.2.1 The ByteSub transformation                                                         11
    4.2.2 The ShiftRow transformation                                                        11
    4.2.3 The MixColumn transformation                                                       12
    4.2.4 The Round Key addition                                                             13
  4.3 Key schedule                                                                           14
    4.3.1 Key expansion                                                                      14
    4.3.2 Round Key selection                                                                15
  4.4 The cipher                                                                             16
5. Implementation aspects                                                                   16
  5.1 8-bit processor                                                                        16
  5.2 32-bit processor                                                                       17
    5.2.1 The Round Transformation                                                           17
    5.2.2 Parallelism                                                                        18
    5.2.3 Hardware suitability                                                               19
  5.3 The inverse cipher                                                                     19
    5.3.1 Inverse of a two-round Rijndael variant                                            19
    5.3.2 Algebraic properties                                                               20
    5.3.3 The equivalent inverse cipher structure                                            20
    5.3.4 Implementations of the inverse cipher                                              21
6. Performance figures                                                                      23
  6.1 8-bit processors                                                                       23
    6.1.1 Intel 8051                                                                         23

Document version 2, Date: 03/09/99                                                    Page: 1/45
Authors:                                                                         AES Proposal
Joan Daemen                     The Rijndael Block Cipher
Vincent Rijmen

    6.1.2 Motorola 68HC08                                                                      23
  6.2 32-bit processors                                                                        24
    6.2.1 Optimised ANSI C                                                                     24
    6.2.2 Java                                                                                 25
7. Motivation for design choices                                                              25
  7.1 The reduction polynomial m(x )                                                           25
  7.2 The ByteSub S-box                                                                        26
  7.3 The MixColumn transformation                                                             27
    7.3.1 Branch number                                                                        27
  7.4 The ShiftRow offsets                                                                     27
  7.5 The key expansion                                                                        28
  7.6 Number of rounds                                                                         28
8. Strength against known attacks                                                             30
  8.1 Symmetry properties and weak keys of the DES type                                        30
  8.2 Differential and linear cryptanalysis                                                    30
    8.2.1 Differential cryptanalysis                                                           30
    8.2.2 Linear cryptanalysis                                                                 30
    8.2.3 Weight of differential and linear trails                                             31
    8.2.4 Propagation of patterns                                                              31
  8.3 Truncated differentials                                                                  36
  8.4 The Square attack                                                                        36
    8.4.1 Preliminaries                                                                        36
    8.4.2 The basic attack                                                                     36
    8.4.3 Extension by an additional round at the end                                          37
    8.4.4 Extension by an additional round at the beginning                                    37
    8.4.5 Working factor and memory requirements for the attacks                               38
  8.5 Interpolation attacks                                                                    38
  8.6 Weak keys as in IDEA                                                                     38
  8.7 Related-key attacks                                                                      39
9. Expected strength                                                                          39
10. Security goals                                                                            39
  10.1 Definitions of security concepts                                                        39
    10.1.1 The set of possible ciphers for a given block length and key length                 39
    10.1.2 K-Security                                                                          40
    10.1.3 Hermetic block ciphers                                                              40
  10.2 Goal                                                                                    40
11. Advantages and limitations                                                                41
  11.1 Advantages                                                                              41
  11.2 Limitations                                                                             41
12. Extensions                                                                                42
  12.1 Other block and Cipher Key lengths                                                      42
  12.2 Another primitive based on the same round transformation                                42
13. Other functionality                                                                       42
  13.1 MAC                                                                                     42
  13.2 Hash function                                                                           43
  13.3 Synchronous stream cipher                                                               43
  13.4 Pseudorandom number generator                                                           43
  13.5 Self-synchronising stream cipher                                                        43
14. Suitability for ATM, HDTV, B-ISDN, voice and satellite                                    44
15. Acknowledgements                                                                          44

Document version 2, Date: 03/09/99                                                      Page: 2/45
Authors:                                                                                            AES Proposal
Joan Daemen                          The Rijndael Block Cipher
Vincent Rijmen

16. References                                                                                                               44
17. List of Annexes                                                                                                          45


Table of Figures
Figure 1: Example of State (with Nb = 6) and Cipher Key (with Nk = 4) layout. ......................... 9
Figure 2: ByteSub acts on the individual bytes of the State..................................................... 11
Figure 3: ShiftRow operates on the rows of the State. ............................................................ 12
Figure 4: MixColumn operates on the columns of the State. ................................................... 13
Figure 5: In the key addition the Round Key is bitwise EXORed to the State. ......................... 13
Figure 6: Key expansion and Round Key selection for Nb = 6 and Nk = 4. ............................. 15
Figure 7: Propagation of activity pattern (in grey) through a single round................................ 32
Figure 8: Propagation of patterns in a single round. ................................................................ 33
Figure 9: Illustration of Theorem 1 with Q = 2. ......................................................................... 34
Figure 10: Illustration of Lemma 1 with one active column in a1. ............................................. 35
Figure 11: Illustration of Theorem 2. ........................................................................................ 35
Figure 12: Complexity of the Square attack applied to Rijndael. ............................................. 38



List of Tables
Table 1: Number of rounds (Nr) as a function of the block and key length. ............................. 10
Table 2: Shift offsets for different block lengths....................................................................... 12
Table 3: Execution time and code size for Rijndael in Intel 8051 assembler. .......................... 23
Table 4: Execution time and code size for Rijndael in Motorola 68HC08 Assembler. .............. 24
Table 5: Number of cycles for the key expansion .................................................................... 24
Table 6: Cipher (and inverse) performance ............................................................................. 25
Table 7: Performance figures for the cipher execution (Java) ................................................. 25
Table 8: Shift offsets in Shiftrow for the alternative block lengths............................................ 42




�������� ������� �� ����� ��������                                                                                   ����� �/��
Authors:                                                                              AES Proposal
Joan Daemen                       The Rijndael Block Cipher
Vincent Rijmen




1. Introduction
In this document we describe the cipher Rijndael. First we present the mathematical basis
necessary for understanding the specifications followed by the design rationale and the
description itself. Subsequently, the implementation aspects of the cipher and its inverse are
treated. This is followed by the motivations of all design choices and the treatment of the
resistance against known types of attacks. We give our security claims and goals, the
advantages and limitations of the cipher, ways how it can be extended and how it can be used
for functionality other than block encryption/decryption. We conclude with the
acknowledgements, the references and the list of annexes.
Patent Statement: Rijndael or any of its implementations is not and will not be subject to
patents.

1.1 Document history
This is the second version of the Rijndael documentation. The main difference with the first
version is the correction of a number of errors and inconsistencies, the addition of a motivation
for the number of rounds, the addition of some figures in the section on differential and linear
cryptanalysis, the inclusion of Brian Gladman’s performance figures and the specification of
Rijndael extensions supporting block and key lengths of 160 and 224 bits.


2. Mathematical preliminaries
Several operations in Rijndael are defined at byte level, with bytes representing elements in
                     8
the finite field GF(2 ). Other operations are defined in terms of 4-byte words. In this section we
introduce the basic mathematical concepts needed in the following of the document.

2.1 The field GF(28)
The elements of a finite field [LiNi86] can be represented in several different ways. For any
                                                                             8
prime power there is a single finite field, hence all representations of GF(2 ) are isomorphic.
Despite this equivalence, the representation has an impact on the implementation complexity.
We have chosen for the classical polynomial representation.
A byte b, consisting of bits b7 b6 b5 b4 b3 b2 b1 b0, is considered as a polynomial with coefficient
in {0,1}:
                              7      6          5       4    3       2
                         b7 x + b 6 x + b 5 x + b 4 x + b 3 x + b 2 x + b 1 x + b 0
Example: the byte with hexadecimal value ‘57’ (binary 01010111) corresponds with
polynomial
                                            6       4   2
                                          x +x +x +x+1.

2.1.1 Addition
In the polynomial representation, the sum of two elements is the polynomial with coefficients
that are given by the sum modulo 2 (i.e., 1 + 1 = 0) of the coefficients of the two terms.



�������� ������� �� ����� ��������                                                           ����� �/��
Authors:                                                                                                                    AES Proposal
Joan Daemen                         The Rijndael Block Cipher
Vincent Rijmen

Example: ‘57’ + ‘83’ = ‘D4’, or with the polynomial notation:
                               6   4        2                  7                        7           6           4       2
                             ( x + x + x + x + 1 ) + ( x + x + 1) = x + x + x + x .
In binary notation we have: “01010111” + “10000011” = “11010100”. Clearly, the addition
corresponds with the simple bitwise EXOR ( denoted by ⊕ ) at the byte level.
All necessary conditions are fulfilled to have an Abelian group: internal, associative, neutral
element (‘00’), inverse element (every element is its own additive inverse) and commutative.
As every element is its own additive inverse, subtraction and addition are the same.

2.1.2 Multiplication
                                                                                    8
In the polynomial representation, multiplication in GF(2 ) corresponds with multiplication of
polynomials modulo an irreducible binary polynomial of degree 8. A polynomial is irreducible if
it has no divisors other than 1 and itself. For Rijndael, this polynomial is called m(x ) and given
by
                                                           8       4   3
                                                m(x ) = x + x + x + x + 1
or ‘11B’ in hexadecimal representation.
Example: ‘57’ • ‘83’ = ‘C1’, or:
          6    4     2                  7                              13       11              9           8       7
        (x + x + x + x + 1) ( x + x + 1)                   =           x +x +x +x +x +
                                                                       7        5           3           2
                                                                       x +x +x +x +x+
                                                                       6        4           2
                                                                       x +x +x +x+1
                                                                       13       11              9           8       6        5   4   3
                                                           =           x +x +x +x +x +x +x +x +1

         13    11        9     8    6       5     4    3                    8           4           3
        x + x + x + x + x + x + x + x + 1 modulo x + x + x + x + 1
                                                                       7        6
                                                           =           x +x +1
Clearly, the result will be a binary polynomial of degree below 8. Unlike for addition, there is no
simple operation at byte level.
The multiplication defined above is associative and there is a neutral element (‘01’). For any
binary polynomial b(x ) of degree below 8, the extended algorithm of Euclid can be used to
compute polynomials a(x ), c(x ) such that
                                                b(x )a(x ) + m(x )c(x ) = 1 .
Hence, a(x ) • b(x ) mod m(x )= 1 or
                                                 b−1(x ) = a(x ) mod m(x )
Moreover, it holds that a(x ) • (b(x ) + c(x )) = a(x ) • b(x ) + a(x ) • c(x ).
It follows that the set of 256 possible byte values, with the EXOR as addition and the
                                                                          8
multiplication defined as above has the structure of the finite field GF(2 ).




�������� ������� �� ����� ��������                                                                                                       ����� �/��
Authors:                                                                           AES Proposal
Joan Daemen                           The Rijndael Block Cipher
Vincent Rijmen

2.1.3 Multiplication by x
If we multiply b(x ) by the polynomial x, we have:
                              8         7       6   5       4       3       2
                        b7 x + b 6 x + b 5 x + b 4 x + b 3 x + b 2 x + b 1 x + b 0 x
x • b(x ) is obtained by reducing the above result modulo m(x ). If b7 = 0, this reduction is the
identity operation, If b7 = 1, m(x ) must be subtracted (i.e., EXORed). It follows that
multiplication by x (hexadecimal ‘02’) can be implemented at byte level as a left shift and a
subsequent conditional bitwise EXOR with ‘1B’. This operation is denoted by b = xtime(a).
In dedicated hardware, xtime takes only 4 EXORs. Multiplication by higher powers of x can
be implemented by repeated application of xtime. By adding intermediate results,
multiplication by any constant can be implemented.
Example: ‘57’ • ‘13’ = ‘FE’
                 ‘57’ • ‘02’ = xtime(57) = ‘AE’
                 ‘57’ • ‘04’ = xtime(AE) = ‘47’
                 ‘57’ • ‘08’ = xtime(47) = ‘8E’
                 ‘57’ • ‘10’ = xtime(8E) = ‘07’
        ‘57’ • ‘13’ = ‘57’ • (‘01’ ⊕ ‘02’ ⊕ ‘10’ ) = ‘57’ ⊕ ‘AE’ ⊕ ‘07’ = ‘FE’

2.2 Polynomials with coefficients in GF(28)
                                                                   8
Polynomials can be defined with coefficients in GF(2 ). In this way, a 4-byte vector
corresponds with a polynomial of degree below 4.
Polynomials can be added by simply adding the corresponding coefficients. As the addition in
     8
GF(2 ) is the bitwise EXOR, the addition of two vectors is a simple bitwise EXOR.
                                                                                       8
Multiplication is more complicated. Assume we have two polynomials over GF(2 ):
                                  3         2                          3    2
                 a(x ) = a3 x + a2 x + a1 x + a0 and b(x ) = b3 x + b2 x + b1 x + b0.
Their product c(x ) = a(x )b(x ) is given by
                    6         5         4       3   2
        c(x ) = c6 x + c5 x + c4 x + c3 x + c2 x + c1 x + c0               with
                 c0 = a0•b0                                       c4 = a3•b1 ⊕ a2•b2 ⊕ a1•b3
                 c1 = a1•b0 ⊕ a0•b1                               c5 = a3•b2 ⊕ a2•b3
                 c2 = a2•b0 ⊕ a1•b1 ⊕ a0•b2                       c6 = a3•b3
                 c3 = a3•b0 ⊕ a2•b1 ⊕ a1•b2 ⊕ a0•b3




�������� ������� �� ����� ��������                                                             ����� �/��
��������                                                                                     AES Proposal
���� ������                      The Rijndael Block Cipher
������� ������

Clearly, c(x ) can no longer be represented by a 4-byte vector. By reducing c(x ) modulo a
polynomial of degree 4, the result can be reduced to a polynomial of degree below 4. In
                                                    4
Rijndael, this is done with the polynomial M(x ) = x + 1. As
                                          i           4                i mod 4
                                         x mod x + 1 = x                         ,
the modular product of a(x ) and b(x ), denoted by d(x ) = a(x ) ⊗ b(x ) is given by
                     3       2
        d(x ) = d3 x + d2 x + d1 x + d0                            with
                         d0 = a0•b0 ⊕ a3•b1 ⊕ a2•b2 ⊕ a1•b3
                         d1 = a1•b0 ⊕ a0•b1 ⊕ a3•b2 ⊕ a2•b3
                         d2 = a2•b0 ⊕ a1•b1 ⊕ a0•b2 ⊕ a3•b3
                         d3 = a3•b0 ⊕ a2•b1 ⊕ a1•b2 ⊕ a0•b3
The operation consisting of multiplication by a fixed polynomial a(x ) can be written as matrix
multiplication where the matrix is a circulant matrix. We have

                                     ⎡d 0 ⎤ ⎡a0           a3      a2       a1 ⎤ ⎡b0 ⎤
                                     ⎢d ⎥ ⎢a              a0      a3       a2 ⎥ ⎢b1 ⎥
                                     ⎢ 1⎥ = ⎢ 1                               ⎥⎢ ⎥
                                     ⎢ d 2 ⎥ ⎢ a2         a1      a0       a3 ⎥ ⎢b2 ⎥
                                     ⎢ ⎥ ⎢                                    ⎥⎢ ⎥
                                     ⎣ d 3 ⎦ ⎣ a3         a2      a1       a0 ⎦ ⎣b3 ⎦
         4                                                                           8
Note: x + 1 is not an irreducible polynomial over GF(2 ), hence multiplication by a fixed
polynomial is not necessarily invertible. In the Rijndael cipher we have chosen a fixed
polynomial that does have an inverse.

2.2.1 Multiplication by x
If we multiply b(x ) by the polynomial x, we have:
                                              4           3            2
                                       b3 x + b 2 x + b 1 x + b 0 x
x ⊗ b(x ) is obtained by reducing the above result modulo 1 + x . This gives
                                                                                         4

                                                  3           2
                                        b2 x + b 1 x + b 0 x + b 3
The multiplication by x is equivalent to multiplication by a matrix as above with all ai =‘00’
except a1 =‘01’. Let c(x ) = x ⊗b(x ). We have:

                                     ⎡c0 ⎤ ⎡00        00          00       01⎤ ⎡b0 ⎤
                                     ⎢ c ⎥ ⎢01        00          00       00⎥ ⎢b1 ⎥
                                     ⎢ 1⎥ = ⎢                                ⎥⎢ ⎥
                                     ⎢c2 ⎥ ⎢00        01          00       00⎥ ⎢b2 ⎥
                                     ⎢ ⎥ ⎢                                   ⎥⎢ ⎥
                                     ⎣ c3 ⎦ ⎣00       00          01       00⎦ ⎣b3 ⎦
Hence, multiplication by x, or powers of x, corresponds to a cyclic shift of the bytes inside the
vector.




�������� ������� �� ����� ��������                                                                  ����� �/��
��������                                                                         AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

3. Design rationale
The three criteria taken into account in the design of Rijndael are the following:
        • Resistance against all known attacks;
        • Speed and code compactness on a wide range of platforms;
        • Design simplicity.
In most ciphers, the round transformation has the Feistel Structure. In this structure typically
part of the bits of the intermediate State are simply transposed unchanged to another position.
The round transformation of Rijndael does not have the Feistel structure. Instead, the round
transformation is composed of three distinct invertible uniform transformations, called layers.
By “uniform”, we mean that every bit of the State is treated in a similar way.
The specific choices for the different layers are for a large part based on the application of the
Wide Trail Strategy [Da95] (see Annex ), a design method to provide resistance against linear
and differential cryptanalysis (see Section 8.2). In the Wide Trail Strategy, every layer has its
own function:
  The linear mixing layer:           guarantees high diffusion over multiple rounds.
  The non-linear layer:              parallel application of S-boxes that have optimum worst-case
                                     nonlinearity properties.
  The key addition layer:            A simple EXOR of the Round Key to the intermediate State.


Before the first round, a key addition layer is applied. The motivation for this initial key addition
is the following. Any layer after the last key addition in the cipher (or before the first in the
context of known-plaintext attacks) can be simply peeled off without knowledge of the key and
therefore does not contribute to the security of the cipher. (e.g., the initial and final permutation
in the DES). Initial or terminal key addition is applied in several designs, e.g., IDEA, SAFER
and Blowfish.
In order to make the cipher and its inverse more similar in structure, the linear mixing layer of
the last round is different from the mixing layer in the other rounds. It can be shown that this
does not improve or reduce the security of the cipher in any way. This is similar to the absence
of the swap operation in the last round of the DES.


4. Specification
Rijndael is an iterated block cipher with a variable block length and a variable key length. The
block length and the key length can be independently specified to 128, 192 or 256 bits.
Note: this section is intended to explain the cipher structure and not as an implementation
guideline. For implementation aspects, we refer to Section 5.

4.1 The State, the Cipher Key and the number of rounds
The different transformations operate on the intermediate result, called the State:
Definition: the intermediate cipher result is called the State.
The State can be pictured as a rectangular array of bytes. This array has four rows, the
number of columns is denoted by Nb and is equal to the block length divided by 32.
Document version 2, Date: 03/09/99                                                          Page: 8/45
Authors:                                                                             AES Proposal
Joan Daemen                     The Rijndael Block Cipher
Vincent Rijmen

The Cipher Key is similarly pictured as a rectangular array with four rows. The number of
columns of the Cipher Key is denoted by Nk and is equal to the key length divided by 32.
These representations are illustrated in Figure 1.
In some instances, these blocks are also considered as one-dimensional arrays of 4-byte
vectors, where each vector consists of the corresponding column in the rectangular array
representation. These arrays hence have lengths of 4, 6 or 8 respectively and indices in the
ranges 0..3, 0..5 or 0..7. 4-byte vectors will sometimes be referred to as words.
Where it is necessary to specify the four individual bytes within a 4-byte vector or word the
notation (a, b, c, d) will be used where a, b, c and d are the bytes at positions 0, 1, 2 and 3
respectively within the column, vector or word being considered.

             a 0,0 a 0,1 a 0,2 a 0,3 a 0,4 a 0,5                        k 0,0 k 0,1 k 0,2 k 0,3

             a 1,0 a 1,1 a 1,2 a 1,3 a 1,4 a 1,5                        k 1,0 k 1,1 k 1,2 k 1,3

             a 2,0 a 2,1 a 2,2 a 2,3 a 2,4 a 2,5                        k 2,0 k 2,1 k 2,2 k 2,3

             a 3,0 a 3,1 a 3,2 a 3,3 a 3,4 a 3,5                        k 3,0 k 3,1 k 3,2 k 3,3

        Figure 1: Example of State (with Nb = 6) and Cipher Key (with Nk = 4) layout.

The input and output used by Rijndael at its external interface are considered to be one-
dimensional arrays of 8-bit bytes numbered upwards from 0 to the 4*Nb−1. These blocks
hence have lengths of 16, 24 or 32 bytes and array indices in the ranges 0..15, 0..23 or 0..31.
The Cipher Key is considered to be a one-dimensional arrays of 8-bit bytes numbered upwards
from 0 to the 4*Nk−1. These blocks hence have lengths of 16, 24 or 32 bytes and array
indices in the ranges 0..15, 0..23 or 0..31.
The cipher input bytes (the “plaintext” if the mode of use is ECB encryption) are mapped onto
the state bytes in the order a0,0, a1,0, a2,0, a3,0, a0,1, a1,1, a2,1, a3,1, a4,1 ... , and the bytes of the
Cipher Key are mapped onto the array in the order k0,0, k1,0, k2,0, k3,0, k0,1, k1,1, k2,1, k3,1, k4,1 ... At
the end of the cipher operation, the cipher output is extracted from the state by taking the state
bytes in the same order.
Hence if the one-dimensional index of a byte within a block is n and the two dimensional index
is (i ,j ), we have:

                 i = n mod 4 ;             j = ⎣n / 4 ⎦ ;                   n = i + 4* j
Moreover, the index i is also the byte number within a 4-byte vector or word and j is the index
for the vector or word within the enclosing block.
The number of rounds is denoted by Nr and depends on the values Nb and Nk. It is given in
Table 1.




�������� ������� �� ����� ��������                                                                 ����� �/��
��������                                                                          AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

                               Nr       Nb = 4         Nb = 6            Nb = 8
                            Nk = 4        10             12               14
                            Nk = 6        12             12               14
                            Nk = 8        14             14               14

          Table 1: Number of rounds (Nr) as a function of the block and key length.


4.2 The round transformation
The round transformation is composed of four different transformations. In pseudo C notation
we have:
       Round(State,RoundKey)
       {
       ByteSub(State);
       ShiftRow(State);
       MixColumn(State);
       AddRoundKey(State,RoundKey);
       }
The final round of the cipher is slightly different. It is defined by:
       FinalRound(State,RoundKey)
       {
       ByteSub(State) ;
       ShiftRow(State) ;
       AddRoundKey(State,RoundKey);
       }
In this notation, the “functions” (Round, ByteSub, ShiftRow, …) operate on arrays to which
pointers (State, RoundKey) are provided.
It can be seen that the final round is equal to the round with the MixColumn step removed.
The component transformations are specified in the following subsections.




�������� ������� �� ����� ��������                                                      ����� ��/��
��������                                                                          AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

4.2.1 The ByteSub transformation
The ByteSub Transformation is a non-linear byte substitution, operating on each of the State
bytes independently. The substitution table (or S-box ) is invertible and is constructed by the
composition of two transformations:
                                                               8
        1. First, taking the multiplicative inverse in GF(2 ), with the representation defined in
           Section 2.1. ‘00’ is mapped onto itself.
        2. Then, applying an affine (over GF(2) ) transformation defined by:

                               ⎡ y0 ⎤ ⎡1     0 0 0 1 1 1 1⎤ ⎡ x0 ⎤ ⎡1⎤
                              ⎢ y ⎥ ⎢1       1 0 0 0 1 1 1⎥ ⎢ x1 ⎥ ⎢1⎥
                              ⎢ 1⎥ ⎢                       ⎥⎢ ⎥ ⎢ ⎥
                              ⎢ y2 ⎥ ⎢1      1 1 0 0 0 1 1⎥ ⎢ x2 ⎥ ⎢0⎥
                              ⎢ ⎥ ⎢                        ⎥⎢ ⎥ ⎢ ⎥
                              ⎢ y3 ⎥ = ⎢1    1 1 1 0 0 0 1⎥ ⎢ x3 ⎥ ⎢0⎥
                                                                     +
                              ⎢ y4 ⎥ ⎢1      1 1 1 1 0 0 0⎥ ⎢ x4 ⎥ ⎢0⎥
                              ⎢ ⎥ ⎢                        ⎥⎢ ⎥ ⎢ ⎥
                              ⎢ y5 ⎥ ⎢0      1 1 1 1 1 0 0⎥ ⎢ x5 ⎥ ⎢1⎥
                              ⎢ y ⎥ ⎢0       0 1 1 1 1 1 0⎥ ⎢ x6 ⎥ ⎢1⎥
                              ⎢ 6⎥ ⎢                       ⎥⎢ ⎥ ⎢ ⎥
                              ⎢⎣ y7 ⎥⎦ ⎢⎣0   0 0 1 1 1 1 1⎥⎦ ⎢⎣ x7 ⎥⎦ ⎢⎣0⎥⎦
The application of the described S-box to all bytes of the State is denoted by:
                                             ByteSub(State) .
Figure 2 illustrates the effect of the ByteSub transformation on the State.


  a 0,0 a 0,1 a 0,2 a 0,3 a 0,4 a 0,5           S-box              b 0,0 b 0,1 b 0,2 b 0,3 b 0,4 b 0,5

  a 1,0 a 1,1 a 1,2 a
                    a 1,3 a 1,4 a 1,5                              b 1,0 b 1,1 b 1,2 b
                                                                                     b 1,3 b 1,4 b 1,5
                       i,j                                                              i,j
  a 2,0 a 2,1 a 2,2 a 2,3 a 2,4 a 2,5                              b 2,0 b 2,1 b 2,2 b 2,3 b 2,4 b 2,5

  a 3,0 a 3,1 a 3,2 a 3,3 a 3,4 a 3,5                              b 3,0 b 3,1 b 3,2 b 3,3 b 3,4 b 3,5

                   Figure 2: ByteSub acts on the individual bytes of the State.

The inverse of ByteSub is the byte substitution where the inverse table is applied. This is
obtained by the inverse of the affine mapping followed by taking the multiplicative inverse in
     8
GF(2 ).

4.2.2 The ShiftRow transformation
In ShiftRow, the rows of the State are cyclically shifted over different offsets. Row 0 is not
shifted, Row 1 is shifted over C1 bytes, row 2 over C2 bytes and row 3 over C3 bytes.
The shift offsets C1, C2 and C3 depend on the block length Nb. The different values are
specified in Table 2.




Document version 2, Date: 03/09/99                                                            Page: 11/45
��������                                                                                                 AES Proposal
���� ������                         The Rijndael Block Cipher
������� ������

                                  Nb               C1                  C2                    C3
                              4                     1                   2                     3
                              6                     1                   2                     3
                              8                     1                   3                     4

                            Table 2: Shift offsets for different block lengths.

The operation of shifting the rows of the State over the specified offsets is denoted by:
                                                  ShiftRow(State) .
Figure 3 illustrates the effect of the ShiftRow transformation on the State.

   m      n      o      p         ...                       no shift                 m        n      o     p   ...

    j      k      l     ...                                                           k by C1 l(1)
                                                                            cyclic shift             ...   h    i          j

    d     e       f     ...                                            cyclic shift by fC2 (2) a     b     c   d           e

    w      x     y      z         ...                                                 z
                                                                  cyclic shift by C3 (3)     ...           w   x           y

                      Figure 3: ShiftRow operates on the rows of the State.

The inverse of ShiftRow is a cyclic shift of the 3 bottom rows over Nb-C1, Nb-C2 and Nb-C3
bytes respectively so that the byte at position j in row i moves to position (j + Nb-Ci) mod Nb.

4.2.3 The MixColumn transformation
                                                                                                                       8
In MixColumn, the columns of the State are considered as polynomials over GF(2 ) and
                   4
multiplied modulo x + 1 with a fixed polynomial c(x ), given by
                                        c(x ) = ‘03’ x3 + ‘01’ x2 + ‘01’ x + ‘02’ .
                                           4
This polynomial is coprime to x + 1 and therefore invertible. As described in Section 2.2, this
can be written as a matrix multiplication. Let b(x ) = c(x ) ⊗ a(x ),

                                               ⎡b0 ⎤ ⎡02    03     01       01⎤ ⎡a 0 ⎤
                                               ⎢b ⎥ ⎢ 01    02     03       01⎥ ⎢ a1 ⎥
                                               ⎢ 1⎥ = ⎢                        ⎥⎢ ⎥
                                               ⎢b2 ⎥ ⎢ 01   01     02       03⎥ ⎢a 2 ⎥
                                               ⎢ ⎥ ⎢                           ⎥⎢ ⎥
                                               ⎣b3 ⎦ ⎣ 03   01     01       02 ⎦ ⎣ a 3 ⎦
The application of this operation on all columns of the State is denoted by
                                                  MixColumn(State).
Figure 4 illustrates the effect of the MixColumn transformation on the State.




Document version 2, Date: 03/09/99                                                                                  Page: 12/45
��������                                                                                                                                   AES Proposal
���� ������                                           The Rijndael Block Cipher
������� ������


                0,j       a                                                                                                       0,jb
  a 0,0 a 0,1 a 0,2 a 0,3 a 0,4 a 0,5                                                                               b 0,0 b 0,1 b 0,2 b 0,3 b 0,4 b 0,5
                                                                                ⊗ c (x )
  a 1,0 a 1,1 aa1,2
                1,j a 1,3 a 1,4 a 1,5                                                                               b 1,0 b 1,1 bb1,2
                                                                                                                                  1,j b 1,3 b 1,4 b 1,5

  a 2,0 a 2,1 aa2,2 a 2,3 a 2,4 a 2,5                                                                               b 2,0 b 2,1 bb2,2 b 2,3 b 2,4 b 2,5
                              2,j                                                                                                        2,j

  a 3,0 a 3,1 a 3,2 a 3,3 a 3,4 a 3,5                                                                               b 3,0 b 3,1 b 3,2 b 3,3 b 3,4 b 3,5
                          a 3,j                                                                                                      b 3,j

                               Figure 4: MixColumn operates on the columns of the State.

The inverse of MixColumn is similar to MixColumn. Every column is transformed by multiplying
it with a specific multiplication polynomial d(x ), defined by
                                              ( ‘03’ x + ‘01’ x + ‘01’ x + ‘02’ ) ⊗ d(x ) = ‘01’ .
                                                        3             2


It is given by:
                                                                            3                   2
                                                      d(x ) = ‘0B’ x + ‘0D’ x + ‘09’ x + ‘0E’ .

4.2.4 The Round Key addition
In this operation, a Round Key is applied to the State by a simple bitwise EXOR. The Round
Key is derived from the Cipher Key by means of the key schedule. The Round Key length is
equal to the block length Nb.
The transformation that consists of EXORing a Round Key to the State is denoted by:
                                                      AddRoundKey(State,RoundKey).
This transformation is illustrated in Figure 5.

  a 0,0   a 0,1   a 0,2       a 0,3   a 0,4   a 0,5         k 0,0   k 0,1       k 0,2   k 0,3       k 0,4   k 0,5            b 0,0       b 0,1   b 0,2   b 0,3   b 0,4   b 0,5

  a 1,0   a 1,1   a 1,2       a 1,3   a 1,4   a 1,5         k 1,0   k 1,1       k 1,2   k 1,3       k 1,4   k 1,5            b 1,0       b 1,1   b 1,2   b 1,3   b 1,4   b 1,5
                                                       ⊕                                                              =
  a 2,0   a 2,1   a 2,2       a 2,3   a 2,4   a 2,5         k 2,0   k 2,1       k 2,2   k 2,3       k 2,4   k 2,5            b 2,0       b 2,1   b 2,2   b 2,3   b 2,4   b 2,5

  a 3,0   a 3,1   a 3,2       a 3,3   a 3,4   a 3,5         k 3,0   k 3,1       k 3,2   k 3,3       k 3,4   k 3,5            b 3,0       b 3,1   b 3,2   b 3,3   b 3,4   b 3,5



           Figure 5: In the key addition the Round Key is bitwise EXORed to the State.

AddRoundKey is its own inverse.




Document version 2, Date: 03/09/99                                                                                                                               Page: 13/45
��������                                                                   AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

4.3 Key schedule
The Round Keys are derived from the Cipher Key by means of the key schedule. This consists
of two components: the Key Expansion and the Round Key Selection. The basic principle is
the following:
        • The total number of Round Key bits is equal to the block length multiplied by the
          number of rounds plus 1. (e.g., for a block length of 128 bits and 10 rounds, 1408
          Round Key bits are needed).
        • The Cipher Key is expanded into an Expanded Key.
        • Round Keys are taken from this Expanded Key in the following way: the first Round
          Key consists of the first Nb words, the second one of the following Nb words, and so
          on.

4.3.1 Key expansion
The Expanded Key is a linear array of 4-byte words and is denoted by W[Nb*(Nr+1)]. The
first Nk words contain the Cipher Key. All other words are defined recursively in terms of words
with smaller indices. The key expansion function depends on the value of Nk: there is a
version for Nk equal to or below 6, and a version for Nk above 6.
For Nk ≤ 6, we have:
       KeyExpansion(byte Key[4*Nk] word W[Nb*(Nr+1)])
       {
              for(i = 0; i < Nk; i++)
                     W[i] = (Key[4*i],Key[4*i+1],Key[4*i+2],Key[4*i+3]);

                 for(i = Nk; i < Nb * (Nr + 1); i++)
                 {
                      temp = W[i - 1];
                      if (i % Nk == 0)
                            temp = SubByte(RotByte(temp)) ^ Rcon[i / Nk];
                      W[i] = W[i - Nk] ^ temp;
                 }
        }

In this description, SubByte(W) is a function that returns a 4-byte word in which each byte is
the result of applying the Rijndael S-box to the byte at the corresponding position in the input
word. The function RotByte(W) returns a word in which the bytes are a cyclic permutation of
those in its input such that the input word (a,b,c,d) produces the output word (b,c,d,a).
It can be seen that the first Nk words are filled with the Cipher Key. Every following word W[i]
is equal to the EXOR of the previous word W[i-1] and the word Nk positions earlier W[i-Nk].
For words in positions that are a multiple of Nk, a transformation is applied to W[i-1] prior to
the EXOR and a round constant is EXORed. This transformation consists of a cyclic shift of
the bytes in a word (RotByte), followed by the application of a table lookup to all four bytes
of the word (SubByte).




Document version 2, Date: 03/09/99                                                    Page: 14/45
��������                                                                             AES Proposal
���� ������                      The Rijndael Block Cipher
������� ������

For Nk > 6, we have:

        KeyExpansion(byte Key[4*Nk] word W[Nb*(Nr+1)])
        {
             for(i = 0; i < Nk; i++)
                   W[i] = (key[4*i],key[4*i+1],key[4*i+2],key[4*i+3]);

                 for(i = Nk; i < Nb * (Nr + 1); i++)
                 {
                      temp = W[i - 1];
                      if (i % Nk == 0)
                            temp = SubByte(RotByte(temp)) ^ Rcon[i / Nk];
                      else if (i % Nk == 4)
                            temp = SubByte(temp);
                      W[i] = W[i - Nk] ^ temp;
                 }
        }

The difference with the scheme for Nk ≤ 6 is that for i-4 a multiple of Nk, SubByte is applied
to W[i-1] prior to the EXOR.
The round constants are independent of Nk and defined by:
        Rcon[i] = (RC[i],‘00’,‘00’,‘00’)
with RC[I] representing an element in GF(2 ) with a value of x −
                                                8               (i   1)
                                                                          so that:
        RC[1] = 1 (i.e. ‘01’)
        RC[i] = x (i.e. ‘02’) •(RC[i-1]) = x(i-1)

4.3.2 Round Key selection
Round key i is given by the Round Key buffer words W[Nb*i] to W[Nb*(i+1)]. This is
illustrated in Figure 6.


  W0    W1     W2    W3     W4       W5   W6   W7   W8   W 9 W 10 W 11 W 12 W 13 W 14         ...




            Round key 0                         Round key 1                            ...




            Figure 6: Key expansion and Round Key selection for Nb = 6 and Nk = 4.

Note: The key schedule can be implemented without explicit use of the array W[Nb*(Nr+1)].
For implementations where RAM is scarce, the Round Keys can be computed on-the-fly using
a buffer of Nk words with almost no computational overhead.




Document version 2, Date: 03/09/99                                                           Page: 15/45
��������                                                                  AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

4.4 The cipher
The cipher Rijndael consists of
        • an initial Round Key addition;
        • Nr-1 Rounds;
        • a final round.
In pseudo C code, this gives:
       Rijndael(State,CipherKey)
       {
       KeyExpansion(CipherKey,ExpandedKey) ;
       AddRoundKey(State,ExpandedKey);
       For( i=1 ; i<Nr ; i++ ) Round(State,ExpandedKey + Nb*i) ;
       FinalRound(State,ExpandedKey + Nb*Nr);
       }
The key expansion can be done on beforehand and Rijndael can be specified in terms of the
Expanded Key.
      Rijndael(State,ExpandedKey)
      {
      AddRoundKey(State,ExpandedKey);
      For( i=1 ; i<Nr ; i++ ) Round(State,ExpandedKey + Nb*i) ;
      FinalRound(State,ExpandedKey + Nb*Nr);
      }
Note: the Expanded Key shall always be derived from the Cipher Key and never be specified
directly. There are however no restrictions on the selection of the Cipher Key itself.


5. Implementation aspects
The Rijndael cipher is suited to be implemented efficiently on a wide range of processors and
in dedicated hardware. We will concentrate on 8-bit processors, typical for current Smart Cards
and on 32-bit processors, typical for PCs.

5.1 8-bit processor
On an 8-bit processor, Rijndael can be programmed by simply implementing the different
component transformations. This is straightforward for RowShift and for the Round Key
addition. The implementation of ByteSub requires a table of 256 bytes.
The Round Key addition, ByteSub and RowShift can be efficiently combined and executed
serially per State byte. Indexing overhead is minimised by explicitly coding the operation for
every State byte.
                                                                               8
The transformation MixColumn requires matrix multiplication in the field GF(2 ). This can be
implemented in an efficient way. We illustrate it for one column:
        Tmp = a[0] ^ a[1] ^ a[2] ^ a[3] ; /* a is a byte array */
        Tm = a[0] ^ a[1] ; Tm = xtime(Tm); a[0] ^= Tm ^ Tmp ;
        Tm = a[1] ^ a[2] ; Tm = xtime(Tm); a[1] ^= Tm ^ Tmp ;
        Tm = a[2] ^ a[3] ; Tm = xtime(Tm); a[2] ^= Tm ^ Tmp ;
        Tm = a[3] ^ a[0] ; Tm = xtime(Tm); a[3] ^= Tm ^ Tmp ;


Document version 2, Date: 03/09/99                                                   Page: 16/45
��������                                                                                   AES Proposal
���� ������                      The Rijndael Block Cipher
������� ������

This description is for clarity. In practice, coding is of course done in assembly language. To
prevent timing attacks, attention must be paid that xtime is implemented to take a fixed
number of cycles, independent of the value of its argument. In practice this can be achieved by
using a dedicated table-lookup.
Obviously, implementing the key expansion in a single shot operation is likely to occupy too
much RAM in a Smart Card. Moreover, in most applications, such as debit cards or electronic
purses, the amount of data to be enciphered, deciphered or that is subject to a MAC is
typically only a few blocks per session. Hence, not much performance can be gained by
expanding the key only once for multiple applications of the block cipher.
The key expansion can be implemented in a cyclic buffer of 4*max(Nb,Nk) bytes. The
Round Key is updated in between Rounds. All operations in this key update can be
implemented efficiently on byte level. If the Cipher Key length and the blocks length are equal
or differ by a factor 2, the implementation is straightforward. If this is not the case, an
additional buffer pointer is required.

5.2 32-bit processor

5.2.1 The Round Transformation
The different steps of the round transformation can be combined in a single set of table
lookups, allowing for very fast implementations on processors with word length 32 or above. In
this section, it is explained how this can be done.
We express one column of the round output e in terms of bytes of the round input a. In this
section, ai,j denotes the byte of a in row i and column j, aj denotes the column j of State a. For
the key addition and the MixColumn transformation, we have
                    ⎡ e 0, j ⎤ ⎡ d 0, j ⎤ ⎡ k 0, j ⎤   ⎡d 0, j ⎤ ⎡02     03 01 01⎤ ⎡c0 , j ⎤
                    ⎢e ⎥ ⎢d ⎥ ⎢ k ⎥                    ⎢d ⎥ ⎢                      ⎢ ⎥
                    ⎢ 1, j ⎥ = ⎢ 1, j ⎥ ⊕ ⎢ 1, j ⎥ and ⎢ 1, j ⎥ = ⎢ 01   02 03 01⎥ ⎢ c1, j ⎥
                                                                                 ⎥           .
                    ⎢e2 , j ⎥ ⎢d 2 , j ⎥ ⎢ k 2 , j ⎥   ⎢d 2 , j ⎥ ⎢ 01   01 02 03⎥ ⎢c2 , j ⎥
                    ⎢ ⎥ ⎢               ⎥ ⎢ ⎥          ⎢        ⎥ ⎢              ⎥⎢ ⎥
                    ⎣ e3, j ⎦ ⎣d 3, j ⎦ ⎣ k 3, j ⎦     ⎣ d 3, j ⎦ ⎣ 03   01 01 02⎦ ⎣c3, j ⎦

For the ShiftRow and the ByteSub transformations, we have:
                                     ⎡c0, j ⎤ ⎡ b0, j ⎤
                                     ⎢c ⎥ ⎢b                 ⎥
                                     ⎢c2 , j ⎥ ⎢b2 , j − C 2 ⎥           [ ]
                                     ⎢ 1, j ⎥ = ⎢ 1, j − C1 ⎥ and b = S a .
                                                                   i, j  i, j

                                     ⎢ ⎥ ⎢                   ⎥
                                     ⎣ c3, j ⎦ ⎣b3, j − C3 ⎦
In this expression the column indices must be taken modulo Nb. By substitution, the above
expressions can be combined into:

                             ⎡e0 , j ⎤ ⎡02
                                                          ⎡           [ ]⎤
                                                03 01 01⎤ ⎢ S a0, j ⎥ ⎡ k 0, j ⎤
                             ⎢ ⎥ ⎢
                             ⎢ e1, j ⎥ = ⎢ 01                     [         ]
                                                                            ⎢ ⎥
                                                02 03 01⎥ ⎢ S a1, j − C1 ⎥ ⎢ k1, j ⎥
                                                        ⎥⎢               ⎥⊕
                                                                  [         ]
                                                                                       .
                             ⎢e2 , j ⎥ ⎢01      01 02 03⎥ ⎢S a2, j − C 2 ⎥ ⎢ k 2 , j ⎥
                             ⎢ ⎥ ⎢                      ⎥                ⎥ ⎢ k 3, j ⎥
                                                01 01 02⎦ ⎢S a
                             ⎣ e3, j ⎦ ⎣ 03                       [         ]
                                                          ⎢⎣ 3, j − C 3 ⎥⎦ ⎣ ⎦

�������� ������� �� ����� ��������                                                               ����� ��/��
��������                                                                                          AES Proposal
���� ������                      The Rijndael Block Cipher
������� ������


The matrix multiplication can be expressed as a linear a combination of vectors:
           ⎡e0, j ⎤           ⎡02⎤            ⎡ 03⎤               ⎡ 01⎤               ⎡ 01⎤ ⎡ k 0, j ⎤
           ⎢e ⎥               ⎢ 01⎥           ⎢02 ⎥               ⎢ 03⎥               ⎢ 01⎥ ⎢ k ⎥
           ⎢ 1, j ⎥ = S a ⎢ ⎥ ⊕ S a
           ⎢e2 , j ⎥  [ ]0, j
                              ⎢01⎥      [
                                    1, j − C1   ]
                                              ⎢ ⎥⊕S a
                                              ⎢01⎥           [
                                                      2, j − C 2      ]
                                                                  ⎢ ⎥⊕S a
                                                                  ⎢02⎥            [
                                                                          3, j − C 3          ]
                                                                                      ⎢ ⎥ ⊕ ⎢ 1, j ⎥.
                                                                                      ⎢03⎥ ⎢k 2, j ⎥
           ⎢ ⎥                ⎢ ⎥             ⎢ ⎥                 ⎢ ⎥                 ⎢ ⎥ ⎢ ⎥
           ⎣ e3, j ⎦          ⎣ 03⎦           ⎣ 01⎦              ⎣ 01⎦               ⎣ 02⎦  ⎣ k 3, j ⎦
The multiplication factors S[ai,j] of the four vectors are obtained by performing a table lookup
on input bytes ai,j in the S-box table S[256].
We define tables T0 to T3 :
                      ⎡S[a ] • 02⎤           ⎡S[a ] • 03⎤            ⎡ S[a ] ⎤               ⎡ S[ a ] ⎤
                      ⎢           ⎥          ⎢            ⎥          ⎢            ⎥          ⎢           ⎥
                      ⎢   S[a ] ⎥            ⎢S[ a ] • 02 ⎥          ⎢ S[ a ] • 03⎥          ⎢  S[ a ] ⎥
           T0 [ a ] =               T [a ] =                T [a ] =                T [a ] =               .
                      ⎢ S[a ] ⎥ 1            ⎢ S[a ] ⎥ 2             ⎢S[a ] • 02⎥ 3          ⎢S[a ] • 03⎥
                      ⎢           ⎥          ⎢            ⎥          ⎢            ⎥          ⎢           ⎥
                      ⎣S[ a ] • 03⎦          ⎣ S[a ] ⎦               ⎣ S[a ] ⎦               ⎣S[a ] • 02 ⎦
These are 4 tables with 256 4-byte word entries and make up for 4KByte of total space. Using
these tables, the round transformation can be expressed as:

                                 [ ] [                   ] [           ] [                ]
                         e j = T0 a0, j ⊕ T1 a1, j − C1 ⊕ T2 a2, j −C 2 ⊕ T3 a3, j − C 3 ⊕ k j .

Hence, a table-lookup implementation with 4 Kbytes of tables takes only 4 table lookups and 4
EXORs per column per round.
It can be seen that Ti[a] = RotByte(Ti-1[a]). At the cost of 3 additional rotations per round per
column, the table-lookup implementation can be realised with only one table, i.e., with a total
table size of 1KByte. We have

                [ ]                         [        ]                    [           ]
e j = k j ⊕ T0 b0 , j ⊕ Rotbyte(T0 b1, j − C 1 ⊕ Rotbyte(T0 b2 , j − C 2 ⊕ R otbyte(T0 b3, j − C 3 )))  [           ]
The code-size (relevant in applets) can be kept small by including code to generate the tables
instead of the tables themselves.
In the final round, there is no MixColumn operation. This boils down to the fact that the S table
must be used instead of the T tables. The need for additional tables can be suppressed by
extracting the S table from the T tables by masking while executing the final round.
Most operations in the key expansion can be implemented by 32-bit word EXORs. The
additional transformations are the application of the S-box and a cyclic shift over 8-bits. This
can be implemented very efficiently.

5.2.2 Parallelism
It can be seen that there is considerable parallelism in the round transformation. All four
component transformations of the round act in a parallel way on bytes, rows or columns of the
State.
In the table-lookup implementation, all table lookups can in principle be done in parallel. The
EXORs can be done in parallel for the most part also.


Document version 2, Date: 03/09/99                                                                             Page: 18/45
��������                                                                      AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

The key expansion is clearly of a more sequential nature: the value of W[i-1] is needed for the
computation of W[i]. However, in most applications where speed is critical, the KeyExpansion
has to be done only once for a large number of cipher executions. In applications where the
Cipher Key changes often (in extremis once per application of the Block Cipher), the key
expansion and the cipher Rounds can be done in parallel..

5.2.3 Hardware suitability
The cipher is suited to be implemented in dedicated hardware. There are several trade-offs
between area and speed possible. Because the implementation in software on general-
purpose processors is already very fast, the need for hardware implementations will very
probably be limited to two specific cases:
        • Extremely high speed chip with no area restrictions: the T tables can be hardwired
          and the EXORs can be conducted in parallel.
        • Compact co-processor on a Smart Card to speed up Rijndael execution: for this
          platform typically the S-box and the xtime (or the complete MixColumn) operation
          can be hardwired.

5.3 The inverse cipher
In the table-lookup implementation it is essential that the only non-linear step (ByteSub) is the
first transformation in a round and that the rows are shifted before MixColumn is applied. In the
Inverse of a round, the order of the transformations in the round is reversed, and consequently
the non-linear step will end up being the last step of the inverse round and the rows are shifted
after the application of (the inverse of) MixColumn. The inverse of a round can therefore not be
implemented with the table lookups described above.
This implementation aspect has been anticipated in the design. The structure of Rijndael is
such that the sequence of transformations of its inverse is equal to that of the cipher itself, with
the transformations replaced by their inverses and a change in the key schedule. This is
shown in the following subsections.
Note: this identity in structure differs from the identity of components and structure in IDEA
[LaMaMu91].

5.3.1 Inverse of a two-round Rijndael variant
The inverse of a round is given by:
       InvRound(State,RoundKey)
       {
       AddRoundKey(State,RoundKey);
       InvMixColumn(State);
       InvShiftRow(State);
       InvByteSub(State);
       }
The inverse of the final round is given by:
       InvFinalRound(State,RoundKey)
       {
       AddRoundKey(State,RoundKey);
       InvShiftRow(State);
       InvByteSub(State);
       }
Document version 2, Date: 03/09/99                                                        Page: 19/45
��������                                                                   AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

The inverse of a two-round variant of Rijndael consists of the inverse of the final round
followed by the inverse of a round, followed by a Round Key Addition. We have:
       AddRoundKey(State,ExpandedKey+2*Nb);
       InvShiftRow(State);
       InvByteSub(State);
       AddRoundKey(State,ExpandedKey+Nb);
       InvMixColumn(State);
       InvShiftRow(State);
       InvByteSub(State);
       AddRoundKey(State,ExpandedKey);

5.3.2 Algebraic properties
In deriving the equivalent structure of the inverse cipher, we make use of two properties of the
component transformations.
First, the order of ShiftRow and ByteSub is indifferent. ShiftRow simply transposes the bytes
and has no effect on the byte values. ByteSub works on individual bytes, independent of their
position.
Second, the sequence
      AddRoundKey(State,RoundKey);
      InvMixColumn(State);
can be replaced by:
       InvMixColumn(State);
       AddRoundKey(State,InvRoundKey);
with InvRoundKey obtained by applying InvMixColumn to the corresponding RoundKey. This is
based on the fact that for a linear transformation A, we have A(x+k)= A(x )+A(k).

5.3.3 The equivalent inverse cipher structure
Using the properties described above, the inverse of the two-round Rijndael variant can be
transformed into:
        AddRoundKey(State,ExpandedKey+2*Nb);

        InvByteSub(State);
        InvShiftRow(State);
        InvMixColumn(State);
        AddRoundKey(State,I_ExpandedKey+Nb);

        InvByteSub(State);
        InvShiftRow(State);
        AddRoundKey(State,ExpandedKey);


It can be seen that we have again an initial Round Key addition, a round and a final round. The
Round and the final round have the same structure as those of the cipher itself. This can be
generalised to any number of rounds.




�������� ������� �� ����� ��������                                                     ����� ��/��
Authors:                                                                  AES Proposal
Joan Daemen                     The Rijndael Block Cipher
Vincent Rijmen

We define a round and the final round of the inverse cipher as follows:
      I_Round(State,I_RoundKey)
      {
      InvByteSub(State);
      InvShiftRow(State);
      InvMixColumn(State);
      AddRoundKey(State,I_RoundKey);
      }

        I_FinalRound(State,I_RoundKey)
        {
        InvByteSub(State);
        InvShiftRow(State);
        AddRoundKey(State,RoundKey0);
        }

The Inverse of the Rijndael Cipher can now be expressed as follows:

        I_Rijndael(State,CipherKey)
        {
        I_KeyExpansion(CipherKey,I_ExpandedKey) ;
        AddRoundKey(State,I_ExpandedKey+ Nb*Nr);
        For( i=Nr-1 ; i>0 ; i-- ) Round(State,I_ExpandedKey+ Nb*i) ;
        FinalRound(State,I_ExpandedKey);
        }
The key expansion for the Inverse Cipher is defined as follows:
        1. Apply the Key Expansion.
        2. Apply InvMixColumn to all Round Keys except the first and the last one.
In Pseudo C code, this gives:
       I_KeyExpansion(CipherKey,I_ExpandedKey)
       {
       KeyExpansion(CipherKey,I_ExpandedKey);
       for( i=1 ; i < Nr ; i++ )
             InvMixColumn(I_ExpandedKey + Nb*i) ;
       }

5.3.4 Implementations of the inverse cipher
The choice of the MixColumn polynomial and the key expansion was partly based on cipher
performance arguments. Since the inverse cipher is similar in structure, but uses a MixColumn
transformation with another polynomial and (in some cases) a modified key schedule, a
performance degradation is observed on 8-bit processors.
This asymmetry is due to the fact that the performance of the inverse cipher is considered to
be less important than that of the cipher. In many applications of a block cipher, the inverse
cipher operation is not used. This is the case for the calculation of MACs, but also when the
cipher is used in CFB-mode or OFB-mode.




�������� ������� �� ����� ��������                                                   ����� ��/��
��������                                                                    AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

5.3.4.1 8-bit processors

As explained in Section 4.1, the operation MixColumn can be implemented quite efficiently on
8-bit processors. This is because the coefficients of MixColumn are limited to ‘01’, ‘02’ and ‘03’
and because of the particular arrangement in the polynomial. Multiplication with these
coefficients can be done very efficiently by means of the procedure xtime(). The coefficients
of InvMixColumn are ‘09’, ’0E', ’0B' and ’0D'. In our 8-bit implementation, these multiplications
take significantly more time. A considerable speed-up can be obtained by using table lookups
at the cost of additional tables.
The key expansion operation that generates W is defined in such a way that we can also start
with the last Nk words of Round Key information and roll back to the original Cipher Key. So,
calculation ’on-the-fly' of the Round Keys, starting from an “Inverse Cipher Key”, is still
possible.

5.3.4.2 32-bit processors

The Round of the inverse cipher can be implemented with table lookups in exactly the same
way as the round of the cipher and there is no performance degradation with respect to the
cipher. The look-up tables for the inverse are of course different.
The key expansion for the inverse cipher is slower, because after the key expansion all but two
of the Round Keys are subject to InvMixColumn (cf. Section 5.3.3).

5.3.4.3 Hardware suitability

Because the cipher and its inverse use different transformations, a circuit that implements
Rijndael does not automatically support the computation of the inverse of Rijndael. Still, in a
circuit implementing both Rijndael and its inverse, parts of the circuit can be used for both
functions.
This is for instance the case for the non-linear layer. The S-box is constructed from two
mappings:
                                         S(x ) = f(g(x )),
where g(x ) is the mapping:
                                        x ⇒ x− in GF(2 )
                                               1         8


and f(x ) is the affine mapping.
                                               –1            –1 –1    –1
The mapping g(x ) is self-inverse and hence S (x ) = g (f (x )) = g(f (x )). Therefore when we
                     –1                                      –1                      –1
want both S and S , we need to implement only g, f and f . Since both f and f are very
simple bit-level functions, the extra hardware can be reduced significantly compared to having
two full S-boxes.
Similar arguments apply to the re-use of the xtime transformation in the diffusion layer.




�������� ������� �� ����� ��������                                                      ����� ��/��
��������                                                                     AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

6. Performance figures

6.1 8-bit processors
Rijndael has been implemented in assembly language for two types of microprocessors that
are representative for Smart Cards in use today.
In these implementations the Round Keys are computed in between the rounds of the cipher
(just-in-time calculation of the Round Keys) and therefore the key schedule is repeated for
every cipher execution. This means that there is no extra time required for key set-up or a key
change. There is also no time required for algorithm set-up. We have only implemented the
forward operation of the cipher. Implementation efforts by other people have indicated that the
inverse cipher turns out to be about 30 % slower. This is due to reasons explained in the
section on implementation.

6.1.1 Intel 8051
Rijndael has been implemented on the Intel 8051 microprocessor, using 8051 Development
tools of Keil Elektronik: uVision IDE for Windows and dScope Debugger/Simulator for
Windows.
Execution time for several code sizes is given in Table 3 (1 cycle = 12 oscillator periods).


                     Key/Block Length   Number of Cycles          Code length
                     (128,128) a)             4065 cycles            768 bytes
                     (128,128) b)             3744 cycles            826 bytes
                     (128,128) c)             3168 cycles           1016 bytes
                     (192,128)                4512 cycles           1125 bytes
                     (256,128)                5221 cycles           1041 bytes

         Table 3: Execution time and code size for Rijndael in Intel 8051 assembler.

6.1.2 Motorola 68HC08
Rijndael has been implemented on the Motorola 68HC08 microprocessor using the 68HC08
development tools by P&E Microcomputer Systems, Woburn, MA USA, the IASM08 68HC08
Integrated Assembler and SIML8 68HC08 simulator. Execution time, code size and required
RAM for a number of implementations are given in Table 4 (1 cycle = 1oscillator period). No
optimisation of code length has been attempted for this processor.




�������� ������� �� ����� ��������                                                      ����� ��/��
��������                                                                            AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

           Key/Block Length          Number of Cycles     Required RAM        Code length
           (128,128) a)                    8390 cycles            36 bytes           919 bytes
           (192,128)                      10780 cycles            44 bytes          1170 bytes
           (256,128)                      12490 cycles            52 bytes          1135 bytes

    Table 4: Execution time and code size for Rijndael in Motorola 68HC08 Assembler.


6.2 32-bit processors

6.2.1 Optimised ANSI C
We have no access to a Pentium Pro computer. Speed estimates for this platform were
originally generated by compiling the code with EGCS (release 1.0.2) and executing it on a
200 MHz Pentium, running Linux. However, since this report was first published further
performance figures have become available and those published by Brian Gladman are
reported below.
The AES CD figures are for ANSI C using the NIST API. The figures reported by Brian
Gladman are for the Pentium Pro and Pentium II processor families using a more efficient
interface. These results were obtained with the Microsoft Visual C++ (version 6) compiler that
provides fast intrinsic rotate instructions. The ability to use these instructions within C code
provides substantial performance gains without incurring significant portability problems since
many C compilers now offer equivalent facilities. The speed figures given in the tables have
been scaled to be those that would apply on the 200MHz Pentium Pro reference platform.
Algorithm set-up takes no time. Key set-up and key change take exactly the same time: the
time to generate the Expanded Key from the Cipher Key. The key set-up for the inverse cipher
takes more time than the key set-up for the cipher itself (cf. Section 5.3.3).
Table 5 lists the number of cycles needed for the key expansion.


        # cycles                AES CD (ANSI C)                   Brian Gladman (Visual C++)
                                                             -1                                      -1
      (key,block)                    Rijndael     Rijndael               Rijndael         Rijndael
      length
      (128,128)                         2100             2900                305                 1389
      (192,128)                         2600             3600                277                 1595
      (256,128)                         2800             3800                374                 1960

                         Table 5: Number of cycles for the key expansion

The cipher and its inverse take the same time. The difference in performance that is discussed
in the section on implementation, is only caused by the difference in the key set-up. Table 6
gives the figures for the raw encryption, when implemented in C, without counting the
overhead caused by the AES API.




Document version 2, Date: 03/09/99                                                               Page: 24/45
��������                                                                      AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

     (key,block)                AES CD (ANSI C)                Brian Gladman (Visual C++)
     length
                      speed (Mbits/Sec)     # cycles/block   speed (Mbits/Sec)   # cycles/block
     (128,128)                       27.0             950                 70.5             363
     (192,128)                       22.8           1125                  59.3             432
     (256,128)                       19.8           1295                  51.2             500

                             Table 6: Cipher (and inverse) performance

6.2.2 Java
We gratefully accepted the generous offer from Cryptix to produce the Java implementation.
Cryptix provides however no performance figures. Our estimates are based on the execution
time of the KAT and MCT code on a 200 MHz Pentium, running Linux. The JDK1.1.1 Java
compiler was used. The performance figures of the Java implementation are given in Table 7.
We cannot provide estimates for the key set-up or algorithm set-up time.
                   Key/Block length             Speed        # cycles for Rijndael
                   (128,128)                1100 Kbit/s              23.0 Kcycles
                   (192,128)                 930 Kbit/s              27.6 Kcycles
                   (256,128)                 790 Kbit/s              32.3 Kcycles

                  Table 7: Performance figures for the cipher execution (Java)


7. Motivation for design choices
In the following subsections, we will motivate the choice of the specific transformations and
constants. We believe that the cipher structure does not offer enough degrees of freedom to
hide a trap door.

7.1 The reduction polynomial m(x )
                                                                 8
The polynomial m(x ) (‘11B’) for the multiplication in GF(2 ) is the first one of the list of
irreducible polynomials of degree 8, given in [LiNi86, p. 378].




�������� ������� �� ����� ��������                                                      ����� ��/��
��������                                                                                     AES Proposal
���� ������                      The Rijndael Block Cipher
������� ������

7.2 The ByteSub S-box
The design criteria for the S-box are inspired by differential and linear cryptanalysis on the one
hand and attacks using algebraic manipulations, such as interpolation attacks, on the other:
        1. Invertibility;
        2. Minimisation of the largest non-trivial correlation between linear combinations of
           input bits and linear combination of output bits;
        3. Minimisation of the largest non-trivial value in the EXOR table;
                                                                      8
        4. Complexity of its algebraic expression in GF(2 );
        5. Simplicity of description.
In [Ny94] several methods are given to construct S-boxes that satisfy the first three criteria. For
invertible S-boxes operating on bytes, the maximum input/output correlation can be made as
low as 2− and the maximum value in the EXOR table can be as low as 4 (corresponding to a
          3

difference propagation probability of 2− ).
                                        6


We have decided to take from the candidate constructions in [Ny94] the S-box defined by the
mapping x ⇒ x− in GF(2 ).
              1       8


By definition, the selected mapping has a very simple algebraic expression. This enables
algebraic manipulations that can be used to mount attacks such as interpolation attacks
[JaKn97]. Therefore, the mapping is modified by composing it with an additional invertible
affine transformation. This affine transformation does not affect the properties with respect tot
the first three criteria, but if properly chosen, allows the S-box to satisfy the fourth criterion.
We have chosen an affine mapping that has a very simple description per se, but a
complicated algebraic expression if combined with the ‘inverse’ mapping. It can be seen as
modular polynomial multiplication followed by an addition:
                   b( x ) = ( x 7 + x 6 + x 2 + x) + a ( x )(x 7 + x 6 + x 5 + x 4 + 1) mod x 8 + 1
The modulus has been chosen as the simplest modulus possible. The multiplication polynomial
has been chosen from the set of polynomials coprime to the modulus as the one with the
simplest description. The constant has been chosen in such a way that that the S-box has no
fixed points (S-box(a) = a) and no ’opposite fixed points' (S-box(a) = a ).
Note: other S-boxes can be found that satisfy the criteria above. In the case of suspicion of a
trapdoor being built into the cipher, the current S-box might be replaced by another one. The
cipher structure and number of rounds as defined even allow the use of an S-box that does
not optimise the differential and linear cryptanalysis properties (criteria 2 and 3). Even an S-
box that is “average” in this respect is likely to provide enough resistance against differential
and linear cryptanalysis.




�������� ������� �� ����� ��������                                                                    ����� ��/��
��������                                                                      AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

7.3 The MixColumn transformation
MixColumn has been chosen from the space of 4-byte to 4-byte linear transformations
according to the following criteria:
        1. Invertibility;
        2. Linearity in GF(2);
        3. Relevant diffusion power;
        4. Speed on 8-bit processors;
        5. Symmetry;
        6. Simplicity of description.
                                                                                     4
Criteria 2, 5 and 6 have lead us to the choice to polynomial multiplication modulo x +1. Criteria
1, 3 and 4 impose conditions on the coefficients. Criterion 4 imposes that the coefficients have
small values, in order of preference ‘00’, ’01’, ’02’, ’03’…The value ‘00’ implies no processing
at all, for ‘01’ no multiplication needs to be executed, ‘02’ can be implemented using xtime
and ‘03’ can be implemented using xtime and an additional EXOR.
The criterion 3 induces a more complicated conditions on the coefficients.

7.3.1 Branch number
In our design strategy, the following property of the linear transformation of MixColumn is
essential. Let F be a linear transformation acting on byte vectors and let the byte weight of a
vector be the number of nonzero bytes (not to be confused with the usual significance of
Hamming weight, the number of nonzero bits). The byte weight of a vector is denoted by W( a).
The Branch Number of a linear transformation is a measure of its diffusion power:
Definition: The branch number of a linear transformation F is

                                     mina≠0 (W(a) + W(F(a))) .
A non-zero byte is called an active byte. For MixColumn it can be seen that if a state is applied
with a single active byte, the output can have at most 4 active bytes, as MixColumn acts on the
columns independently. Hence, the upper bound for the branch number is 5. The coefficients
have been chosen in such a way that the upper bound is reached. If the branch number is 5, a
difference in 1 input (or output) byte propagates to all 4 output (or input) bytes, a 2-byte input
(or output) difference to at least 3 output (or input) bytes. Moreover, a linear relation between
input and output bits involves bits from at least 5 different bytes from input and output.

7.4 The ShiftRow offsets
The choice from all possible combinations has been made based on the following criteria:
        1. The four offsets are different and C0 = 0;
        2. Resistance against attacks using truncated differentials [Kn95];
        3. Resistance against the Square attack [DaKnRi97];
        4. Simplicity.



�������� ������� �� ����� ��������                                                       ����� ��/��
��������                                                                   AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

For certain combinations, attacks using truncated differentials can tackle more rounds
(typically only one) than for other combinations. For certain combinations the Square attack
can tackle more rounds than others. From the combinations that are best with respect to
criteria 2 and 3, the simplest ones have been chosen.

7.5 The key expansion
The key expansion specifies the derivation of the Round Keys in terms of the Cipher Key. Its
function is to provide resistance against the following types of attack:
        • Attacks in which part of the Cipher Key is known to the cryptanalyst;
        • Attacks where the Cipher Key is known or can be chosen, e.g., if the cipher is used
          as the compression function of a hash function[Kn95a];
        • Related-key attacks [Bi93], [KeScWa96]. A necessary condition for resistance
          against related-key attacks is that there should not be two different Cipher Keys that
          have a large set of Round Keys in common.
The key expansion also plays an important role in the elimination of symmetry:
        • Symmetry in the round transformation: the round transformation treats all bytes of a
          state in very much the same way. This symmetry can be removed by having round
          constants in the key schedule;
        • Symmetry between the rounds: the round transformation is the same for all rounds.
          This equality can be removed by having round-dependent round constants in the
          key schedule.
The key expansion has been chosen according to the following criteria:
        • It shall use an invertible transformation, i.e., knowledge of any Nk consecutive words
          of the Expanded Key shall allow to regenerate the whole table;
        • Speed on a wide range of processors;
        • Usage of round constants to eliminate symmetries;
        • Diffusion of Cipher Key differences into the Round Keys;
        • Knowledge of a part of the Cipher Key or Round Key bits shall not allow to calculate
          many other Round Key bits.
        • Enough non-linearity to prohibit the full determination of Round Key differences from
          Cipher Key differences only;
        • Simplicity of description.
In order to be efficient on 8-bit processors, a light-weight, byte oriented expansion scheme has
been adopted. The application of SubByte ensures the non-linearity of the scheme, without
adding much space requirements on an 8-bit processor.

7.6 Number of rounds
We have determined the number of rounds by looking at the maximum number of rounds for
which shortcut attacks have been found and added a considerable security margin. (A shortcut
attack is an attack more efficient than exhaustive key search.)


�������� ������� �� ����� ��������                                                    ����� ��/��
��������                                                                     AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

For Rijndael with a block length and key length of 128 bits, no shortcut attacks have been
found for reduced versions with more than 6 rounds. We added 4 rounds as a security margin.
This is a conservative approach, because:
        • Two rounds of Rijndael provide “full diffusion” in the following sense: every state bit
          depends on all state bits two rounds ago, or, a change in one state bit is likely to
          affect half of the state bits after two rounds. Adding 4 rounds can be seen as
          adding a “full diffusion” step at the beginning and at the end of the cipher. The high
          diffusion of a Rijndael round is thanks to its uniform structure that operates on all
          state bits. For so-called Feistel ciphers, a round only operates on half of the state
          bits and full diffusion can at best be obtained after 3 rounds and in practice it
          typically takes 4 rounds or more.
        • Generally, linear cryptanalysis, differential cryptanalysis and truncated differential
          attacks exploit a propagation trail through n rounds in order to attack n+1 or n+2
          rounds. This is also the case for the Square attack that uses a 4-round propagation
          structure to attack 6 rounds. In this respect, adding 4 rounds actually doubles the
          number of rounds through which a propagation trail has to be found.
For Rijndael versions with a longer Key, the number of rounds is raised by one for every
additional 32 bits in the Cipher Key, for the following reasons:
        • One of the main objectives is the absence of shortcut attacks, i.e., attacks that are
          more efficient than exhaustive key search. As with the key length the workload of
          exhaustive key search grows, shortcut attacks can afford to be less efficient for
          longer keys.
        • Known-key (partially) and related-key attacks exploit the knowledge of cipher key
          bits or ability to apply different cipher keys. If the cipher key grows, the range of
          possibilities available to the cryptanalyst increases.
As no threatening known-key or related-key attacks have been found for Rijndael, even for 6
rounds, this is a conservative margin.
For Rijndael versions with a higher block length, the number of rounds is raised by one for
every additional 32 bits in the block length, for the following reasons:
        • For a block length above 128 bits, it takes 3 rounds to realise full diffusion, i.e., the
          diffusion power of a round, relative to the block length, diminishes with the block
          length.
        • The larger block length causes the range of possible patterns that can be applied at
          the input/output of a sequence of rounds to increase. This added flexibility may allow
          to extend attacks by one or more rounds.
We have found that extensions of attacks by a single round are even hard to realise for the
maximum block length of 256 bits. Therefore, this is a conservative margin.




�������� ������� �� ����� ��������                                                       ����� ��/��
��������                                                                          AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

8. Strength against known attacks

8.1 Symmetry properties and weak keys of the DES type
Despite the large amount of symmetry, care has been taken to eliminate symmetry in the
behaviour of the cipher. This is obtained by the round constants that are different for each
round. The fact that the cipher and its inverse use different components practically eliminates
the possibility for weak and semi-weak keys, as existing for DES. The non-linearity of the key
expansion practically eliminates the possibility of equivalent keys.

8.2 Differential and linear cryptanalysis
Differential cryptanalysis was first described by Eli Biham and Adi Shamir [BiSh91]. Linear
cryptanalysis was first described by Mitsuru Matsui [Ma94].
Chapter 5 of [Da95] gives a detailed treatment of difference propagation and correlation. To
better describe the anatomy of the basic mechanisms of linear cryptanalysis (LC) and of
differential cryptanalysis (DC), new formalisms and terminology were introduced. With the aid
of these it was, among other things, shown how input-output correlations over multiple rounds
are composed. We will use the formalisms of [Da95] in the description of DC and LC. To
provide the necessary background, Chapter 5 of [Da95] has been included in Annex.

8.2.1 Differential cryptanalysis
DC attacks are possible if there are predictable difference propagations over all but a few
(typically 2 or 3) rounds that have a prop ratio (the relative amount of all input pairs that for the
                                                                                        1-n
given input difference give rise to the output difference) significantly larger than 2 if n is the
block length. A difference propagation is composed of differential trails, where its prop ratio is
the sum of the prop ratios of all differential trails that have the specified initial and final
difference patterns. To be resistant against DC, it is therefore a necessary condition that there
                                                                    1-n
are no differential trails with a predicted prop ratio higher than 2 .
For Rijndael, we prove that there are no 4-round differential trails with a predicted prop ratio
        –150                                                            –300
above 2      (and no 8-round trails with a predicted prop ratio above 2     ). For all block lengths
of Rijndael, this is sufficient. For the significance of these predicted prop ratios, we refer to
Chapter 5 of [Da95]. The proof is given in Section 8.2.3.
In [LaMaMu91] it has been proposed to perform differential cryptanalysis with another notion of
difference. This is especially applicable to ciphers where the key addition is not a simple EXOR
operation. Although in Rijndael the keys are applied using EXORs, it was investigated whether
attacks could be mounted using another notion of difference. We have found no attack
strategies better than using EXOR as the difference.

8.2.2 Linear cryptanalysis
LC attacks are possible if there are predictable input-output correlations over all but a few
                                                       /2
(typically 2 or 3) rounds significantly larger than 2 n . An input-output correlation is composed of
linear trails, where its correlation is the sum of the correlation coefficients of all linear trails that
have the specified initial and final selection patterns. The correlation coefficients of the linear
trails are signed and their sign depends on the value of the Round Keys. To be resistant
against LC, it is a necessary condition that there are no linear trails with a correlation
                           n/2
coefficient higher than 2 .

�������� ������� �� ����� ��������                                                            ����� ��/��
��������                                                                      AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

                                                                                            –75
For Rijndael, we prove that there are no 4-round linear trails with a correlation above 2 (and
                                                 –150
no 8-round trails with a correlation above 2 ). For all block lengths of Rijndael, this is
sufficient. The proof is given in Section 8.2.4.

8.2.3 Weight of differential and linear trails
In [Da95], it is shown that:
        • The prop ratio of a differential trail can be approximated by the product of the prop
          ratios of its active S-boxes.
        • The correlation of a linear trail can be approximated by the product of input-output
          correlations of its active S-boxes.
The wide trail strategy can be summarised as follows:
        • Choose an S-box where the maximum prop ratio and the maximum input-output
                                                                                              –6
          correlation are as small as possible. For the Rijndael S-box this is respectively 2
                –3
          and 2 .
        • Construct the diffusion layer in such a way that there are no multiple-round trails with
          few active S-boxes.
We prove that the minimum number of active S-boxes in any 4-round differential or linear trail
                                            –150
is 25. This gives a maximum prop ratio of 2      for any 4-round differential trail and a maximum
    –75
of 2 for the correlation for any 4-round linear trail. This holds for all block lengths of Rijndael
and is independent of the value of the Round Keys.
Note: the nonlinearity of an S-box chosen randomly from the set of possible invertible 8-bit S-
                                                          –5   –4
boxes is expected to be less optimum. Typical values are 2 to 2 for the maximum prop ratio
     –2
and 2 for the maximum input-output correlation.

8.2.4 Propagation of patterns
For DC, the active S-boxes in a round are determined by the nonzero bytes in the difference of
the states at the input of a round. Let the pattern that specifies the positions of the active S-
boxes be denoted by the term (difference) activity pattern and let the (difference) byte weight
be the number of active bytes in a pattern.
For LC, the active S-boxes in a round are determined by the nonzero bytes in the selection
vectors (see Annex ) at the input of a round. Let the pattern that specifies the positions of the
active S-boxes be denoted by the term (correlation) activity pattern and let the (correlation)
byte weight W(a) be the number of active bytes in a pattern a.
Moreover, let a column of an activity pattern with at least one active byte be denoted by active
column. Let the column weight, denoted by W C(a), be the number of active columns in a
pattern. The byte weight of a column j of a, denoted by W(a)|j, is the number of active bytes in
it.
The weight of a trail is the sum of the weights of its activity patterns at the input of each round.
Difference and correlation activity patterns can be seen as propagating through the
transformations of the different rounds of the block cipher to form linear and differential trails.
This is illustrated with an example in Figure 7.




�������� ������� �� ����� ��������                                                        ����� ��/��
��������                                                                     AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������




                                                   ByteSub



                                                   ShiftRow



                                                   MixColumn



                                                 AddRoundKey



          Figure 7: Propagation of activity pattern (in grey) through a single round

The different transformations of Rijndael have the following effect on these patterns and
weights:
        • ByteSub and AddRoundKey: activity patterns, byte and column weight are invariant.
        • ShiftRow: byte weight is invariant as there is no inter-byte interaction.
        • MixColumn: column weight is invariant as there is no inter-column interaction.
ByteSub and AddRoundKey do not play a role in the propagation of activity patterns and
therefore in this discussion the effect of a round is reduced to that of ShiftRow followed by
MixColumn. In the following, ByteSub and AddRoundKey will be ignored. MixColumn has a
branch number equal to 5, implying:
        • For any active column of a pattern at its input (or, equivalently, at its output), the
          sum of the byte weights at input and output for this column is lower bounded by 5.
ShiftRow has the following properties:
        • The column weight of a pattern at its output is lower bounded by the maximum of the
          byte weights of the columns of the pattern at its input.
        • The column weight of a pattern at its input is lower bounded by the maximum of the
          byte weights of the columns of the pattern at its output.
This is thanks to the property that MixColumn permutes the bytes of a column to all different
columns.




�������� ������� �� ����� ��������                                                    ����� ��/��
��������                                                                           AES Proposal
���� ������                              The Rijndael Block Cipher
������� ������

In our description, the activity pattern at the input of a round i is denoted by ai–1 and the activity
pattern after applying ShiftRow of round i is denoted by bi–1. The initial round is numbered 1
and the initial difference pattern is denoted by a0. Clearly, ai and bi are separated by ShiftRow
and have the same byte weight, bj–1 and aj are separated by MixColumn and have the same
column weight. The weight of an m-round trail is given by the sum of the weights of a0 to am–1 .
The propagation properties are illustrated in Figure 8. In this figure, active bytes are indicated
in dark grey, active columns in light grey.

                                                                              ai

                                         W C ( a i) ≥ m a x j W ( b i) |j
                                                                            W ( b i ) = W( a i )
     W C ( b i) ≥ m a x j W ( a i) | j

                                                                              bi

                                  For all active columns j :
                                                                            W C ( a i+1 ) = W C ( b i )
                                   W ( b i)| j + W ( a i+ 1 )| j ≥ 5


                                                                            a i+ 1

                           Figure 8: Propagation of patterns in a single round.

Theorem 1: The weight of a two-round trail with Q active columns at the input of the second
round is lower bounded by 5Q.

Proof: The fact that MixColumn has a Branch Number equal to 5 implies that sum of the byte
weights of each column in b0 and a1 is lower bounded by 5. If the column weight of a1 is Q, this
gives a lower bounded of 5 Q for the sum of the byte weights of b0 and a1 . As a0 and b0 have
the same byte weight, the lower bounded is also valid for the sum of the weights a0 and a1 ,
proving the theorem.
                                                                                                          QED
Theorem 1 is illustrated in Figure 9.




�������� ������� �� ����� ��������                                                                 ����� ��/��
��������                                                                          AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������


                                             a0


                                            W ( b 0 ) = W( a 0 )


                                             b0


                                             W ( a 1) + W ( b 0) ≥ 5 W C (a 1 )


                                             a1


                           Figure 9: Illustration of Theorem 1 with Q = 2.

From this it follows that any two-round trail has at least 5 active S-boxes.

Lemma 1: in a two-round trail, the sum of the number of active columns at its input and the
number of active columns at its output is at least 5. In other words, the sum of the columns
weights of a0 and a2 is at least 5.

Proof: ShiftRow moves all bytes in a column of ai to different columns in bi and vice versa. It
follows that the column weight of ai is lower bounded the byte weights of the individual
columns of bi. Likewise the column weight of bi is lower bounded by the byte weights of the
individual columns of ai.
In a trail, at least one column of a1 (or equivalently b0 ) is active. Let this column be denoted by
“column g”. Because MixColumn has a branch number of 5, the sum of the byte weights of
column g in b0 and column g in a1 is lower bounded by 5. The column weight of a0 is lower
bounded by the byte weight of column g of b0. The column weight of b1 is lower bounded by
the byte weight of column g of a1. It follows that the sum of the column weights of a0 and b1 is
lower bounded by 5. As the column weight of a2 is equal to that of b1, the lemma is proven.

                                                                                               QED
Lemma 1 is illustrated in Figure 10.




�������� ������� �� ����� ��������                                                        ����� ��/��
��������                                                                                   AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������


                                                  a0

                                                   W C (a 0 ) ≥ max j W ( b 0 )| j

                                                  b0

                                                  W ( a 1 )| j + W( b 0 )| j ≥ 5

                                                   a1

                                                    W C ( b 1 ) ≥ max j W ( a 1 )| j

                                                   b1

                                                   W C ( a 2) = W C ( b 1)

                                                   a2


                Figure 10: Illustration of Lemma 1 with one active column in a1.

Theorem 2: Any trail over four rounds has at least 25 active bytes.

Proof: By applying Theorem 1 on the first two rounds (1 and 2) and on the last two rounds (3
and 4), it follows that the byte weight of the trail is lower bounded by the sum of the column
weight of a1 and a3 multiplied by 5. By applying Lemma 1, the sum of the column weight ofa1
and a3 is lower bounded by 5. From this it follows that the byte weight of the four-round trail is
lower bounded by 25.
                                                                                                              QED
Theorem 2 is illustrated in Figure 11.

                                                                      a0
                                                                             W ( a 0 ) + W( a 1 ) ≥ 5 W C ( a 1 )
                                                                      a1


      W C ( a 1 ) + W C (a 3) ≥ 5                                     a2
                                                                             W ( a 2 ) + W( a 3 ) ≥ 5 W C ( a 3 )
                                                                      a3

                                    Figure 11: Illustration of Theorem 2.




�������� ������� �� ����� ��������                                                                      ����� ��/��
��������                                                                                 AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

8.3 Truncated differentials
The concept of truncated differentials was first published by Lars Knudsen [Kn95]. The
corresponding class of attacks exploit the fact that in some ciphers differential trails tend to
cluster [Da95] (see Annex ). Clustering takes place if for certain sets of input difference
patterns and output difference patterns, the number of differential trails is exceedingly large.
The expected probability that a differential trail stays within the boundaries of the cluster can
be computed independently of the prop ratios of the individual differential trails. Ciphers in
which all transformation operate on the state in well aligned blocks are prone to be susceptible
to this type of attack. Since this is the case for Rijndael, all transformations operating on bytes
rather than individual bits, we investigated its resistance against “truncated differentials”. For 6
rounds or more, no attacks faster than exhaustive key search have been found.

8.4 The Square attack
The “Square” attack is a dedicated attack on Square that exploits the byte-oriented structure of
Square cipher and was published in the paper presenting the Square cipher itself [DaKnRi97].
This attack is also valid for Rijndael, as Rijndael inherits many properties from Square. We
describe this attack in this section.
The attack is a chosen plaintext attack and is independent of the specific choices of ByteSub,
the multiplication polynomial of MixColumn and the key schedule. It is faster than an
exhaustive key search for Rijndael versions of up to 6 rounds. After describing the basic attack
on 4 rounds, we will show how it can be extended to 5 and 6 rounds. For 7 rounds or more, no
attacks faster than exhaustive key search have been found.

8.4.1 Preliminaries
Let a Λ -set be a set of 256 states that are all different in some of the state bytes (the active)
and all equal in the other state bytes (the passive) We have

                                                ⎧ xi , j ≠ yi , j if (i , j ) active
                                     ∀x , y ∈Λ: ⎨                                    .
                                                ⎩ xi , j = yi , j else
Applying the transformations ByteSub or AddRoundKey on (the elements of) a Λ -set results
in a (generally different) Λ -set with the positions of the active bytes unchanged. Applying
ShiftRow results in a Λ -set in which the active bytes are transposed by ShiftRow. Applying
MixColumn to a Λ -set does not necessarily result in a Λ -set. However, since every output
byte of MixColumn is a linear combination (with invertible coefficients) of the four input bytes in
the same column, an input column with a single active byte gives rise to an output column with
all four bytes active.

8.4.2 The basic attack
Consider a Λ -set in which only one byte is active. We will now trace the evolution of the
                                                                     st
positions of the active bytes through 3 rounds. MixColumn of the 1 round converts the active
byte to a complete column of active bytes. The four active bytes of this column are spread over
                                            nd                              nd
four distinct columns by ShiftRow of the 2 round. MixColumn of the 2 round subsequently
converts this to 4 columns of only active bytes. This stays a Λ -set until the input of MixColumn
        rd
of the 3 round.



�������� ������� �� ����� ��������                                                             ����� ��/��
��������                                                                                                                      AES Proposal
���� ������                        The Rijndael Block Cipher
������� ������

Since the bytes of this (in fact, any) Λ -set, denoted by a, range over all possible values and
are therefore balanced over the Λ -set, we have

                           ⊕
                   b= MixColumn( a ),a ∈Λ
                                                   ⊕(2a ⊕ 3a ⊕ a ⊕ a )
                                            bi , j =
                                                        a ∈Λ
                                                                     i, j     i +1, j             i +2 , j    i +3, j


                                                 = 2 ⊕ a ⊕ 3⊕ a ⊕ ⊕a ⊕⊕a
                                                                     i, j               i +1, j              i +2, j          i +3, j
                                                          a∈Λ                a∈Λ                       a∈Λ              a∈Λ

                                                 = 0⊕ 0⊕ 0⊕ 0 = 0
                                                                th
Hence, all bytes at the input of the 4 round are balanced. This balance is in general
destroyed by the subsequent application of ByteSub.
                      th
We assume the 4 round is a final round, i.e., it does not include a MixColumn operation.
                          th                                              th
Every output byte of the 4 round depends on only one input byte of the 4 round. Let a be
                   th                                               th
the output of the 4 round, b its output and k the Round Key of the 4 round. We have:

                                                                            ( )
                                                       ai , j = Sbox bi ′ , j ′ ⊕ k i , j .

By assuming a value for ki , j , the value of bi ′ , j ′ for all elements of the Λ -set can be calculated
from the ciphertexts. If the values of this byte are not balanced over Λ , the assumed value for
the key byte was wrong. This is expected to eliminate all but approximately 1 key value. This
can be repeated for the other bytes of k.

8.4.3 Extension by an additional round at the end
If an additional round is added, we have to calculate the above value of bi ′ , j ′ from the output of
the 5th round instead of the 4th round. This can be done by additionally assuming a value for
                           th
a set of 4 bytes of the 5 Round Key. As in the case of the 4-round attack, wrong key
assumptions are eliminated by verifying that bi ′ , j ′ is not balanced.

In this 5-round attack 2 40 key values must be checked, and this must be repeated 4 times.
Since by checking a single Λ -set leaves only 1/256 of the wrong key assumptions as possible
candidates, the Cipher Key can be found with overwhelming probability with only 5 Λ -sets.

8.4.4 Extension by an additional round at the beginning
The basic idea is to choose a set of plaintexts that results in a Λ -set at the output of the 1
                                                                                                                                                 st

round with a single active S-box. This requires the assumption of values of four bytes of the
Round Key that is applied before the first round.
                                                                              st
If the intermediate state after MixColumn of the 1 round has only a single active byte, this is
                                     nd
also the case for the input of the 2 round. This imposes the following conditions on a column
of four input bytes of MixColumn of the second round: one particular linear combination of
these bytes must range over all 256 possible values (active) while 3 other particular linear
combinations must be constant for all 256 states. This imposes identical conditions on 4 bytes,
in different positions at the input of ShiftRow of the first round. If the corresponding bytes of
the first Round Key are known, these conditions can be converted to conditions on four
plaintext bytes.
                                        32
Now we consider a set of 2 plaintexts, such that one column of bytes at the input of
MixColumn of the first round range over all possible values and all other bytes are constant.



�������� ������� �� ����� ��������                                                                                                      ����� ��/��
��������                                                                                      AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

Now, an assumption is made for the value of the 4 bytes of the relevant bytes of the first
Round Key. From the set of 2 32 available plaintexts, a set of 256 plaintexts can be selected
that result in a Λ -set at the input of round 2. Now the 4-round attack can be performed. For
the given key assumption, the attack can be repeated for a several plaintext sets. If the byte
values of the last Round Key are not consistent, the initial assumption must have been wrong.
A correct assumption for the 32 bytes of the first Round Key will result in the swift and
consistent recuperation of the last Round Key.

8.4.5 Working factor and memory requirements for the attacks
Combining both extensions results in a 6 round attack. Although infeasible with current
technology, this attack is faster than exhaustive key search, and therefore relevant. The
working factor and memory requirements are summarised in Figure 12. For the different block
lengths of Rijndael no extensions to 7 rounds faster than exhaustive key search have been
found.
                Attack                           # Plaintexts        # Cipher              Memory
                                                                    executions
                                                         9                    9
                Basic (4 rounds)                     2                    2                 small
                                                         11                   40
                Extension at end                     2                    2                 small
                                                         32                   40                  32
                Extension at beginning               2                    2                  2
                                                         32                   72                  32
                Both Extensions                      2                    2                  2

                Figure 12: Complexity of the Square attack applied to Rijndael.


8.5 Interpolation attacks
In [JaKn97] Jakobsen and Knudsen introduced a new attack on block ciphers. In this attack,
the attacker constructs polynomials using cipher input/output pairs. This attack is feasible if the
components in the cipher have a compact algebraic expression and can be combined to give
expressions with manageable complexity. The basis of the attack is that if the constructed
polynomials (or rational expressions) have a small degree, only few cipher input/output pairs
are necessary to solve for the (key-dependent) coefficients of the polynomial. The complicated
                                 8
expression of the S-box in GF(2 ), in combination with the effect of the diffusion layer prohibits
these types of attack for more than a few rounds. The expression for the S-box is given by:
                     127        191        223           239        247            251        253           254
          63 + 8f x        + b5 x     + 01 x     + f4 x        + 25 x     + f9 x         + 09 x        + 05 x

8.6 Weak keys as in IDEA
The weak keys discussed in this subsection are keys that result in a block cipher mapping with
detectable weaknesses. The best known case of weak keys are those of IDEA [Da95].
Typically, this weakness occurs for ciphers in which the non-linear operations depends on the
actual key value. This is not the case for Rijndael, where keys are applied using the EXOR and
all non-linearity is in the fixed S-box. In Rijndael, there is no restriction on key selection.




Document version 2, Date: 03/09/99                                                                              Page: 38/45
��������                                                                      AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

8.7 Related-key attacks
In [Bi96], Eli Biham introduced a related-key attack. Later it was demonstrated by John Kelsey,
Bruce Schneier and David Wagner that several ciphers have related-key weaknesses In
[KeScWa96].
In related-key attacks, the cryptanalyst can do cipher operations using different (unknown or
partly unknown) keys with a chosen relation. The key schedule of Rijndael, with its high
diffusion and non-linearity, makes it very improbable that this type of attack can be successful
for Rijndael.


9. Expected strength
Rijndael is expected, for all key and block lengths defined, to behave as good as can be
expected from a block cipher with the given block and key lengths. What we mean by this is
explained in Section 10.
This implies among other things, the following. The most efficient key-recovery attack for
Rijndael is exhaustive key search. Obtaining information from given plaintext-ciphertext pairs
about other plaintext-ciphertext pairs cannot be done more efficiently than by determining the
key by exhaustive key search. The expected effort of exhaustive key search depends on the
length of the Cipher Key and is:
        • for a 16-byte key, 2
                                     127
                                           applications of Rijndael;
        • for a 24-byte key, 2
                                     191
                                           applications of Rijndael;
        • for a 32-byte key, 2
                                     255
                                           applications of Rijndael.
The rationale for this is that a considerable safety margin is taken with respect to all known
attacks. We do however realise that it is impossible to make non-speculative statements on
things unknown.


10. Security goals
In this section, we present the goals we have set for the security of Rijndael. A cryptanalytic
attack will be considered successful by the designers if it demonstrates that a security goal
described herein does not hold.

10.1 Definitions of security concepts
In order to formulate our goals, some security-related concepts need to be defined.

10.1.1 The set of possible ciphers for a given block length and key length
                                                     v
A block cipher of block length v has V = 2 possible inputs. If the key length is u it defines a set
         u                          v                                                       v
of U = 2 permutations over {0,1} . The number of possible permutations over {0,1} is V!.
Hence the number of all possible block ciphers of dimensions u and v is
                                                 u
                                 ((2 v ) !) ( 2 ) or equivalently (V !) U .
For practical values of the dimensions (e.g., v and u above 40), the subset of block ciphers
with exploitable weaknesses form a negligible minority in this set.


Document version 2, Date: 03/09/99                                                       Page: 39/45
��������                                                                     AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

10.1.2 K-Security
Definition: A block cipher is K-secure if all possible attack strategies for it have the same
expected work factor and storage requirements as for the majority of possible block ciphers
with the same dimensions. This must be the case for all possible modes of access for the
adversary (known/chosen/adaptively chosen plaintext/ciphertext, known/chosen/adaptively
chosen key relations...) and for any a priori key distribution.
K-security is a very strong notion of security. It can easily be seen that if one of the following
weaknesses apply to a cipher, it cannot be called K-secure:
        • Existence of key-recovering attacks faster than exhaustive search;
        • Certain symmetry properties in the mapping (e.g., complementation property);
        • Occurrence of non-negligible classes of weak keys (as in IDEA);
        • related-key attacks.
K-security is essentially a relative measure. It is quite possible to build a K-secure block cipher
with a 5-bit block and key length. The lack of security offered by such a scheme is due to its
small dimensions, not to the fact that the scheme fails to meet the requirements imposed by
these dimensions. Clearly, the longer the key, the higher the security requirements.

10.1.3 Hermetic block ciphers
It is possible to imagine ciphers that have certain weaknesses and still are K-secure. An
example of such a weakness would be a block cipher with a block length larger than the key
length and a single weak key, for which the cipher mapping is linear. The detection of the
usage of the key would take at least a few encryptions, while checking whether the key is used
would only take a single encryption.
If this cipher would be used for encipherment, this single weak key would pose no problem.
However, used as a component in a larger scheme, for instance as the compression function
of a hash function, this property could introduce a way to efficiently generate collisions.
For these reasons we introduce yet another security concept, denoted by the term hermetic.
Definition: A block cipher is hermetic if it does not have weaknesses that are not present for
the majority of block ciphers with the same block and key length.
Informally, a block cipher is hermetic if its internal structure cannot be exploited in any
application.

10.2 Goal
For all key and block lengths defined, the security goals are that the Rijndael cipher is :
        • K-secure;
        • Hermetic.
If Rijndael lives up to its goals, the strength against any known or unknown attacks is as good
as can be expected from a block cipher with the given dimensions.




�������� ������� �� ����� ��������                                                       ����� ��/��
Authors:                                                                   AES Proposal
Joan Daemen                     The Rijndael Block Cipher
Vincent Rijmen

11. Advantages and limitations

11.1 Advantages
Implementation aspects:
        • Rijndael can be implemented to run at speeds unusually fast for a block cipher on a
          Pentium (Pro). There is a trade-off between table size/performance.
        • Rijndael can be implemented on a Smart Card in a small amount of code, using a
          small amount of RAM and taking a small number of cycles. There is some
          ROM/performance trade-off.
        • The round transformation is parallel by design, an important advantage in future
          processors and dedicated hardware.
        • As the cipher does not make use of arithmetic operations, it has no bias towards big-
          or little endian processor architectures.
Simplicity of Design:
        • The cipher is fully “self-supporting”. It does not make use of another cryptographic
          component, S-boxes “lent” from well-reputed ciphers, bits obtained from Rand
          tables, digits of π or any other such jokes.
        • The cipher does not base its security or part of it on obscure and not well
          understood interactions between arithmetic operations.
        • The tight cipher design does not leave enough room to hide a trapdoor.
Variable block length:
        • The block lengths of 192 and 256 bits allow the construction of a collision-resistant
          iterated hash function using Rijndael as the compression function. The block length
          of 128 bits is not considered sufficient for this purpose nowadays.
Extensions:
        • The design allows the specification of variants with the block length and key length
          both ranging from 128 to 256 bits in steps of 32 bits.
        • Although the number of rounds of Rijndael is fixed in the specification, it can be
          modified as a parameter in case of security problems.

11.2 Limitations
The limitations of the cipher have to do with its inverse:
        • The inverse cipher is less suited to be implemented on a smart card than the cipher
          itself: it takes more code and cycles. (Still, compared with other ciphers, even the
          inverse is very fast)
        • In software, the cipher and its inverse make use of different code and/or tables.
        • In hardware, the inverse cipher can only partially re-use the circuitry that implements
          the cipher.



�������� ������� �� ����� ��������                                                     ����� ��/��
��������                                                                    AES Proposal
���� ������                      The Rijndael Block Cipher
������� ������

12. Extensions

12.1 Other block and Cipher Key lengths
The key schedule supports any key length that is a multiple of 4 bytes. The only parameter
that needs to be defined for other key lengths than 128, 192 or 256 is the number of rounds in
the cipher.
The cipher structure lends itself for any block length that is a multiple of 4 bytes, with a
minimum of 16 bytes. The key addition and the ByteSub and MixColumn transformations are
independent from the block length. The only transformation that depends on the block length is
ShiftRow. For every block length, a specific array C1, C2, C3 must be defined.
We define an extension of Rijndael that also supports block and key lengths between 128 and
256 bits with increments of 32 bits. The number of rounds is given by:
                                      Nr = max(Nk, Nb) + 6.
This interpolates the rule for the number of rounds to the alternative block and key lengths.
The additional values of C1, C2 and C3 are specified in Table 8.


                                Nb    C1             C2             C3
                            5          1              2              3
                            7          1              2              4

               Table 8: Shift offsets in Shiftrow for the alternative block lengths

The choice of these shift offsets is based on the criteria discussed in Section 7.4.

12.2 Another primitive based on the same round transformation
The Rijndael Round transformation has been designed to provide high multiple-round diffusion
and guaranteed distributed nonlinearity. These are exactly the requirements for the state
updating transformation in a stream/hash module such as Panama [DaCl98]. By fitting the
round transformation (for Nb=8) in a Panama-like scheme, a stream/hash module can be built
that can hash and do stream encryption about 4 times as fast as Rijndael and perform as a
very powerful pseudorandom number generator satisfying all requirements cited in
[KeScWaHa98].


13. Other functionality
In this section we mention some functions that can be performed with the Rijndael block
cipher, other than encryption.

13.1 MAC
Rijndael can be used as a MAC algorithm by using it as the Block cipher in a CBC-MAC
algorithm. [ISO9797]



�������� ������� �� ����� ��������                                                     ����� ��/��
��������                                                                     AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

13.2 Hash function
Rijndael can be used as an iterated hash function by using it as the round function. Here is
one possible implementation. It is advised to use a block and key length both equal to 256 bits.
The chaining variable goes into the “input” and the message block goes into the “Cipher Key”.
The new value of the chaining variable is given by the old value EXORed with the cipher
output.

13.3 Synchronous stream cipher
Rijndael can be used as a synchronous stream cipher by applying the OFB mode or the
Filtered Counter Mode. In the latter mode, the key stream sequence is created by encrypting
some type of counter using a secret key [Da95].

13.4 Pseudorandom number generator
In [KeScWaHa98] a set of guidelines are given for designing a Pseudorandom Number
Generator (PRNG). There are many ways in which Rijndael could be used to form a PRNG
that satisfies these guidelines. We give an example in which Rijndael with a block length of
256 and a cipher key length of 256 is used.
There are three operations:
Reset:
         • The Cipher Key and “state” are reset to 0.
Seeding (and reseeding):
         •    “seed bits” are collected taking care that their total has some minimum entropy.
             They are padded with zeroes until the resulting string has a length that is a multiple
             of 256 bits.
         • A new Cipher Key is computed by encrypting with Rijndael a block of seed bits using
           the current Cipher Key. This is applied recursively until the seed blocks are
           exhausted.
         • The state is updated by applying Rijndael using the new Cipher Key.
Pseudorandom Number generation:
         • The state is updated by applying Rijndael using the Cipher Key. The first 128 bits of
           the state are output as a “pseudorandom number”. This step may be repeated many
           times.

13.5 Self-synchronising stream cipher
Rijndael can be used as a self-synchronising stream cipher by applying the CFB mode of
operation.




�������� ������� �� ����� ��������                                                       ����� ��/��
Authors:                                                                      AES Proposal
Joan Daemen                     The Rijndael Block Cipher
Vincent Rijmen

14. Suitability for ATM, HDTV, B-ISDN, voice and satellite
It was requested to give comments on the suitability of Rijndael to be used for ATM, HDTV, B­
ISDN, Voice and Satellite. As a matter of fact, the only thing that is relevant here, is the
processor on which the cipher is implemented. As Rijndael can be implemented efficiently in
software on a wide range of processors, makes use of a limited set of instructions and has
sufficient parallelism to fully exploit modern pipelined multi-ALU processors, it is well suited for
all mentioned applications.
For applications that require rates higher than 1 Gigabits/second, Rijndael can be implemented
in dedicated hardware.


15. Acknowledgements
In the first place we would like to thank Antoon Bosselaers, Craig Clapp, Paulo Barreto and
Brian Gladman for their efficient ANSI-C implementations and the Cryptix team, including
Paulo Barreto, for their Java implementation.
We also thank Lars Knudsen, Bart Preneel, Johan Borst and Bart Van Rompay for their
cryptanalysis of preliminary versions of the cipher.
We thank Brian Gladman and Gilles Van Assche and for proof-reading this version of the
documentation and providing many suggestions for improvement. Moreover, we thank all
people that have brought errors and inconsistencies in the first version of this document to our
attention.
We would also like to thank all other people that did efforts to efficiently implement Rijndael
and all people that have expressed their enthusiasm for the Rijndael design.
Finally we would like to thank the people of the NIST AES team for making it all possible.


16. References
[Bi93] E. Biham, "New types of cryptanalytic attacks using related keys," Advances in
Cryptology, Proceedings Eurocrypt'93, LNCS 765, T. Helleseth, Ed., Springer-Verlag, 1993,
pp. 398-409.
[BiSh91] E. Biham and A. Shamir, "Differential cryptanalysis of DES-like cryptosystems,"
Journal of Cryptology, Vol. 4, No. 1, 1991, pp. 3-72.
[Da95] J. Daemen, "Cipher and hash function design strategies based on linear and differential
cryptanalysis," Doctoral Dissertation, March 1995, K.U.Leuven.
[DaKnRi97] J. Daemen, L.R. Knudsen and V. Rijmen, "The block cipher Square," Fast
Software Encryption, LNCS 1267, E. Biham, Ed., Springer-Verlag, 1997, pp. 149-165. Also
available as http://www.esat.kuleuven.ac.be/rijmen/square/fse.ps.gz.
[DaKnRi96] J. Daemen, L.R. Knudsen and V. Rijmen, " Linear frameworks for block ciphers,"
to appear in Design, Codes and Cryptography.
[DaCl98] J. Daemen and C. Clapp, “Fast hashing and stream Encryption with PANAMA,” Fast
Software Encryption, LNCS 1372, S. Vaudenay, Ed., Springer-Verlag, 1998, pp. 60-74.
[ISO9797] ISO/IEC 9797, "Information technology - security techniques - data integrity
mechanism using a cryptographic check function employing a block cipher algorithm",
International Organization for Standardization, Geneva, 1994 (second edition).

�������� ������� �� ����� ��������                                                        ����� ��/��
��������                                                                 AES Proposal
���� ������                     The Rijndael Block Cipher
������� ������

[JaKn97] T. Jakobsen and L.R. Knudsen, "The interpolation attack on block ciphers," Fast
Software Encryption, LNCS 1267, E. Biham, Ed., Springer-Verlag, 1997, pp. 28-40.
[KeScWa96] J. Kelsey, B. Schneier and D. Wagner, "Key-schedule cryptanalysis of IDEA,
GDES, GOST, SAFER, and Triple-DES," Advances in Cryptology, Proceedings Crypto '96,
LNCS 1109, N. Koblitz, Ed., Springer-Verlag, 1996, pp. 237-252.
[KeScWaHa98] J. Kelsey, B. Schneier, D. Wagner and Chris Hall, "Cryptanalytic attacks on
pseudorandom number generators," Fast Software Encryption, LNCS 1372, S. Vaudenay, Ed.,
Springer-Verlag, 1998, pp. 168-188.
[Kn95] L.R. Knudsen, "Truncated and higher order differentials," Fast Software Encryption,
LNCS 1008, B. Preneel, Ed., Springer-Verlag, 1995, pp. 196-211.
[Kn95a] L.R. Knudsen, "A key-schedule weakness in SAFER-K64," Advances in Cryptology,
Proceedings Crypto'95, LNCS 963, D. Coppersmith, Ed., Springer-Verlag, 1995, pp. 274-286.
[LaMaMu91] X. Lai, J.L. Massey and S. Murphy, "Markov ciphers and differential
cryptanalysis," Advances in Cryptology, Proceedings Eurocrypt'91, LNCS 547, D.W. Davies,
Ed., Springer-Verlag, 1991, pp. 17-38.
[LiNi86] R. Lidl and H. Niederreiter, Introduction to finite fields and their applications,
Cambridge University Press, 1986.
[Ma94] M. Matsui, "Linear cryptanalysis method for DES cipher," Advances in Cryptology,
Proceedings Eurocrypt'93, LNCS 765, T. Helleseth, Ed., Springer-Verlag, 1994, pp. 386-397.
[Ny94] K. Nyberg, "Differentially uniform mappings for cryptography," Advances in Cryptology,
Proceedings Eurocrypt'93, LNCS 765, T. Helleseth, Ed., Springer-Verlag, 1994, pp. 55-64.
[Ri97] V. Rijmen, "Cryptanalysis and design of iterated block ciphers," Doctoral Dissertation,
October 1997, K.U.Leuven.


17. List of Annexes
In Annex, we have included Chapter 5 of [Da95]: “Correlation and Propagation” as this lays the
fundaments for the Wide Trail Strategy.
Note: In the Annex, the EXOR is denoted by + instead of ⊕.




Document version 2, Date: 03/09/99                                                  Page: 45/45
~~~
