# Algorithm 48  MatrixVectorNTT(𝐌,

**章节**: §3.5  
**类别**: NTT 运算

### 规范

```
Algorithm 48 MatrixVectorNTT(𝐌,
Computes the product 𝐌̂ ∘ 𝐯̂ of a matrix 𝐌̂ and a vector 𝐯̂ over 𝑇𝑞 .
Input: 𝑘, ℓ ∈ ℕ, 𝐌̂ ∈ 𝑇𝑞𝑘×ℓ , 𝐯̂ ∈ 𝑇𝑞ℓ .
Output: 𝐰̂ ∈ 𝑇𝑞𝑘 .
1: 𝐰̂ ← 0𝑘
2: for 𝑖 from 0 to 𝑘 − 1 do
3:
for 𝑗 from 0 to ℓ − 1 do
̂ 𝑗], 𝐯[𝑗]))
4:
𝐰[𝑖]
̂ ← AddNTT(𝐰[𝑖],
̂ MultiplyNTT(𝐌[𝑖,
̂
5:
end for
6: end for
7: return 𝐰̂

46

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

References
[1] National Institute of Standards and Technology (2023) Digital signature standard (DSS), (U.S. Department of Commerce, Washington, DC), Federal Information Processing Standards Publication (FIPS)
186-5. https://doi.org/10.6028/NIST.FIPS.186-5.
[2] Barker E (2020) Guideline for using cryptographic standards in the federal government: Cryptographic
mechanisms, (National Institute of Standards and Technology, Gaithersburg, MD), NIST Special
Publication (SP) 800-175B, Rev. 1 [or as amended]. https://doi.org/10.6028/NIST.SP.800-175Br1.
[3] Barker E (2006) Recommendation for obtaining assurances for digital signature applications, National
Institute of Standards and Technology, Gaithersburg, MD. NIST Special Publication (SP) 800-89 [or as
amended]. https://doi.org/10.6028/NIST.SP.800-89.
[4] Langlois A, Stehlé D (2015) Worst-case to average-case reductions for module lattices. Designs, Codes
and Cryptography 75(3):565–599. https://doi.org/10.1007/s10623-014-9938-4.
[5] Bai S, Ducas L, Kiltz E, Lepoint T, Lyubashevsky V, Schwabe P, Seiler G, Stehlé D (2020) CRYSTALSDilithium: Algorithm specifications and supporting documentation, Submission to the NIST’s postquantum cryptography standardization process. Available at https://csrc.nist.gov/Projects/post-qua
ntum-cryptography/post-quantum-cryptography-standardization/round-3-submissions.
[6] Bai S, Ducas L, Kiltz E, Lepoint T, Lyubashevsky V, Schwabe P, Seiler G, Stehlé D (2021) CRYSTALSDilithium: Algorithm specifications and supporting documentation (Version 3.1). Available at https:
//pq-crystals.org/dilithium/data/dilithium-specification-round3-20210208.pdf.
[7] National Institute of Standards and Technology (2015) SHA-3 standard: Permutation-based hash and
extendable-output functions, (U.S. Department of Commerce, Washington, DC), Federal Information
Processing Standards Publication (FIPS) 202. https://doi.org/10.6028/NIST.FIPS.202.
[8] National Institute of Standards and Technology (2015) Secure hash standard (SHS), (U.S. Department
of Commerce, Washington, DC), Federal Information Processing Standards Publication (FIPS) 180-4.
https://doi.org/10.6028/NIST.FIPS.180-4.
[9] Barker E (2020) Recommendation for key management: Part 1 - general, (National Institute of
Standards and Technology, Gaithersburg, MD), NIST Special Publication (SP) 800-57 Part 1, Rev. 5 [or
as amended]. https://doi.org/10.6028/NIST.SP.800-57pt1r5.
[10] Lyubashevsky V (2009) Fiat-Shamir with aborts: Applications to lattice and factoring-based signatures. Advances in Cryptology – ASIACRYPT 2009, ed Matsui M (Springer Berlin Heidelberg, Berlin,
Heidelberg), pp 598–616. https://doi.org/10.1007/978-3-642-10366-7_35.
[11] Lyubashevsky V (2012) Lattice signatures without trapdoors. EUROCRYPT (Springer), Lecture Notes
in Computer Science, Vol. 7237, pp 738–755. https://doi.org/10.1007/978-3-642-29011-4_43.
[12] Güneysu T, Lyubashevsky V, Pöppelmann T (2012) Practical lattice-based cryptography: A signature
scheme for embedded systems. CHES (Springer), Vol. 7428, pp 530–547. https://doi.org/10.1007/97
8-3-642-33027-8_31.
[13] Bai S, Galbraith SD (2014) An improved compression technique for signatures based on learning with
errors. Topics in Cryptology – CT-RSA 2014, ed Benaloh J (Springer International Publishing, Cham),
pp 28–47. https://doi.org/10.1007/978-3-319-04852-9_2.

47

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

[14] Cremers C, Düzlü S, Fiedler R, Janson C, Fischlin M (2021) BUFFing signature schemes beyond
unforgeability and the case of post-quantum signatures. 2021 IEEE Symposium on Security and
Privacy (SP) (IEEE Computer Society, Los Alamitos, CA, USA), pp 1696–1714. https://doi.org/10.110
9/SP40001.2021.00093.
[15] Regev O (2005) On lattices, learning with errors, random linear codes, and cryptography. Proceedings
of the Thirty-Seventh Annual ACM Symposium on Theory of Computing STOC ’05 (Association for
Computing Machinery, New York, NY, USA), p 84–93. https://doi.org/10.1145/1060590.1060603.
[16] Kiltz E, Lyubashevsky V, Schaffner C (2018) A concrete treatment of Fiat-Shamir signatures in the
quantum random-oracle model. Advances in Cryptology – EUROCRYPT 2018, eds Nielsen JB, Rijmen
V (Springer International Publishing, Cham), pp 552–586. https://doi.org/10.1007/978-3-319-78372
-7_18.
[17] Barker E, Barker W (2019) Recommendation for key management: Part 2 - best practices for key
management organizations, National Institute of Standards and Technology, Gaithersburg, MD. NIST
Special Publication (SP) 800-57 Part 2, Rev. 1. https://doi.org/10.6028/NIST.SP.800-57pt2r1.
[18] Barker E, Dang Q (2019) Recommendation for key management: Part 3 - application-specific key
management guidance, National Institute of Standards and Technology, Gaithersburg, MD. NIST
Special Publication (SP) 800-57 Part 3, Rev. 1. http://doi.org/10.6028/NIST.SP.800-57pt3r1.
[19] Barker E, Kelsey J (2015) Recommendation for random number generation using deterministic
random bit generators, (National Institute of Standards and Technology, Gaithersburg, MD), NIST
Special Publication (SP) 800-90A, Rev. 1. https://doi.org/10.6028/NIST.SP.800-90Ar1.
[20] Sönmez Turan M, Barker E, Kelsey J, McKay K, Baish M, Boyle M (2018) Recommendation for the
entropy sources used for random bit generation, (National Institute of Standards and Technology,
Gaithersburg, MD), NIST Special Publication (SP) 800-90B. https://doi.org/10.6028/NIST.SP.800-90B.
[21] Barker E, Kelsey J, McKay K, Roginsky A, Turan MS (2024) Recommendation for random bit generator
(RBG) constructions, (National Institute of Standards and Technology, Gaithersburg, MD), NIST Special
Publication (SP) 800-90C 4pd. https://doi.org/10.6028/NIST.SP.800-90C.4pd.
[22] Bruinderink LG, Pessl P (2018) Differential fault attacks on deterministic lattice signatures. IACR
Transactions on Cryptographic Hardware and Embedded Systems (3):21–43. https://doi.org/10.131
54/tches.v2018.i3.21-43.
[23] Poddebniak D, Somorovsky J, Schinzel S, Lochter M, Rösler P (2018) Attacking deterministic signature
schemes using fault attacks. 2018 IEEE European Symposium on Security and Privacy (EuroS&P)
(IEEE), pp 338–352. https://doi.org/10.1109/EuroSP.2018.00031.
[24] Samwel N, Batina L, Bertoni G, Daemen J, Susella R (2018) Breaking ed25519 in wolfssl. Topics in
Cryptology–CT-RSA 2018: The Cryptographers’ Track at the RSA Conference 2018, San Francisco, CA,
USA, April 16-20, 2018, Proceedings (Springer), pp 1–20. https://doi.org/10.1007/978-3-319-76953
-0_1.
[25] Kelsey J, Chang S, Perlner R (2016) SHA-3 Derived Functions: cSHAKE, KMAC, TupleHash and ParallelHash, (National Institute of Standards and Technology, Gaithersburg, MD), NIST Special Publication
(SP) 800-185 [or as amended]. https://doi.org/10.6028/NIST.SP.800-185.
[26] National Institute of Standards and Technology (2016) Submission requirements and evaluation
criteria for the post-quantum cryptography standardization process. Available at https://csrc.nist.go

48

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

v/CSRC/media/Projects/Post-Quantum-Cryptography/documents/call-for-proposals-final-dec-201
6.pdf.
[27] Alagic G, Apon D, Cooper D, Dang Q, Dang T, Kelsey J, Lichtinger J, Liu YK, Miller C, Moody D, Peralta R,
Perlner R, Robinson A, Smith-Tone D (2022) Status report on the third round of the NIST post-quantum
cryptography standardization process (National Institute of Standards and Technology, Gaithersburg,
MD), NIST Interagency or Internal Report (IR) 8413. https://doi.org/10.6028/NIST.IR.8413-upd1.
[28] Avanzi R, Bos J, Ducas L, Kiltz E, Lepoint T, Lyubashevsky V, Schanck JM, Schwabe P, Seiler G,
Stehlé D (2020) CRYSTALS-Kyber algorithm specifications and supporting documentation, 3rd
Round submission to the NIST’s post-quantum cryptography standardization process. Available
at https://csrc.nist.gov/Projects/post-quantum-cryptography/post-quantum-cryptography-standar
dization/round-3-submissions.
[29] Housley R (2009) Cryptographic Message Syntax (CMS), Internet Engineering Task Force (IETF) request
for comments (RFC) 5652, https://doi.org/10.17487/RFC5652.
[30] Schnorr C (1990) Efficient identification and signatures for smart cards. Advances in Cryptology —
CRYPTO’ 89 Proceedings, ed Brassard G (Springer New York, New York, NY), pp 239–252. https:
//doi.org/10.1007/0-387-34805-0_22.
[31] Josefsson S, Liusvaara I (2017) Edwards-Curve Digital Signature Algorithm (EdDSA), RFC 8032. https:
//doi.org/10.17487/RFC8032.
[32] Lyubashevsky V (2021) Round 3 Official Comment: CRYSTALS-DILITHIUM. Available at https://groups
.google.com/a/list.nist.gov/g/pqc-forum/c/BjfjRMIdnhM/m/W7kkVOFDBAAJ.
[33] Hamburg M (2024) Dilithium hint unpacking. Available at https://groups.google.com/a/list.nist.gov/
g/pqc-forum/c/TQo-qFbBO1A/m/YcYKjMblAAAJ.
[34] Mattsson (on behalf of Sönke Jendral) JP (2024) Dilithium hint unpacking. Available at https://grou
ps.google.com/a/list.nist.gov/g/pqc-forum/c/TQo-qFbBO1A/m/sLjseYlSAwAJ.
[35] Lee S (2024) Updates for FIPS 203. Available at https://groups.google.com/a/list.nist.gov/g/pqc-for
um/c/Rb0nFvfFTEQ/m/lw-k7tVdBQAJ.

49

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

Appendix A — Montgomery Multiplication
This document uses modular multiplications of the form 𝑎 ⋅ 𝑏 modulo 𝑞. This is an expensive operation
that is often sped up in practice through the use of Montgomery Multiplication.
If 𝑎 is an integer modulo 𝑞, then its Montgomery form with multiplier 232 is 𝑟 ≡ 𝑎 ⋅ 232 mod 𝑞. 13
Suppose that two integers 𝑢 and 𝑣 modulo 𝑞 are in Montgomery form. Their product modulo 𝑞 is
𝑐 = 𝑢 ⋅ 𝑣 ⋅ 2−32 , which is also in Montgomery form. If the integer product of 𝑢 and 𝑣 does not overflow a
64-bit signed integer, then one can compute 𝑐 by first performing the integer multiplication 𝑢 ⋅ 𝑣 and then
“reducing” the product by multiplying by 2−32 modulo 𝑞. This last operation can be done efficiently as
follows.
The MontgomeryReduce function takes an integer 𝑎 with absolute value at most 231 𝑞 as input. It returns
an integer 𝑟 such that 𝑟 = 𝑎 ⋅ 2−32 mod 𝑞. The output is in Montgomery form with multiplier 232 mod 𝑞.
An implementation would typically input a 64-bit input and return a 32-bit output. The “modulo 232 ”
operation simply extracts the 32 least significant bits of a 64-bit value. The value (𝑎 − 𝑡 ⋅ 𝑞) on line 3 is an
integer divisible by 232 . Therefore, the division consists of simply taking the most significant 32 bits of a
64-bit value. Extracting the four low- or high-order bytes is often done using typecasting.

```

### CipherCat

尚未实现。
