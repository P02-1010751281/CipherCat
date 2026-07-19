# SHA-2 — 6. SECURE HASH ALGORITHMS

来源: NIST FIPS 180-4

In the following sections, the hash algorithms are not described in ascending order of size. SHA- 256 is described before SHA-224 because the specification for SHA-224 is identical to SHA- 256, except that different initial hash values are used, and the final hash value is truncated to 224 bits for SHA-224. The same is true for SHA-512, SHA-384, SHA-512/224 and SHA-512/256, except that the final hash value is truncated to 224 bits for SHA-512/224, 256 bits for SHA- 512/256 or 384 bits for SHA-384.
For each of the secure hash algorithms, there may exist alternate computation methods that yield identical results; one example is the alternative SHA-1 computation described in Sec. 6.1.3.
Such alternate methods may be implemented in conformance to this standard.
6.1 SHA-1
SHA-1 may be used to hash a message, M, having a length of  bits, where 0264. The algorithm uses 1) a message schedule of eighty 32-bit words, 2) five working variables of 32 bits each, and 3) a hash value of five 32-bit words. The final result of SHA-1 is a 160-bit message digest.
The words of the message schedule are labeled W , W ,…, W . The five working variables are 0 1 79 labeled a, b, c, d, and e. The words of the hash value are labeled H(i),H(i),,H(i), which will 0 1 4 hold the initial hash value, H(0), replaced by each successive intermediate hash value (after each message block is processed), H(i), and ending with the final hash value, H(N). SHA-1 also uses a single temporary word, T. 6.1.1 SHA-1 Preprocessing
1. Set the initial hash value, H(0), as specified in Sec. 5.3.1.
2. The message is padded and parsed as specified in Section 5.
6.1.2 SHA-1 Hash Computation The SHA-1 hash computation uses functions and constants previously defined in Sec. 4.1.1 and Sec. 4.2.1, respectively. Addition (+) is performed modulo 232.
Each message block, M(1), M(2), …, M(N), is processed in order, using the following steps:
For i=1 to N: {
1. Prepare the message schedule, {W}:
t M(i) 0t 15 t W = t ROTL1(W W W W ) 16t 79 t3 t8 t14 t16
2. Initialize the five working variables, a, b, c, d, and e, with the (i-1)st hash value:
a  H(i1) 0 b  H(i1) 1 c  H(i1) 2 d  H(i1) 3 e  H(i1)
3. For t=0 to 79:
{ T  ROTL5(a) f (b,c,d)eK W t t t e  d d c c  ROTL30(b) b  a a T }
4. Compute the ith intermediate hash value H(i):
H(i)  aH(i1) 0 0 H(i) bH(i1) 1 1 H(i) cH(i1) 2 2 H(i)  d H(i1) 3 3 H(i) eH(i1) 4 4 }
After repeating steps one through four a total of N times (i.e., after processing M(N)), the resulting 160-bit message digest of the message, M, is H(N) H(N) H(N) H(N) H(N) 0 1 2 3 4 6.1.3 Alternate Method for Computing a SHA-1 Message Digest The SHA-1 hash computation method described in Sec. 6.1.2 assumes that the message schedule W , W ,…, W is implemented as an array of eighty 32-bit words. This is efficient from the 0 1 79 standpoint of the minimization of execution time, since the addresses of W ,…, W in step (2) t-3 t-16 of Sec. 6.1.2 are easily computed.
However, if memory is limited, an alternative is to regard {W} as a circular queue that may be t implemented using an array of sixteen 32-bit words, W , W ,…, W . The alternate method that is 0 1 15 described in this section yields the same message digest as the SHA-1 computation method described in Sec. 6.1.2. Although this alternate method saves sixty-four 32-bit words of storage, it is likely to lengthen the execution time due to the increased complexity of the address computations for the {W} in step (3). t For this alternate SHA-1 method, let MASK=0000000f (in hex). As in Sec. 6.1.1, addition is performed modulo 232. Assuming that the preprocessing as described in Sec. 6.1.1 has been performed, the processing of M(i) is as follows:
For i=1 to N: {
1. For t=0 to 15:
{ W  M(i) t t }
2. Initialize the five working variables, a, b, c, d, and e, with the (i-1)st hash value:
a  H(i1) 0 b  H(i1) 1 c  H(i1) 2 d  H(i1) 3 e  H(i1)
3. For t=0 to 79:
{ s tMASK
If t 16then { W  ROTL1(W W W W ) s (s13)MASK (s8)MASK (s2)MASK s } T  ROTL5(a) f (b,c,d)eK W t t s e  d d c c  ROTL30(b) b  a a T }
4. Compute the ith intermediate hash value H(i):
H(i)  aH(i1) 0 0 H(i) bH(i1) 1 1 H(i) cH(i1) 2 2 H(i)  d H(i1) 3 3 H(i) eH(i1) 4 4 } After repeating steps one through four a total of N times (i.e., after processing M(N)), the resulting 160-bit message digest of the message, M, is H(N) H(N) H(N) H(N) H(N) 0 1 2 3
6.2 SHA-256
SHA-256 may be used to hash a message, M, having a length of  bits, where 0264. The algorithm uses 1) a message schedule of sixty-four 32-bit words, 2) eight working variables of 32 bits each, and 3) a hash value of eight 32-bit words. The final result of SHA-256 is a 256-bit message digest.
The words of the message schedule are labeled W , W ,…, W . The eight working variables are 0 1 63 labeled a, b, c, d, e, f, g, and h. The words of the hash value are labeled H(i),H(i),,H(i), 0 1 7 which will hold the initial hash value, H(0), replaced by each successive intermediate hash value
(after each message block is processed), H(i), and ending with the final hash value, H(N). SHA- 256 also uses two temporary words, T and T . 1 2 6.2.1 SHA-256 Preprocessing
1. Set the initial hash value, H(0), as specified in Sec. 5.3.3.
2. The message is padded and parsed as specified in Section 5.
6.2.2 SHA-256 Hash Computation The SHA-256 hash computation uses functions and constants previously defined in Sec. 4.1.2 and Sec. 4.2.2, respectively. Addition (+) is performed modulo 232.
Each message block, M(1), M(2), …, M(N), is processed in order, using the following steps:
For i=1 to N: {
1. Prepare the message schedule, {W}:
t M(i) 0t 15 t W = t {256}(W )W {256}(W )W 16t 63 1 t2 t7 0 t15 t16
2. Initialize the eight working variables, a, b, c, d, e, f, g, and h, with the (i-1)st hash
value: a  H(i1) 0 b  H(i1) 1 c  H(i1) 2 d  H(i1) 3 e  H(i1) 4 f  H(i1) 5 g  H(i1) 6 h  H(i1) 7
3. For t=0 to 63:
{ T  h{256} (e)Ch(e, f,g)K{256} W 1 1 t t T  {256} (a)Maj(a,b,c) 2 0 h  g g  f f e e  d T 1 d c c b b  a a T T 1 2 }
4. Compute the ith intermediate hash value H(i):
H(i)  a H(i1) 0 0 H(i) b H(i1) 1 1 H(i)  c H(i1) 2 2 H(i)  d H(i1) 3 3 H(i)  e H(i1) 4 4 H(i)  f  H(i1) 5 5 H(i)  g  H(i1) 6 6 H(i)  h H(i1) 7 7 } After repeating steps one through four a total of N times (i.e., after processing M(N)), the resulting 256-bit message digest of the message, M, is H(N) H(N) H(N) H(N) H(N) H(N) H(N) H(N) 0 1 2 3 4 5 6
6.3 SHA-224
SHA-224 may be used to hash a message, M, having a length of  bits, where 0264. The function is defined in the exact same manner as SHA-256 (Section 6.2), with the following two exceptions:
1. The initial hash value, H(0), shall be set as specified in Sec. 5.3.2; and
2. The 224-bit message digest is obtained by truncating the final hash value, H(N), to its
left-most 224 bits:
H(N) H(N) H(N) H(N) H(N) H(N) H (N) 0 1 2 3 4 5
6.4 SHA-512
SHA-512 may be used to hash a message, M, having a length of  bits, where 02128. The algorithm uses 1) a message schedule of eighty 64-bit words, 2) eight working variables of 64 bits each, and 3) a hash value of eight 64-bit words. The final result of SHA-512 is a 512-bit message digest.
The words of the message schedule are labeled W , W ,…, W . The eight working variables are 0 1 79 labeled a, b, c, d, e, f, g, and h. The words of the hash value are labeled H(i),H(i),,H(i), 0 1 7 which will hold the initial hash value, H(0), replaced by each successive intermediate hash value (after each message block is processed), H(i), and ending with the final hash value, H(N). SHA- 512 also uses two temporary words, T and T . 1 2 6.4.1 SHA-512 Preprocessing
1. Set the initial hash value, H(0), as specified in Sec. 5.3.5.
2. The message is padded and parsed as specified in Section 5.
6.4.2 SHA-512 Hash Computation The SHA-512 hash computation uses functions and constants previously defined in Sec. 4.1.3 and Sec. 4.2.3, respectively. Addition (+) is performed modulo 264.
Each message block, M(1), M(2), …, M(N), is processed in order, using the following steps:
For i=1 to N: {
1. Prepare the message schedule, {W}:
t M(i) 0t 15 t W = t {512}(W )W {512}(W )W 16t 79 1 t2 t7 0 t15 t16
2. Initialize the eight working variables, a, b, c, d, e, f, g, and h, with the (i-1)st hash
value:
a  H(i1) 0 b  H(i1) 1 c  H(i1) 2 d  H(i1) 3 e  H(i1) 4 f  H(i1) 5 g  H(i1) 6 h  H(i1)
3. For t=0 to 79:
{ T  h{512} (e)Ch(e, f,g)K{512} W 1 1 t t T  {512} (a)Maj(a,b,c) 2 0 h  g g  f f e e  d T 1 d c c b b  a a T T 1 2 }
4. Compute the ith intermediate hash value H(i):
H(i)  a H(i1) 0 0 H(i) b H(i1) 1 1 H(i)  c H(i1) 2 2 H(i)  d H(i1) 3 3 H(i)  e H(i1) 4 4 H(i)  f  H(i1) 5 5 H(i)  g  H(i1) 6 6 H(i)  h H(i1) 7 7 }
After repeating steps one through four a total of N times (i.e., after processing M(N)), the resulting 512-bit message digest of the message, M, is H(N) H(N) H(N) H(N) H(N) H(N) H(N) H(N) 0 1 2 3 4 5 6
6.5 SHA-384
SHA-384 may be used to hash a message, M, having a length of  bits, where02128. The algorithm is defined in the exact same manner as SHA-512 (Sec. 6.4), with the following two exceptions:
1. The initial hash value, H(0), shall be set as specified in Sec. 5.3.4; and
2. The 384-bit message digest is obtained by truncating the final hash value, H(N), to its
left-most 384 bits:
H(N) H(N) H(N) H(N) H(N) H(N) 0 1 2 3 4
6.6 SHA-512/224
SHA-512/224 may be used to hash a message, M, having a length of  bits, where02128.
The algorithm is defined in the exact same manner as SHA-512 (Sec. 6.4), with the following two exceptions:
1. The initial hash value, H(0), shall be set as specified in Sec. 5.3.6.1; and
2. The 224-bit message digest is obtained by truncating the final hash value, H(N), to its
left-most 224 bits.
6.7 SHA-512/256
SHA-512/256 may be used to hash a message, M, having a length of  bits, where02128.
The algorithm is defined in the exact same manner as SHA-512 (Sec. 6.4), with the following two exceptions:
1. The initial hash value, H(0), shall be set as specified in Sec. 5.3.6.2; and
2. The 256-bit message digest is obtained by truncating the final hash value, H(N), to its
left-most 256 bits.
---

7. TRUNCATION OF A MESSAGE DIGEST
Some application may require a hash function with a message digest length different than those provided by the hash functions in this Standard. In such cases, a truncated message digest may be used, whereby a hash function with a larger message digest length is applied to the data to be hashed, and the resulting message digest is truncated by selecting an appropriate number of the leftmost bits. For guidelines on choosing the length of the truncated message digest and information about its security implications for the cryptographic application that uses it, see SP 800-107 [SP 800-107].
APPENDIX A: Additional Information A.1 Security of the Secure Hash Algorithms The security of the five hash algorithms, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224 and SHA-512/256 is discussed in [SP 800-107].
A.2 Implementation Notes Examples of SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224 and SHA- 512/256 are available at http://csrc.nist.gov/groups/ST/toolkit/examples.html.
A.3 Object Identifiers Object identifiers (OIDs) for the SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA- 512/224 and SHA-512/256 algorithms are posted at http://csrc.nist.gov/groups/ST/crypto_apps_infra/csor/algorithms.html.
APPENDIX B: REFERENCES [FIPS 180-3] NIST, Federal Information Processing Standards Publication 180-3, Secure Hash Standards (SHS), October 2008. [SP 800-57] NIST Special Publication (SP) 800-57, Part 1, Recommendation for Key Management: General, (Draft) May 2011. [SP 800-107] NIST Special Publication (SP) 800-107, Recommendation for Applications Using Approved Hash Algorithms, (Revised), (Draft) September 2011.
APPENDIX C: Technical Changes from FIPS 180-3
1. In FIPS 180-3, padding was inserted before hash computation begins. FIPS 140-4
removed this restriction. Padding can be inserted before hash computation begins or at any other time during the hash computation prior to processing the message block(s) containing the padding.
2. FIPS 180-4 adds two additional algorithms: SHA-512/224 and SHA-512/256 to the
Standard and the method for determining the initial value for SHA-512/t for a given value of t.
ERRATUM The following change has been incorporated into FIPS 180-4, as of the date indicated in the table.
DATE TYPE CHANGE PAGE NUMBER 5/9/2014 Editorial Change “t < 79” to “t 79” Page 10, Section 4.1.1, Line
