# Ascon LWC

来源: NIST SP 800-232

Withdrawn Draft
Warning Notice
The attached draft document has been withdrawn and is provided solely for historical purposes.
It has been followed by the document identified below.
Withdrawal Date August 13, 2025
Original Release Date November 8, 2024
The attached draft document is followed by:
Status Final
Series/Number NIST SP 800-232
Title Ascon-Based Lightweight Cryptography Standards for Constrained
Devices: Authenticated Encryption, Hash, and Extendable Output
Functions
Publication Date August 2025
DOI https://doi.org/10.6028/NIST.SP.800-232
CSRC URL https://csrc.nist.gov/pubs/sp/800/232/final
Additional Information

NIST Special Publication 800
1

2
Ascon-Based Lightweight Cryptography
3
Standards for Constrained Devices
4
Authenticated Encryption, Hash, and Extendable Output
5
Functions
6
Initial Public Draft
7
Meltem Sönmez Turan
8
Kerry A. Mc Kay
9
Donghoon Chang
10
Jinkeon Kang
11
John Kelsey
12
This publication is available free of charge from:
13
https://doi.org/10.6028/NIST.SP.800-232.ipd
14
15

NIST Special Publication 800
16

17
Ascon-Based Lightweight Cryptography
18
Standards for Constrained Devices
19
Authenticated Encryption, Hash, and Extendable Output
20
Functions
21
Initial Public Draft
22
Meltem Sönmez Turan
23
Kerry A. Mc Kay
Jinkeon Kang
John Kelsey
Computer Security Division
Information Technology Laboratory
Donghoon Chang
Strativia
This publication is available free of charge from:
24
https://doi.org/10.6028/NIST.SP.800-232.ipd
25
November 2024
26
27
U.S. Department of Commerce
28
Gina M. Raimondo, Secretary
29
National Institute of Standards and Technology
30
Laurie E. Locascio, NIST Director and Under Secretary of Commerce for Standards and Technology
31

 (Initial Public Draft)
November 2024
Certain equipment, instruments, software, or materials, commercial or non-commercial, are identified in this
32
paper in order to specify the experimental procedure adequately. Such identification does not imply
33
recommendation or endorsement of any product or service by NIST, nor does it imply that the materials or
34
equipment identified are necessarily the best available for the purpose.
35
There may be references in this publication to other publications currently under development by NIST in
36
accordance with its assigned statutory responsibilities. The information in this publication, including
37
concepts and methodologies, may be used by federal agencies even before the completion of such
38
companion publications. Thus, until each publication is completed, current requirements, guidelines, and
39
procedures, where they exist, remain operative. For planning and transition purposes, federal agencies may
40
wish to closely follow the development of these new publications by NIST.
41
Organizations are encouraged to review all draft publications during public comment periods and provide
42
feedback to NIST. Many NIST cybersecurity publications, other than the ones noted above, are available at
43
https://csrc.nist.gov/publications
44
Authority
45
This publication has been developed by NIST in accordance with its statutory responsibilities under the
46
Federal Information Security Modernization Act (FISMA) of 2014, 44 U.S.C. § 3551 et seq., Public Law (P.L.)
47
113-283. NIST is responsible for developing information security standards and guidelines, including
48
minimum requirements for federal information systems, but such standards and guidelines shall not apply to
49
national security systems without the express approval of appropriate federal officials exercising policy
50
authority over such systems. This guideline is consistent with the requirements of the Office of Management
51
and Budget (OMB) Circular A-130.
52
Nothing in this publication should be taken to contradict the standards and guidelines made mandatory and
53
binding on federal agencies by the Secretary of Commerce under statutory authority. Nor should these
54
guidelines be interpreted as altering or superseding the existing authorities of the Secretary of Commerce,
55
Director of the ORCID, or any other federal official. This publication may be used by nongovernmental
56
organizations on a voluntary basis and is not subject to copyright in the United States. Attribution would,
57
however, be appreciated by NIST.
58
NIST Technical Series Policies
59
Copyright, Use, and Licensing Statements
60
NIST Technical Series Publication Identifier Syntax
61
Publication History
62
Approved by the NIST Editorial Review Board on YYYY-MM-DD [Will be added in the final publication.]
63
How to cite this NIST Technical Series Publication: Meltem Sönmez Turan, Kerry A. Mc Kay, Donghoon Chang,
64
Jinkeon Kang, John Kelsey (2024) Ascon-Based Lightweight Cryptography Standards for Constrained
65
Devices. (National Institute of Standards and Technology, Gaithersburg, MD),NIST Special Publication (SP)
66
. https://doi.org/10.6028/NIST.SP.800-232.ipd
67

 (Initial Public Draft)
November 2024
Author ORCID iDs
68
Meltem Sönmez Turan: 0000-0002-1950-7130
69
Kerry A. Mc Kay: 0000-0002-5956-587X
70
Donghoon Chang: 0000-0003-1249-2869
71
Jinkeon Kang: 0000-0003-2142-8236
72
John Kelsey: 0000-0002-3427-1744
73
Public Comment Period
74
November 8, 2024 -– February 7, 2025
75
Submit Comments
76
SP800-232-comments@list.nist.gov
77
National Institute of Standards and Technology
78
Attn: Computer Security Division, Information Technology Laboratory
79
100 Bureau Drive (Mail Stop 8930) Gaithersburg, MD 20899-8930
80
Additional Information
81
Additional information about this publication is available at https://csrc.nist.gov/pubs/sp/800/232/ipd,
82
including related content, potential updates, and document history.
83
All comments are subject to release under the Freedom of Information Act (FOIA).
84

 (Initial Public Draft)
November 2024
Abstract
85
In 2023, the National Institute of Standards and Technology (NIST) announced the selection
86
of the Ascon family of algorithms designed by Dobraunig, Eichlseder, Mendel, and Schläffer
87
to provide efficient cryptography solutions for resource-constrained devices. This decision
88
emerged from a rigorous, multi-round lightweight cryptography standardization process.
89
This standard introduces a new Ascon-based family of symmetric-key cryptographic primi-
90
tives designed to deliver Authenticated Encryption with Associated Data (AEAD), hash, and
91
Extendable Output Function (XOF) capabilities, namely Ascon-AEAD128, Ascon-Hash256,
92
Ascon-XOF128, and Ascon-CXOF128. The Ascon family is characterized by lightweight
93
permutation-based primitives and provides robust security, efficiency, and flexibility, mak-
94
ing it ideal for resource-constrained environments, such as Internet of Things (IoT) devices,
95
embedded systems, and low-power sensors. The family is developed to offer a viable
96
alternative when the Advanced Encryption Standard (AES) may not perform optimally. This
97
draft standard outlines the technical specifications of Ascon-AEAD128, Ascon-Hash256,
98
Ascon-XOF128, and Ascon-CXOF128, and provides their security properties.
99
Keywords
100
Ascon; authenticated encryption; constrained devices; e Xtendable Output Function (XOF);
101
hash function; lightweight cryptography; permutation-based cryptography; standardization.
102
Reports on Computer Systems Technology
103
The Information Technology Laboratory (ITL) at the National Institute of Standards and
104
Technology (NIST) promotes the U.S. economy and public welfare by providing technical lead-
105
ership for the Nation’s measurement and standards infrastructure. ITL develops tests, test
106
methods, reference data, proof of concept implementations, and technical analyses to ad-
107
vance the development and productive use of information technology. ITL’s responsibilities
108
include the development of management, administrative, technical, and physical standards
109
and guidelines for the cost-effective security and privacy of other than national security-
110
related information in federal information systems. The Special Publication 800-series
111
reports on ITL’s research, guidelines, and outreach efforts in information system security,
112
and its collaborative activities with industry, government, and academic organizations.
113
i

 (Initial Public Draft)
November 2024
Call for Patent Claims
114
This public review includes a call for information on essential patent claims (claims whose
115
use would be required for compliance with the guidance or requirements in this Information
116
Technology Laboratory (ITL) draft publication). Such guidance and/or requirements may
117
be directly stated in this ITL Publication or by reference to another publication. This call
118
also includes disclosure, where known, of the existence of pending U.S. or foreign patent
119
applications relating to this ITL draft publication and of any relevant unexpired U.S. or
120
foreign patents.
121
ITL may require from the patent holder, or a party authorized to make assurances on its
122
behalf, in written or electronic form, either:
123
1. assurance in the form of a general disclaimer to the effect that such party does not
124
hold and does not currently intend holding any essential patent claim(s); or
125
2. assurance that a license to such essential patent claim(s) will be made available
126
to applicants desiring to utilize the license for the purpose of complying with the
127
guidance or requirements in this ITL draft publication either:
128
(a) under reasonable terms and conditions that are demonstrably free of any unfair
129
discrimination; or
130
(b) without compensation and under reasonable terms and conditions that are
131
demonstrably free of any unfair discrimination.
132
Such assurance shall indicate that the patent holder (or third party authorized to make
133
assurances on its behalf) will include in any documents transferring ownership of patents
134
subject to the assurance, provisions sufficient to ensure that the commitments in the assur-
135
ance are binding on the transferee, and that the transferee will similarly include appropriate
136
provisions in the event of future transfers with the goal of binding each successor-in-interest.
137
The assurance shall also indicate that it is intended to be binding on successors-in-interest
138
regardless of whether such provisions are included in the relevant transfer documents.
139
Such statements should be addressed to: SP800-232-comments@list.nist.gov
140
ii

 (Initial Public Draft)
November 2024
Table of Contents
141
1. Introduction .......................................................................... 1
142
2. Preliminaries.......................................................................... 4
143
2.1. Auxiliary Functions .......... ... ... ... ... ... .......... ... ... ... ... ... .......... ... 8
144
3. Ascon Permutations .................................................................. 9
145
3.1. Internal State ... ... ... ... ... .......... ... ... ... ... ... .......... ... ... ... ... ... ... 9
146
3.2. Constant-Addition Layer 𝑝 ...... ... ... ... ................ ... ... ... .............. 9
147 𝐶
3.3. Substitution Layer 𝑝 .............. ... ... ... ... ............. ... ... ... ... .......... 10
148 𝑆
3.4. Linear Diffusion Layer 𝑝 ... ... ... ... ....... ... ... ... ... ... ... ... .... ... ... ... ... . 11
149 𝐿
4. Authenticated Encryption Scheme: Ascon-AEAD128 ............................... 12
150
4.1. Specification of Ascon-AEAD128 .. ... .......... ... ... ... ... ... .......... ... ... .. 12
151
4.1.1. Encryption ......... ... ... ... ................ ... ... ... ................ ... ... 12
152
4.1.2. Decryption ......... ... ... ... ................ ... ... ... ................ ... ... 15
153
4.2. Implementation Options ... ... ... ... ....... ... ... ... ... ... ... ... .... ... ... ... ... . 19
154
4.2.1. Truncation ......... ... ... ... ................ ... ... ... ................ ... ... 19
155
4.2.2. Nonce Masking ... ................ ... ... ... ................ ... ... ... ....... 19
156
4.3. AEADRequirements .. ....... ... ... ... ... ... ... ....... ... ... ... ... ... ... ... .... ... 19
157
4.4. Security Properties .......... ... ... ... ... ... .......... ... ... ... ... ... .......... ... 20
158
4.4.1. Single-Key Setting .... ... ... .......... ... ... ... ... ... .......... ... ... ... ... . 20
159
4.4.2. Multi-Key Setting .... ... ... .......... ... ... ... ... ... .......... ... ... ... ... . 20
160
4.4.3. Nonce-Misuse Setting ..... ... ... ... ... ... .......... ... ... ... ... ... ........ 21
161
5. Hash and Extendable Output Functions ............................................. 22
162
5.1. Specification of Ascon-Hash256 .. ... .......... ... ... ... ... ... .......... ... ... .. 22
163
5.2. Specification of Ascon-XOF128 .............. ... ... ................... ... ... ..... 25
164
5.3. Specification of Ascon-CXOF128 .. ... .......... ... ... ... ... ... .......... ... ... .. 27
165
5.4. Security Strengths ........... ... ... ... ................ ... ... ... ................ ... 27
166
AppendixA. Implementation Notes .................................................... 31
167
A.1. Conversion Functions ... ................ ... ... ... ................ ... ... ... ....... 31
168
iii

 (Initial Public Draft)
November 2024
A.2. Implementingwith Integers ..... ... ... ... ... ... .......... ... ... ... ... ... ........ 32
169
Appendix B. Determination of the Initial Values....................................... 36
170
iv

 (Initial Public Draft)
November 2024
List of Tables
171
Table1. Acronyms ... ... ... .......... ... ... ... ... ... .......... ... ... ... ... ... .......... .. 4
172
Table2. Terms anddefinitions.. ... ................ ... ... ... ................ ... ... ... .... 4
173
Table3. Notations ... ... ... .......... ... ... ... ... ... .......... ... ... ... ... ... .......... .. 6
174
Table4. Basicoperationsandfunctions ................ ... ... ... ................ ... ... .. 7
175
Table 5. The constants const to derive round constants of the Ascon permutations . 10
176 𝑖
Table6. Lookuptable representationofSBOX .. ... ... ... ... ... ....... ... ... ... ... ... ... 11
177
Table 7. Security strength of Ascon-AEAD128 with 𝜆-bit tag in the 𝑢-key setting,
178
where (𝑁, 𝐴)pairisuniquefor encryption. .. ... ................... ... ... ............... 21
179
Table 8. Integrity security strength of Ascon-AEAD128 with 𝑢 keys in the nonce-
180
misusesetting .............. ... ... ... ................ ... ... ... ................ ... ... ... .. 22
181
Table 9. Security strengths of Ascon-Hash256, Ascon-XOF128, and Ascon-CXOF128
182
algorithms .... ... ... ... ................ ... ... ... ................ ... ... ... ................ . 29
183
Table 10. Address for each byte of Ascon state word 𝑆 in memory on little-endian
184 𝑖
and big-endian machines, where the word 𝑆 begins at memory address 𝑎............ 32
185 𝑖
Table 11. Examples of padding an unsigned integer 𝑥 to a64-bitblock .... ... ... ... ... 34
186
Table12. Parameters for initialvalue construction .. ....... ... ... ... ... ... ... ....... ... 36
187
Table13. Initialvalues ashexadecimalintegers.... ... ... ... ... ............. ... ... ... ... 36
188
List of Figures
189
Figure 1. Constant-Addition Layer 𝑝 ......... ... ... ... ... ............. ... ... ... ... ..... 10
190 𝐶
Figure 2. Substitution layer 𝑝 .... ... ... .......... ... ... ... ... ... .......... ... ... ... ... . 10
191 𝑆
Figure 3. 5-bitS-box SBOX .......... ... ... ... ... ... .......... ... ... ... ... ... .......... ... 11
192
Figure 4. Linear diffusion layer 𝑝 .... ... ... ... ................ ... ... ... ................ . 11
193 𝐿
Figure 5. Ascon-AEAD128 encryption ......... ... ... ... ... ............. ... ... ... ... ..... 12
194
Figure 6. Ascon-AEAD128 decryption .............. ... ... ................... ... ... ..... 17
195
Figure 7. Structure of Ascon-Hash256 and Ascon-XOF128 ..... ... ... ... ... ... ........ 22
196
Figure 8. Structure of Ascon-CXOF128 ................ ... ... ... ................ ... ... .. 27
197
Figure 9. Mappingbetween state words,bytes,andbits .. ... ... ... ............. ... ... . 31
198
v

 (Initial Public Draft)
November 2024
Figure 10. Representation of the Ascon state as 64-bit unsigned integers, byte se-
199
quences,andbitstrings .... ... ... ... ... ............. ... ... ... ... ............. ... ... ... ... 33
200
vi

 (Initial Public Draft)
November 2024
Acknowledgments
201
The authors of the standard express their gratitude to the Ascon designers — Christoph
202
Dobraunig, Maria Eichlseder, Florian Mendel, and Martin Schläffer — for their valuable
203
comments and suggestions during the drafting process.
204
The authors also acknowledge and appreciate contributions from their colleagues at NIST
205
during the selection process, including Lawrence Bassham, Çağdaş Çalık, Deukjo Hong, and
206
Noah Waller. The authors also thank Elaine Barker, Lily Chen, Andrew Regenscheid, Noah
207
Ross and Sara Kerman, who provided technical and administrative support.
208
vii

 (Initial Public Draft)
November 2024
1. Introduction
209
This draft standard specifies the Ascon family of algorithms to provide Authenticated Encryp-
210
tion with Associated Data (AEAD), a hash function, and two e Xtendable Output Functions
211
(XOFs). The Ascon family is designed to be efficient in constrained environments. The
212
algorithms specified in this standard are as follows:
213
1. Ascon-AEAD128 is a nonce-based authenticated encryption with associated data
214
that provides 128-bit security strength in the single-key setting.
215
2. Ascon-Hash256 is a cryptographic hash function that produces a 256-bit hash of the
216
input messages, offering a security strength of 128 bits.
217
3. Ascon-XOF128 is an XOF, where the output size of the hash of the message can be
218
selected by the user, and the supported security strength is up to 128 bits.
219
4. Ascon-CXOF128 is a customized XOF that allows users to specify a customization
220
string and choose the output size of the message hash. It supports a security strength
221
of up to 128 bits.
222
Development of the Ascon family. Ascon (version v1) [1] was first submitted to the CAESAR
223
(Competition for Authenticated Encryption: Security, Applicability, and Robustness) 1 in
224
2014. The submission included two AEAD algorithms: a primary recommendation, Ascon-
225
128, with a 128-bit key and the secondary recommendation, Ascon-96, with a 96-bit key.
226
Updated versions v1.1 [2] for Round 2 and v1.2 [3] for Round 3 included minor tweaks,
227
such as reordering the round constants, and the secondary recommendation was updated
228
to Ascon-128a. In 2019, Ascon-128 and Ascon-128a were selected as the first choice for
229
the lightweight authenticated encryption use case in the final portfolio of the CAESAR
230
competition.
231
NIST Lightweight Cryptography Standardization Process. In 2015, the National Institute of
232
Standards and Technology (NIST) initiated the lightweight cryptography standardization
233
process to develop cryptographic standards suitable for constrained environments in which
234
conventional cryptographic standards (e.g., AES-GCM [4, 5] and the SHA-2 [6] and the SHA-3
235
[7] hash function families) may be resource-intensive. In February 2023, NIST announced
236
the decision to standardize the Ascon family [8] for lightweight cryptography applications.
237
(For more information, refer to NIST Internal Report (IR) 8268 [9], NIST IR 8369 [10], and
238
NIST IR 8454 [11]).
239
Differences from the Ascon submission v1.2. The technical differences between this draft
240
standard and the Ascon submission [8] are provided below:
241
1CAESAR is a competition organized by a group of international cryptologic researchers to identify a portfolio
of authenticated encryption schemes that offer advantages over AES-GCM and are suitable for widespread
adoption. The final portfolio of the competition was announced in February 2019. For more information,
see https://competitions.cr.yp.to/caesar.html.
1

 (Initial Public Draft)
November 2024
1. Permutations. The Ascon submission defined three Ascon permutations having 6,
242
8, and 12 rounds. This standard specifies additional Ascon permutations by provid-
243
ing round constants for up to 16 rounds to accommodate potential functionality
244
extensions in the future.
245
2. AEAD variants. The Ascon submission package defined AEAD variants ASCON-128,
246
ASCON-128a, and ASCON-80pq. This standard specifies the Ascon-AEAD128 algorithm,
247
which is based on ASCON-128a.
248
3. Hash function variants. The Ascon submission defined ASCON-HASH and ASCON-HASHA.
249
This standard specifies Ascon-Hash256, which is based on ASCON-HASH.
250
4. XOF variants. The Ascon submission defined two extendable output functions, ASCON-
251
XOF and ASCON-XOFA. This standard specifies Ascon-XOF128, which is based on
252
ASCON-XOF, and a new customized XOF, Ascon-CXOF128.
253
5. Initial values. The initial values of the algorithms are updated to support a new
254
format that accommodates potential functionality extensions.
255
6. Endianness. The endianness has been switched from big endian to little endian to
256
improve performance on little-endian microcontrollers.
257
7. Truncation and nonce-masking. The implementation options of Ascon-AEAD128
258
with truncation and nonce-masking have been added.
259
Main Features of Ascon. The main features of the Ascon family are:
260
• Multiple functionalities. The same permutations are used to construct multiple func-
261
tionalities, which allows an implementation of AEAD, hash, and XOF functionalities
262
to share logic and, therefore, have a more compact implementation than functions
263
that were developed independently.
264
• Online and single pass. Ascon-AEAD128 is online, meaning that the 𝑖-th ciphertext
265
block is determined by the key, nonce, associated data, and the first 𝑖 plaintext blocks.
266
Ascon family members require only a single pass over the data.
267
• Inverse-free. Since all of the Ascon family members only use the underlying permuta-
268
tions in the forward direction, implementing the inverse permutations is not needed.
269
This approach significantly reduces implementation costs compared to designs that
270
require inverse operations for decryption.
271
Organization. Section 2 provides preliminaries, including the notation, basic operations, and
272
auxiliary functions. Section 3 specifies the Ascon permutations for up to 16 rounds. Section
273
4 specifies the authenticated encryption scheme Ascon-AEAD128, provides some imple-
274
mentation options for truncation and nonce masking, lists the requirements for validation,
275
and provides security properties. Section 5 specifies the hash function Ascon-Hash256 ,
276
the XOF function Ascon-XOF128, and the customized Ascon-CXOF128 and describes their
277
security properties. Appendix A provides additional notes and conversion functions for
278
2

 (Initial Public Draft)
November 2024
implementations. Appendix B provides additional information regarding the construction
279
of initial values.
280
3

 (Initial Public Draft)
November 2024
2. Preliminaries
281
Table 1 lists the acronyms used in this standard.
282
Table 1. Acronyms
Acronym Definition
AD Associated Data
AE Authenticated Encryption
AEAD Authenticated Encryption with Associated Data
AES Advanced Encryption Standard
CAESAR Competition for Authenticated Encryption: Security, Applicability, and
Robustness
GCM Galois/Counter Mode
NIST National Institute of Standards and Technology
PRF Pseudo-Random Function
SHA Secure Hash Algorithm
SPN Substitution–Permutation Network
SP Special Publication
XOF e Xtendable-Output Function
XOR e Xclusive OR
Table 2 defines the terms used in this standard.
283
Table 2. Terms and definitions
Term Definition
approved An algorithm or technique that is either specified or adopted in a
FIPS publication or NIST Special Publication in the Computer Se-
curity SP 800 series (i.e., FIPS-approved or NIST-recommended).
associated data Input data that is authenticated, but not encrypted.
bit A binary digit, 0 or 1. In this standard bits are indicated in the
Courier New font.
bit string A finite, ordered sequence of bits.
4

 (Initial Public Draft)
November 2024
Table 2. Terms and definitions
Term Definition
capacity The width of the underlying permutation minus the rate.
digest Hash value.
e Xtendable- A function on bit strings in which the output can be extended
Output Function to any desired length.
(XOF)
forgery A (ciphertext, tag) pair produced by an adversary who is not
knowledgeable of the secret key and yet is accepted as valid by
the verified decryption procedure.
hash function A mathematical function that maps a string of arbitrary length
to a fixed-length string.
message Input to the hash function.
nonce An input value to the authenticated encryption algorithm that
is used only once for encryption performed under a given key.
nonce-misuse A setting in which the nonce-uniqueness requirement is unin-
tentionally or accidentally violated.
nonce-respecting A setting that satisfies the nonce-uniqueness requirement.
rate The number of input bits processed or output bits generated
per invocation of the underlying permutation.
secret key A cryptographic key used by a secret-key (i.e., symmetric) cryp-
tographic algorithm and that is not made public.
shall Term used to express a requirement that needs to be fulfilled to
claim conformance to this standard.
tag A cryptographic checksum on data that is designed to reveal
both accidental errors and the intentional modification of the
data whose computation and verification require knowledge of
a secret key.
truncation A process that shortens an input bitstring, preserving only a
sub-string of a specified length.
width The state size of the underlying permutation.
5

 (Initial Public Draft)
November 2024
Table 3 lists the notations used in this standard.
284
Table 3. Notations
| Notation | Definition |
| --------- | ------------------- |
| 𝐾 | 128-bit secret key |
| 𝑁 | 128-bit nonce |
| 𝐴 | Associated data |
𝑖th block of associated data 𝐴
𝐴
𝑖
𝑖th block of plaintext 𝑃
𝑃
𝑖
𝑖th block of ciphertext 𝐶
𝐶
𝑖
| 𝑍 | Customization string |
| --- | ------------------------------------ |
| 𝑍 | 𝑖th block of customization string 𝑍 |
𝑖
| 𝑇 | 128-bit authentication tag |
| --- | ------------------------------ |
| 𝐼𝑉 | 64-bit constant initial value |
fail Error message to indicate that the verification of authenticated cipher-
text failed
Message
𝑀
𝑖
| 𝐻 | Hash value 𝐻 |
| --- | -------------------------- |
| 𝐻 | 𝑖th block of hash value 𝐻 |
𝑖
𝑆 ,…,𝑆 The five 64-bit words of the internal state S, where S =
| ------ | ---------------------------------------------------- | ----------------------- | ------------------------- |
| | 𝑆 ‖ 𝑆 | ‖ … ‖ 𝑆 |
| | 0 1 | 4 |
| 𝑠 | 𝑗th bit of 𝑆 | , 0 ≤ 𝑖 ≤ 4,0 ≤ 𝑗 ≤ 63 |
| (𝑖,𝑗) | | 𝑖 |
| 𝑆 [𝑗] | 𝑗𝑡ℎ byte of state word 𝑆 | | for 0 ≤ 𝑖 ≤ 4, 0 ≤ 𝑗 ≤ 7 |
| 𝜆 | Length of the truncated tag in bits |
| 𝑟 | The rate of an algorithm |
| 𝑐 | The constant value for round 𝑖 of Ascon permutation |
𝑖
𝑝 ,𝑝 ,𝑝 Constant-addition, substitution and linear layers of the round function 𝑝
6

 (Initial Public Draft)
November 2024
Table 4 lists the basic operations and functions used in this standard.
285
Table 4. Basic operations and functions
Functions Definition
{0,1}∗ The set of all finite bit strings, including the empty string
{0,1}𝑠 The set of all bit strings of length 𝑠
0𝑠 When 𝑠 ≥ 0, 0𝑠 is the bit string that consists of 𝑠 consecutive 0s.
When 𝑠 = 0, then 0𝑠 is the empty string.
𝑋| Length of the bitstring 𝑋 in bits
𝑋 ‖𝑌 Concatenation of bitstrings 𝑋 and 𝑌
𝑥 × 𝑦 Multiplication of integers 𝑥 and 𝑦
𝑥 + 𝑦 Addition of integers 𝑥 and 𝑦
𝑥 − 𝑦 Subtraction of integers 𝑥 and 𝑦
𝑥/𝑦 Division of integer 𝑥 and non-zero integer 𝑦
𝑥 mod 𝑦 Remainder in integer division of 𝑥 by 𝑦
⌈𝑥⌉ For a real number 𝑥, the smallest integer greater than or equal
to 𝑥
⌊𝑥⌋ For a real number 𝑥, the largest integer less than or equal to 𝑥
𝑓 ∘𝑔 Composition of functions 𝑓 and 𝑔. E.g., for functions 𝑓(𝑥) and
𝑔(𝑥), 𝑓 ∘𝑔 is evaluate as 𝑓(𝑔(𝑥)).
⊙ Bitwise AND operation
⊕ Bitwise XOR operation
𝑋 ⋙𝑖 Right rotation (circular shift) by 𝑖 bits of 64-bit word 𝑋, where
the least significant bit is the rightmost bit
𝑋 ≪𝑖 Left shift by 𝑖 bits
𝑋 The subset of bitstring 𝑋 beginning at index 𝑖 and ending at
[𝑖∶𝑗]
index 𝑗, inclusive. When 𝑖 > 𝑗, 𝑋 is the empty string. When
[𝑖∶𝑗]
𝑖 = 𝑗, 𝑋 is a single bit.
[𝑖∶𝑗]
𝑥 == 𝑦 Boolean operator to perform equality comparison, i.e., true, if
𝑥 is equal to 𝑦, false otherwise.
7

 (Initial Public Draft)
November 2024
0x Hexadecimal notation
int64(𝑥) 64-bit representation of integer 𝑥.
2.1. Auxiliary Functions
286
Parse function. The parse(𝑋,𝑟) function parses the input bitstring 𝑋 into a sequence
287
of blocks 𝑋 ,𝑋 ,…,𝑋̃ , where ℓ ← ⌊|𝑋|/𝑟⌋ (i.e., 𝑋 ←𝑋 ‖𝑋 ‖…‖ 𝑋̃ ). The 𝑋 blocks
288 0 1 ℓ 0 1 ℓ 𝑖
for 0 ≤ 𝑖 ≤ ℓ−1 each have a bit length 𝑟, whereas the bit length of the final block 𝑋̃ is
289 ℓ
between 0 and 𝑟 − 1 (see Algorithm 1).
290
Algorithm 1 parse(𝑋,𝑟)
Input: bitstring 𝑋, rate 𝑟
Output: bitstrings 𝑋 ,…,𝑋 ,𝑋̃
0 ℓ−1 ℓ
ℓ ← ⌊|𝑋|/𝑟⌋
for 𝑖 = 0 to ℓ−1 do
𝑋 ← 𝑋
𝑖 [𝑖×𝑟∶(𝑖+1)×𝑟−1]
end for
𝑋̃ ← 𝑋
ℓ [ℓ×𝑟∶|𝑋|−1]
return 𝑋 ,…,𝑋 ,𝑋̃
0 ℓ−1 ℓ
Padding rule. The function pad(𝑋,𝑟) appends the bit 1 to the bitstring 𝑋, followed by the
291
bitstring 0𝑗 , where 𝑗 is equal to (−|𝑋| − 1) mod 𝑟. The length of the output bitstring is a
292
multiple of 𝑟 (see Algorithm 2).
293
Algorithm 2 pad(𝑋,𝑟)
Input: bitstring 𝑋, rate 𝑟
Output: padded bitstring 𝑋′
𝑗 ← (−|𝑋| − 1) mod 𝑟
𝑋′ ←𝑋 ∥ 1 ∥ 0𝑗
return 𝑋′
8

 (Initial Public Draft)
November 2024
3. Ascon Permutations
294
This section specifies the 𝑟𝑛𝑑-round 𝐴𝑠𝑐𝑜𝑛-𝑝[𝑟𝑛𝑑] permutations, where 1 ≤ 𝑟𝑛𝑑 ≤ 16.
295
The permutations follow the Substitution-Permutation-Network (SPN) structure and consist
296
of iterations of the round function 𝑝 that is defined as the composition of three steps
297
where 𝑝 is the constant-addition layer (see Sec. 3.2), 𝑝 is the substitution layer (see Sec.
299
| ----------- | ---------------------------------------------- |
| 3.3), and 𝑝 | is the linear diffusion layer (see Sec. 3.4). |
| 300 | 𝐿 |
Note that 𝐴𝑠𝑐𝑜𝑛-𝑝[8] and 𝐴𝑠𝑐𝑜𝑛-𝑝[12] are the main building blocks of the Ascon family,
301
and the permutation instantiated with other numbers of rounds may later be used to
302
standardize other functionalities.
303
3.1. Internal State
304
The permutations operate on the 320-bit state S, which is represented as five 64-bit words
305
| denoted as 𝑆 | for 0 ≤ 𝑖 ≤ 4: |
| ------------ | --------------- | --- | ------ | ----- | ----- | ------ | --- | ---- |
| 306 | 𝑖 |
| | | | S =𝑆 ∥ | 𝑆 ∥ 𝑆 | ∥ 𝑆 | ∥ 𝑆 . | | (2) |
| 307 | | | 0 | 1 | 2 3 | 4 |
Let 𝑠 represents the 𝑗th bit of 𝑆 , 0 ≤ 𝑗 < 64. In this specification of the Ascon permuta-
tion, each state word represents a 64-bit unsigned integer, where the least significant bit is
309
the rightmost bit. Details on other representations of the state can be found in Appendix A.
310
3.2. Constant-Addition Layer 𝑝
311
𝐶
The constant 𝑐 of round 𝑖 of the Ascon permutation 𝐴𝑠𝑐𝑜𝑛-𝑝[𝑟𝑛𝑑] (instantiated with 𝑟𝑛𝑑
rounds), for 𝑟𝑛𝑑 ≤ 16 and 0 ≤ 𝑖 ≤ 𝑟𝑛𝑑−1, is defined as
313
| | | | 𝑐 = const | | | , | | (3) |
| ---- | --- | --- | --------- | -------- | --- | --- | --- | ---- |
| 314 | | | 𝑖 | 16−𝑟𝑛𝑑+𝑖 |
where const ,…,const are defined in Table 5. The constant-addition layer 𝑝 adds a
315
| ----------------------- | --- | ----- | ----------------------- | --- | ------ | --- | --- | ---- |
| 64-bit round constant 𝑐 | | to 𝑆 | in round 𝑖, for 𝑖 ≥ 0, |
| 316 | | 𝑖 2 |
| | | | 𝑆 | = 𝑆 | ⊕ 𝑐 . | | | (4) |
| 317 | | | 2 | 2 | 𝑖 |
9

 (Initial Public Draft)
November 2024
Table 5. The constants const to derive round constants of the Ascon permutations
𝑖
| | 𝑖 | const | 𝑖 | const |
| --- | ---------------------- | ----- | ----------------------- | ----- |
| | 0 0x000000000000003c | | 8 0x00000000000000b4 |
| | 1 0x000000000000002d | | 9 0x00000000000000a5 |
| | 2 0x000000000000001e | | 10 0x0000000000000096 |
| | 3 0x000000000000000f | | 11 0x0000000000000087 |
| | 4 0x00000000000000f0 | | 12 0x0000000000000078 |
| | 0x00000000000000e1 | | 0x0000000000000069 |
| | 6 0x00000000000000d2 | | 14 0x000000000000005a |
| | 7 0x00000000000000c3 | | 15 0x000000000000004b |
Since the first 56 bits of the constants are zero, in practice, this is equivalent to applying
318
the constant to only the least significant eight bits of 𝑆 , as shown in Fig. 1.
𝑆
𝑆 0
1
𝑆
2
𝑆
3
𝑆 4
Figure 1. Constant-Addition Layer 𝑝
𝐶
3.3. Substitution Layer 𝑝
The substitution layer 𝑝 updates the state S with 64 parallel applications of the 5-bit
321
𝑆
substitution box SBOX, as
322
| | (𝑠 ,𝑠 | ,…,𝑠 ) = SBOX(𝑠 | | ,𝑠 ,…,𝑠 | ) | (5) |
| ---- | ----- | --------------- | ----- | ------- | ----- |
| 323 | (0,𝑗) | (1,𝑗) (4,𝑗) | (0,𝑗) | (1,𝑗) | (4,𝑗) |
for 0 ≤ 𝑗 < 64, as shown in Fig. 2.
324
𝑆
0
𝑆
𝑆 1
2
𝑆
3
𝑆
4
Figure 2. Substitution layer 𝑝
𝑆
The 5-bit SBOX has a 5-bit input 𝑥 = (𝑥 ,𝑥 ,…,𝑥 ) and computes the 5-bit output using
the circuit provided in Figure 3. SBOX may also be implemented as a lookup table, as shown
326
in Table 6.
327
10

 (Initial Public Draft)
November 2024
y
x
1
1
1
1
1
1
Figure 3. 5-bit S-box SBOX
3.4. Linear Diffusion Layer 𝑝
328
𝐿
The linear diffusion layer 𝑝 provides diffusion within each 64-bit word 𝑆 , as shown in Fig.
4.
330
𝑆
0
𝑆
1
𝑆
2
𝑆
3
𝑆
4
Figure 4. Linear diffusion layer 𝑝
𝐿
This layer applies the linear functions Σ to their corresponding state words as 𝑆 ← Σ (𝑆 ),
| | | | | | 𝑖 | | | | 𝑖 | 𝑖 𝑖 |
| --------------------------- | --- | --- | --- | --------------- |
| for 0 ≤ 𝑖 ≤ 4, where each Σ | | | | is defined as: |
𝑖
Table 6. Lookup table representation of SBOX
SBOX(𝑥) 4 b 1f 14 1a 15 9 2 1b 5 8 12 1d 3 6 1c
𝑥 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f
SBOX(𝑥) 1e 13 7 e 0 d 11 18 10 c 1 19 16 a f 17
Note that 5-bit inputs are represented in hexadecimal, (e.g., 𝑥 =1 corresponds to (0,0,0,0,1)).
11

 (Initial Public Draft)
November 2024
4. Authenticated Encryption Scheme: Ascon-AEAD128
331
This section specifies the AEAD scheme Ascon-AEAD128, details implementation options
332
(e.g., truncation and nonce masking), lists AEAD requirements, and provides security prop-
333
erties.
334
4.1. Specification of Ascon-AEAD128
335
Ascon-AEAD128 consists of the encryption algorithm Ascon-AEAD128.enc (specified in
336
Sec. 4.1.1) and the decryption algorithm Ascon-AEAD128.dec (specified in Sec. 4.1.2).
337
Ascon-AEAD128.enc takes a 128-bit secret key 𝐾, a 128-bit nonce 𝑁, variable-length
338
associated data 𝐴, and variable-length plaintext 𝑃 as inputs and outputs ciphertext 𝐶
339
(where |𝐶| = |𝑃|) and 128-authentication tag 𝑇 (see Section 4.2.1 for the truncation option):
340
341
Ascon-AEAD128.dec takes key 𝐾, nonce 𝑁, associated data 𝐴, ciphertext 𝐶, and authen-
342
tication tag 𝑇 as inputs and outputs 𝑃 if the tag is valid:
343
| | | | | | 𝑃 | if the tag 𝑇 is valid |
| --- | -------------------------------- | --- | --- | --- | --- | ---------------------- | --- | ---- |
| | Ascon-AEAD128.dec(𝐾,𝑁,𝐴,𝐶,𝑇) = { | | | | | | | (12) |
344
4.1.1. Encryption
345
This section outlines the encryption algorithm of Ascon-AEAD128, which comprises four
346
phases: initialization, associated data processing, plaintext processing, and finalization (see
347
Fig. 5).
348
| | | | | | | Pn Cn |
| --- | --- | --- | --- | --- | ----------- | ----------------------- |
| | | A A | | P C | P n−1 C n−1 | | | T |
| | | 0 m | | 0 0 | | ℓ= | Pn |
⧸
]21[p-nocsA ]8[p-nocsA ]8[p-nocsA ]8[p-nocsA ]8[p-nocsA 128-ℓ ⧸ ]21[p-nocsA ⧸128
1∥0127−ℓ
| | 192 | 192 | | 192 | 192 | 192 | | 128 |
| -------------- | ----- | -------------- | ------ | --- | --------- | --- | ------------ |
| IV∥K∥N | 064∥K | | 0191∥1 | | | | K∥064 | K |
| Initialization | | Associated Data | | | Plaintext | | Finalization |
Figure 5. Ascon-AEAD128 encryption
The pseudocode of Ascon-AEAD128.enc is provided in Algorithm 3.
349
1. Initialization of the state. Given 128-bit 𝐾 and 128-bit 𝑁, the 320-bit internal state
350
S is initialized as
351
352
12

 (Initial Public Draft)
November 2024
Algorithm 3 Ascon-AEAD128.enc(𝐾,𝑁,𝐴,𝑃 )
Input: 128-bit key 𝐾; 128-bit nonce 𝑁; Associated data 𝐴; Plaintext 𝑃
Output: Ciphertext 𝐶; 128-bit tag 𝑇
S ←𝐼𝑉 ‖𝐾‖𝑁
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
S ← S ⊕(0192 ‖𝐾)
̃
| 𝐴 ,…,𝐴 | ,𝐴 | ← parse(𝐴,128) |
| ------ | ------ | --------------- |
| 0 | 𝑚−1 𝑚 |
̃
| 𝐴 | ←pad(𝐴 ,128) |
| --- | ------------- |
for 𝑖 = 0 to 𝑚 do
end for
end if
S ← S ⊕(0319 ‖1)
,𝑃̃
| 𝑃 ,…,𝑃 | ← parse(𝑃,128) | | | ▷ Processing Plaintext |
| ------ | --------------- | --- | --- | ----------------------- |
| 0 | 𝑛−1 𝑛 |
ℓ ← |𝑃̃|
𝑛
for 𝑖 = 0 to 𝑛 − 1 do
𝐶 ← S
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8](S)
end for
| S ← S | ⊕pad(𝑃̃,128) |
| -------- | ------------- |
| [0∶127] | [0∶127] | 𝑛 |
̃
𝐶 ← S
𝑛 [0,ℓ−1]
̃
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S ⊕(0128 ‖𝐾 ‖064)) ▷ Finalization
[192∶319]
return 𝐶,𝑇
13

 (Initial Public Draft)
November 2024
where the initialization value 𝐼𝑉 is assigned to 0x00001000808c0001 (see Ap-
353
pendix B for the details of determining the IV). Next, S is updated using the permuta-
354
tion 𝐴𝑠𝑐𝑜𝑛-𝑝[12] as
355
356
and followed by XORing the secret key 𝐾 into the last 128 bits of internal state:
357
S ← S ⊕(0192 ∥𝐾).
(15)
358
2. Processing associated data. This step has two parts, including absorbing the asso-
359
ciated data (when it is non-empty) and applying the domain separation bit to the
360
state.
361
When associated data 𝐴 is non-empty (i.e., |𝐴| > 0), it is parsed into blocks, as
362
̃
| | 𝐴 , 𝐴 | , …, 𝐴 | | , 𝐴 | ← parse(𝐴,128), | | | (16) |
| ---- | ----- | ------ | --- | --- | ---------------- | --- | --- | ----- |
| 363 | 0 | 1 | 𝑚−1 | 𝑚 |
̃
where 𝑚 = ⌊|𝐴|/128⌋ and |𝐴 | = 128 bits for 0 ≤ 𝑖 ≤ 𝑚−1, and 0 ≤ |𝐴 | < 128,
as explained in Algorithm 1. The last block 𝐴 can be empty. Next, 𝐴 is padded as
| 365 | | | | | 𝑚 | | 𝑚 |
| ---- | --------- | --- | --------- | --- | ---------------- | ---- | --- | ----- |
| | | | ̃ | | ̃ | | 1 ∥ 0127− | 𝐴̃ |
| | 𝐴 ← pad(𝐴 | | ,128) = 𝐴 | | | 𝑚 | | | (17) |
| 366 | 𝑚 | | 𝑚 | | 𝑚 |
so that |𝐴 | = 128, as explained in Algorithm 2.
367 𝑚
Each associated data block 𝐴 (0 ≤ 𝑖 ≤ 𝑚), is absorbed into the first 128 bits of state
368
𝑖
as
369
and the permutation 𝐴𝑠𝑐𝑜𝑛-𝑝[8] is applied to the state as
371
372
The final step of processing associated data is to update the state with a constant
373
374
that provides domain separation. For empty associated data, only the final step
375
described in (20) is applied.
376
3. Processing plaintext. Plaintext 𝑃 (including empty plaintext) is parsed into blocks as
377
| | 𝑃 , 𝑃 | , …, 𝑃 | | ,𝑃̃ | ← parse(𝑃 ,128), | | | (21) |
| ---- | ----- | ------ | --- | --- | ----------------- | --- | --- | ----- |
| 378 | 0 | 1 | 𝑛−1 | 𝑛 |
= 128 for 0 ≤ 𝑖 ≤ 𝑛−1, and |𝑃̃| = ℓ, 0 ≤ ℓ < 128
where 𝑛 = ⌊|𝑃 |/128⌋ and |𝑃
using Algorithm 1. When |𝑃 | mod 128 = 0, the last block 𝑃̃
is empty.
14

 (Initial Public Draft)
November 2024
For each 𝑃 , 0 ≤ 𝑖 ≤ 𝑛−1, the state S is updated as follows:
381
𝑖
382
followed by generating the corresponding ciphertext block 𝐶 as
383 𝑖
and the permutation 𝐴𝑠𝑐𝑜𝑛-𝑝[8] is applied to update the state as:
385
386
For the last block 𝑃̃, the state is updated as
⊕ pad(𝑃̃,128),
and the last ciphertext block 𝐶 ̃ is obtained as
̃ ← S
The ciphertext 𝐶 is constructed by concatenating the ciphertext blocks as
391
̃
4. Finalization and tag generation. During finalization, the key is first loaded to the
393
state S, as
394
395
and the state S is then updated using the permutation 𝐴𝑠𝑐𝑜𝑛-𝑝[12], as
396
397
Finally, the tag 𝑇 is generated by XORing the key with the last 128 bits of the state:
398
The encryption algorithm returns the ciphertext 𝐶 and the tag 𝑇.
400
4.1.2. Decryption
401
This section describes each of the phases for decryption with Ascon-AEAD128.dec. Decryp-
402
tion in Ascon-AEAD128 consists of four phases: initialization, associated data processing,
403
ciphertext processing, and finalization. Decryption in Ascon-AEAD128 is similar to encryp-
404
tion; only the last two phases differ from the encryption mode.
405
The pseudocode of Ascon-AEAD128.dec is provided in Algorithm 4.
406
15

 (Initial Public Draft)
November 2024
Algorithm 4 Ascon-AEAD128.dec(𝐾,𝑁,𝐴,𝐶,𝑇 )
Input: 128-bit key 𝐾; 128-bit nonce 𝑁; Associated data 𝐴; Ciphertext 𝐶; 128-bit tag 𝑇
Output: Plaintext 𝑃 or fail
𝐼𝑉 ← 0x00001000808c0001 ▷ Initialization
S ←𝐼𝑉 ‖𝐾‖𝑁
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
S ← S ⊕(0192 ‖𝐾)
̃
| 𝐴 ,…,𝐴 | ,𝐴 ← parse(𝐴,128) |
| -------- | ------------------ |
| 0 | 𝑚−1 𝑚 |
| 𝐴 ←pad(𝐴 | ̃ ,128) |
for 𝑖 = 0 to 𝑚 do
[0∶127] [0∶127] 𝑖
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8](S)
end for
end if
S ← S ⊕(0319 ‖1)
| 𝐶 ,…,𝐶 | ,𝐶 ̃ ← parse(𝐶,128) | ▷ Processing Ciphertext |
| ------ | -------------------- | ------------------------ |
| 0 | 𝑛−1 𝑛 |
for 𝑖 = 0 to 𝑛 − 1 do
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8](S)
end for
̃
ℓ = |𝐶 |
𝑛
̃
S ← 𝐶
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S ⊕(0128 ‖𝐾 ‖064)) ▷ Finalization
[192∶319]
if 𝑇′ ==𝑇 then
0 𝑛−1 𝑛
return 𝑃
else
return fail
end if
16

 (Initial Public Draft)
November 2024
IV∥K∥N
Figure 6. Ascon-AEAD128 decryption
]21[p-nocsA
A 0
128
⧸
064∥K
Initialization
]8[p-nocsA
A m
192 ⧸
]8[p-nocsA
P C 0 0
128
⧸
1 ⧸ 92 1 ⧸ 92
0191∥1
Associated Data
]8[p-nocsA
P C n−1 n−1
192 ⧸
]8[p-nocsA
Pn Cn
ℓ=
⧸
128 128
⧸ ⧸
128-ℓ ⧸
1∥0127−ℓ
192 ⧸
K∥064
Ciphertext
]21[p-nocsA
T′
⧸128
128 ⧸
K
Finalization
1. Initialization of the state. Given 128-bit 𝐾 and 128-bit 𝑁, the 320-bit internal state
407
S is initialized as
408
S ← 𝐼𝑉 ∥𝐾 ∥𝑁, (31)
409
where the initial value 𝐼𝑉 is assigned to 0x00001000808c0001. Next, S is updated
410
using the permutation 𝐴𝑠𝑐𝑜𝑛-𝑝[12] as
411
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S) (32)
412
and followed by XORing the secret key into the last 128 bits of the state as
413
S ← S ⊕(0192 ∥𝐾). (33)
414
This step is exactly the same as Step 1 of the encryption function in Sec. 4.1.1.
415
2. Processing associated data. This step has two parts, including absorbing the asso-
416
ciated data (when it is non-empty) and applying the domain separation bit to the
417
state.
418
When the associated data 𝐴 is non-empty (i.e., |𝐴| > 0), it is parsed into blocks, as
419
𝐴 , 𝐴 , …, 𝐴 , 𝐴 ̃ ← parse(𝐴,128), (34)
420 0 1 𝑚−1 𝑚
where 𝑚 = ⌊|𝐴|/128⌋ and |𝐴 | = 128 bits for 0 ≤ 𝑖 ≤ 𝑚−1, and 0 ≤ |𝐴 ̃ | < 128,
421 𝑖 𝑚
as explained in Algorithm 1. The last block 𝐴 ̃ can be empty.
422 𝑚
𝐴 ̃ is further processed by padding to a full 𝑟 = 128-bit block using Algorithm 2 as
423 𝑚
424
𝐴
𝑚
← pad(𝐴 ̃
𝑚
,128) = 𝐴 ̃
𝑚
|1 ∥ 0127−|𝐴̃ 𝑚 | . (35)
The associated data blocks 𝐴 ’s (0 ≤ 𝑖 ≤ 𝑚), are absorbed to the state S as follows:
425 𝑖
S ← (S ⊕ 𝐴 ), (36)
426 [0∶127] [0∶127] 𝑖
17

 (Initial Public Draft)
November 2024
and the permutation 𝐴𝑠𝑐𝑜𝑛-𝑝[8] is applied to the state as
427
428
The final step of processing associated data is to update the state to:
429
430
for domain separation. For empty associated data, only the final step described in
431
(38) is applied.
432
This step is exactly the same as Step 2 of the encryption function in Sec. 4.1.1.
433
3. Processing the ciphertext. Ciphertext 𝐶 is parsed into blocks as
434
435
̃
where 𝑛 = ⌊|𝐶|/128⌋, |𝐶 | = 128 for 0 ≤ 𝑖 ≤ 𝑛−1, |𝐶 | = ℓ, 0 ≤ ℓ < 128 using
Algorithm 1. Ciphertext 𝐶 or the last block of ciphertext 𝐶 ̃ can be empty.
437
𝑛
For each 𝐶 , 0 ≤ 𝑖 ≤ 𝑛−1, the following steps are applied:
438 𝑖
440
441
̃
For the last block of the ciphertext 𝐶 (with length ℓ), the following steps are applied:
444
The plaintext 𝑃 is constructed by concatenating the plaintext blocks as
446
4. Finalization. During finalization, the key is loaded to the state S as
448
449
and the state S is then updated using the permutation Ascon-p[12], as
450
451
Finally, the tag is generated by XORing the key with the last 128 bits of the state:
452
453
[192∶319]
As the last step, the computed 𝑇 ′ is compared with the input 𝑇. If the two match,
454
the plaintext 𝑃 is returned. Otherwise, an error message fail is returned.
455
18

 (Initial Public Draft)
November 2024
4.2. Implementation Options
456
4.2.1. Truncation
457
Some applications may truncate the tag 𝑇 to a specific length 𝜆 (≤ |𝑇|). The truncation
458
function outputs the leftmost 𝜆 bits 𝑇 of the tag.
459 [0∶𝜆−1]
The requirements on the tag lengths are provided in Sec. 4.3.
460
461
4.2.2. Nonce Masking
462
This section provides an option to implement Ascon-AEAD128 using a 256-bit key, mainly
463
to maintain the 128-bit security strength of Ascon-AEAD128 in a multi-key setting [12]. In
464
this option, an additional 128-bit key is used to mask the input nonce.
465
Let 𝐾 be the 128-bit key of Ascon-AEAD128 and 𝐾′ be an independently generated addi-
466
tional 128-bit key. Ascon-AEAD128 with nonce masking is processed as follows:
467
E(𝐾 ∥𝐾′,𝑁,𝐴,𝑃) = Ascon-AEAD128.enc(𝐾,𝑁 ⊕𝐾′,𝐴,𝑃), (50)
468
469
D(𝐾∥𝐾′,𝑁,𝐴,𝐶,𝑇) = Ascon-AEAD128.dec(𝐾,𝑁 ⊕𝐾′,𝐴,𝐶,𝑇) (51)
470
Ascon-AEAD128 with nonce masking should only be used when context-commitment
471
security [13] and related-key security are not concerns because the encryption of Ascon-
472
AEAD128 with nonce masking always outputs the same (𝐶, 𝑇) pair for two different input
473
tuples (𝐾 ‖𝐾′,𝑁,𝐴,𝑃 ) and (𝐾 ‖𝐾″,𝑁′,𝐴,𝑃 ), where 𝑁⊕𝐾′ =𝑁′⊕𝐾″ .
474
4.3. AEAD Requirements
475
This section specifies requirements for Ascon-AEAD128.
476
R1. Key generation. The secret key 𝐾 and the nonce-masking key 𝐾′ (if available)
477
shall be generated following the recommendations for cryptographic key generation
478
specified in SP 800-133 [14] and using an approved random bit generator that supports
479
at least a 128-bit security strength. The keys shall not be used for other purposes.
480
R2. Use of unique nonce. Nonce shall be distinct for each encryption operation for a
481
given key to ensure that identical plaintexts encrypted multiple times produce different
482
ciphertext.
483
R3. Minimum length of truncated tag. When an application uses truncated tags, the
484
bit length of the truncated tags shall be at least 64 bits, and the tag length shall be
485
the same across the life-span of the key.
486
19

 (Initial Public Draft)
November 2024
R4. Limit on the maximum number of decryption failures. When the tag bit length
487
is 𝜆, 64 ≤ 𝜆 ≤ 128, the maximum number of decryption failures for a fixed key shall
488
be at most 2𝜆−64.
489
R5. Data limit. The total amount of data processed during encryption and decryption,
490
including the nonce, shall not exceed 254 bytes for a given key.
491
R6. Key update. The key shall be updated to a new one when the total number of input
492
data blocks or the number of decryption failures reach their respective limits or if the
493
nonce uniqueness requirement is violated.
494
4.4. Security Properties
495
This section provides the security properties of Ascon-AEAD128 in various scenarios, in-
496
cluding single-key and multi-key settings, nonce-respecting and nonce-misuse settings, and
497
with or without the truncation option.
498
In the single-key setting, the attacker focuses on a specific key that is shared by one or more
499
users. In contrast, in the multi-key setting with 𝑢 keys, the attacker aims to compromise
500
any of the 𝑢 keys used by the users.
501
The security of the Ascon-AEAD128 mode, in both single-key and multi-key settings, was
502
evaluated in [12, 15–17].
503
4.4.1. Single-Key Setting
504
Ascon-AEAD128 (with no tag truncation) provides a 128-bit security strength in the single-
505
key and nonce-respecting setting, for the confidentiality of the plaintext (except for its
506
length) and the integrity of the tuple (nonce, associated data, ciphertext, tag), where the
507
total number of input bytes is limited to 254 (i.e., 250 blocks).
508
Impact of truncation. When the tag is 𝜆 bits, 64 ≤ 𝜆 ≤ 128, the maximum number of
509
decryption failures for a fixed key is limited to 2𝜆−64 . Therefore, the probability that there
510
is a valid forgery is at most 2−64 . Once a forgery attempt is successful, the confidentiality of
511
the plaintext can be immediately compromised, as the decryption function may reveal some
512
information about the plaintext. Therefore, in the single-key setting, Ascon-AEAD128 with
513
tag length 𝜆 provides (min{128,𝜆})-bit security strengths for confidentiality and integrity
514
in the nonce-respecting setting.
515
4.4.2. Multi-Key Setting
516
When 𝑢 keys are independently selected for an application, Ascon-AEAD128 (with no tag-
517
truncation) provides a (128 − log 𝑢)-bit security strength in the nonce-respecting setting,
518 2
for the confidentiality of the plaintext and the integrity of the tuple of (nonce, associated
519
20

 (Initial Public Draft)
November 2024
data, ciphertext, tag), where the total number of input bytes for all 𝑢 keys is limited to 254
520
(i.e., 250 blocks).
521
When the same nonce is used with 𝑢 keys, an attacker may be able to discover one of the 𝑢
522
keys with a time complexity of 2128−log 𝑢 , thereby compromising both confidentiality and
523 2
integrity.
524
To improve security in a multi-key setting, the nonce masking implementation option (see
525
Sec. 4.2.2) can be used. This option provides 128-bit security (rather than 128 − log (𝑢))
526 2
for confidentiality and integrity.
527
Impact of truncation. When the tag is truncated to 𝜆 bits, 64 ≤ 𝜆 ≤ 128, the maximum
528
number of decryption failures for all 𝑢 keys is limited to 2𝜆−64 . Therefore, the probabil-
529
ity of obtaining a valid forgery is expected to be at most 2−64 . In the multi-key setting,
530
Ascon-AEAD128 with tag-length 𝜆 provides (min{128 − log 𝑢,𝜆})-bit security strengths
531 2
of confidentiality and integrity in the nonce-respecting setting.
532
4.4.3. Nonce-Misuse Setting
533
The plaintext confidentiality of Ascon-AEAD128 is lost when a nonce is repeated with the
534
same secret key. However, Ascon-AEAD128 is designed to provide some level of security in
535
case of certain implementation errors that violate the nonce-respecting requirement.
536
• In the 𝑢-key setting, Ascon-AEAD128 with a 𝜆-bit tag provides (min{128−log (𝑢),𝜆})-
537 2
bit security strengths of confidentiality and integrity when a (nonce, associated data)
538
pair is never repeated for two encryptions with each of 𝑢 keys and the number of
539
nonce repetitions per key for encryption is limited to 28 . In this scenario, the security
540
strengths of Ascon-AEAD128 are summarized in Table 7.
541
• Ascon-AEAD128 with 𝜆-bit tag also provides a (min{128 − log (𝑢),𝜆})-bit integrity
542 2
security strength of the tuple (nonce, associated data, ciphertext, tag) if the number
543
of repetitions of any (nonce, associated data) pair per each of 𝑢 keys for encryption
544
is limited to 28 . In this scenario, the integrity security strength of Ascon-AEAD128
545
with 𝜆-bit tag is summarized in Table 8.
546
Table 7. Security strength of Ascon-AEAD128 with 𝜆-bit tag in the 𝑢-key setting, where (𝑁,
𝐴) pair is unique for encryption.
Security Total number
Security strengths of repetitions of
in bits a nonce
Confidentiality of plaintext min{128 − log (𝑢),𝜆} ≤ 28
2
Integrity of (𝑁,𝐴,𝐶,𝑇) min{128 − log (𝑢),𝜆} ≤ 28
2
21

 (Initial Public Draft)
November 2024
5. Hash and Extendable Output Functions
547
Hash and extendable output functions are built on the 𝐴𝑠𝑐𝑜𝑛-𝑝[12] permutation in a
548
sponge-based mode. This section specifies three functions:
549
• The hash function Ascon-Hash256, which produces a 256-bit digest,
550
• The Ascon-XOF128 function that produces arbitrary length outputs, and
551
• The customized XOF Ascon-CXOF128.
552
5.1. Specification of Ascon-Hash256
553
The mode of operation used by Ascon-Hash256 and Ascon-XOF128 is shown in Fig. 7. This
554
mode comprises three main steps: initialization, absorbing the message, and squeezing the
555
output. Note that 𝐿, the length of the output, and is 256 for Ascon-Hash256 and 𝐿 > 0
556
for Ascon-XOF128.
557
IV∥0256
Figure 7. Structure of Ascon-Hash256 and Ascon-XOF128
558
559
560
561
562
563
564
]21[p-nocsA
0
64
⧸
Initialization
]21[p-nocsA
n−1
256
⧸
]21[p-nocsA
n
256 256
⧸ ⧸
Absorb Message
]21[p-nocsA
H
0
⧸
]21[p-nocsA
H
⌈L/64⌉−1
64
⧸
256 256
⧸
Squeeze Output
Ascon-Hash256 takes a variable length message 𝑀 as input and produces a 256-bit digest.
The full specification of Ascon-Hash256 can be found in Algorithm 5 and operates as
follows:
1. Initialization. The 320-bit internal state of Ascon-Hash256 is initialized with the
concatenation of the 64-bit 𝐼𝑉 = 0x0000080100cc0002 and 256 zeroes, followed
by the 𝐴𝑠𝑐𝑜𝑛-𝑝[12] permutation. That is the initialization step is
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](𝐼𝑉 ∥0256). (52)
Table 8. Integrity security strength of Ascon-AEAD128 with 𝑢 keys in the nonce-misuse
setting
Security strength Total number of repetitions
Security
in bits of any (𝑁, 𝐴) pair
Integrity of (𝑁,𝐴,𝐶,𝑇) min{128 − log (𝑢),𝜆} ≤ 28
2
22

 (Initial Public Draft)
November 2024
2. Absorbing the message. The absorbing phase behaves similarly to the associated
565
data processing of Ascon-AEAD128. The message is partitioned into 64-bit blocks as
566
,𝑀̃
| | | 𝑀 | ,…,𝑀 | | ← parse(𝑀,64). | | | (53) |
| ---- | --- | --- | ---- | --- | --------------- | --- | --- | ----- |
| 567 | | | 0 | 𝑛−1 | 𝑛 |
Partial block 𝑀̃
| | is then padded to a full block 𝑀 |
| ---- | -------------------------------- | --- | --- | -------------- | --- | --- | --- | ----- |
| 568 | 𝑛 | | | | | 𝑛 |
| | | | 𝑀 | ← pad(𝑀̃,64). | | | | (54) |
| 569 | | | 𝑛 | | | 𝑛 |
Each message block 𝑀 is XORed with the state as
For all message blocks except the final block 𝑀 ,the XOR operation is immediately
followed by applying 𝐴𝑠𝑐𝑜𝑛-𝑝[12] to the state.
573
574
3. Squeezing the hash. The squeezing phase begins after 𝑀 is absorbed with an
application of 𝐴𝑠𝑐𝑜𝑛-𝑝[12] to the state.
576
577
The value of S is then taken as hash block 𝐻 , and the state is again updated by
𝐴𝑠𝑐𝑜𝑛-𝑝[12].
579
581
582
Steps (58) and (59) are repeated alternately until hash blocks 𝐻 ,𝐻 , and 𝐻 have
been extracted. The final hash block is then extracted but is not followed by the
584
permutation.
585
The resulting 256-bit digest is the concatenation of hash blocks as
587
23

 (Initial Public Draft)
November 2024
Algorithm 5 Ascon-Hash256(𝑀)
Input: Bitstring 𝑀 ∈ {0,1}∗
Output: Digest 𝐻 ∈ {0,1}256
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](𝐼𝑉 ‖0256)
,𝑀̃
| 𝑀 ,…,𝑀 | ← parse(𝑀,64) | ▷ Absorbing |
| ------ | -------------- | ------------ |
| 0 𝑛−1 | 𝑛 |
𝑀 ← pad(𝑀̃,64)
for 𝑖 = 0 to 𝑛 − 1 do
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
end for
| S ← S | ⊕ 𝑀 |
| ------------------ | --- | ------------ |
| [0∶63] [0∶63] | 𝑛 |
| S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S) | | ▷ Squeezing |
for 𝑖 = 0 to 2 do
𝐻 ← S
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
end for
𝐻 ← S
3 [0∶63]
return 𝐻
24

 (Initial Public Draft)
November 2024
5.2. Specification of Ascon-XOF128
589
Ascon-XOF128 is similar to Ascon-Hash256 but has three main differences:
590
1. Ascon-XOF128 accepts an additional input, 𝐿 > 0, that specifies the desired output
591
length in bits.
592
2. The number of blocks that are squeezed is equal to ⌈𝐿/64⌉.
593
3. The initial value differs in one bit.
594
The 128 in the name Ascon-XOF128 refers to the target security strength, not the output
595
size.
596
Ascon-XOF128 is specified by Algorithm 6 and is described as follows:
597
1. Initialization. The 320-bit internal state of Ascon-XOF128 is initialized with the
598
concatenation of the 64-bit 𝐼𝑉 = 0x0000080000cc0003 and 256 zeroes, followed
599
by the 𝐴𝑠𝑐𝑜𝑛-𝑝[12] permutation:
600
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](𝐼𝑉 ∥0256). (62)
601
2. Absorbing the message. The absorbing phase behaves similar to the associated data
602
processing of AEAD. The message is partitioned into 64-bit blocks as:
603
𝑀 ,…,𝑀 ,𝑀̃ ← parse(𝑀,64). (63)
604 0 𝑛−1 𝑛
Partial block 𝑀̃ is then padded to a full block 𝑀 as
605 𝑛 𝑛
𝑀 ← pad(𝑀̃,64). (64)
606 𝑛 𝑛
Each message block 𝑀 is absorbed by XORing the block into the state as
607 𝑖
S ← S ⊕ 𝑀 . (65)
608 [0∶63] [0∶63] 𝑖
For all message blocks except the final block, the XOR operation is immediately
609
followed by an application of 𝐴𝑠𝑐𝑜𝑛-𝑝[12] to the state.
610
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S) (66)
611
3. Squeezing the outputs. To obtain the requested 𝐿 output bits, ℎ = ⌈𝐿/64⌉ blocks
612
must be extracted from the state. The squeezing phase begins with an application of
613
𝐴𝑠𝑐𝑜𝑛-𝑝[12] to the state.
614
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S) (67)
615
25

 (Initial Public Draft)
November 2024
The value of S is then taken as output block 𝐻 , and the state is again updated
616
[0∶63] 𝑖
by 𝐴𝑠𝑐𝑜𝑛-𝑝[12].
617
𝐻 ← S (68)
618 𝑖 [0∶63]
619
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S) (69)
620
Steps (68) and (69) are repeated alternately until output blocks 𝐻 have
,…,𝐻
been squeezed. The final block is then squeezed without an additional permutation.
622
𝐻 ← S (70)
623 ℎ [0∶63]
Finally, the output blocks are concatenated, and the first 𝐿 bits are returned as output
624
𝐻.
625
𝐻′ ←𝐻 ∥…∥𝐻 (71)
626 0 ℎ
627
𝐻 ←𝐻′ (72)
628
[0∶𝐿−1]
Algorithm 6 Ascon-XOF128(𝑀, 𝐿)
Input: Bitstring 𝑀 ∈ {0,1}∗ ; Output length 𝐿 > 0
Output: Digest 𝐻 ∈ {0,1}𝐿
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](𝐼𝑉 ‖0256)
| 𝑀 ,…,𝑀 | ,𝑀̃ ← parse(𝑀,64) | ▷ Absorbing |
| ------ | ------------------ | ------------ |
| 0 | 𝑛−1 𝑛 |
← pad(𝑀̃,64)
𝑀
for 𝑖 = 0 to 𝑛 − 1 do
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
end for
| S ← S | ⊕ 𝑀 |
| ------------------ | ---------- | ------------ |
| [0∶63] | [0∶63] 𝑛 |
| S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S) | | ▷ Squeezing |
ℎ ← ⌈𝐿/64⌉ − 1
for 𝑖 = 0 to ℎ−1 do
𝐻 ← S
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
end for
𝐻 ← S
0 ℎ
𝐻 ←𝐻′
[0∶𝐿−1]
return 𝐻
26

 (Initial Public Draft)
November 2024
IV∥0256
Figure 8. Structure of Ascon-CXOF128
629
630
631
632
633
634
635
636
637
638
639
640
641
642
643
644
645
646
647
]21[p-nocsA
Z 0
64
⧸
Initialization
]21[p-nocsA
Z m−1
256
⧸
]21[p-nocsA
Z m
256 256
⧸ ⧸
Customization
]21[p-nocsA
M 0
]21[p-nocsA
M n−1
256
⧸
]21[p-nocsA
M n
256 256
⧸ ⧸
Absorb Message
]21[p-nocsA
H 0
⧸
]21[p-nocsA
H ⌈L/64⌉−1
64
⧸
256 256
⧸
Squeeze Output
5.3. Specification of Ascon-CXOF128
This section specifies the customized version of Ascon-XOF128 called Ascon-CXOF128.
Customization extends the functionality of Ascon-XOF128 by allowing users to incorporate
a customization string into the computation. For the same input message, two instances
of a customized XOF using different customization strings will produce distinct outputs.
Ascon-CXOF128 is a customized XOF that differs from Ascon-XOF128 in the following ways:
• For domain separation, Ascon-CXOF128 uses a different IV than Ascon-XOF128. The
IV for Ascon-CXOF128 is 0x0000080000cc0004.
• In addition to the message, Ascon-CXOF128 takes the customization string 𝑍 as input.
The length of the customization string shall be at most 2048 bits (i.e., 256 bytes).
• The customization string 𝑍 is prepended to the message blocks as
𝑍 ∥𝑍 ∥…∥𝑍 ∥𝑀 ∥…∥𝑀 ∥𝑀 , (73)
0 1 𝑚 0 𝑛−1 𝑛
where 𝑍 is a 64-bit integer that represents the bit-length of the customization string,
0
and 𝑍 ,…,𝑍 are 64-bit blocks generated by parsing and padding 𝑍.
1 𝑚
The general structure for Ascon-CXOF128 is shown in Fig. 8 and the full specification is
given by Algorithm 7.
5.4. Security Strengths
The security strengths of Ascon-Hash256, Ascon-XOF128, and Ascon-CXOF128 are sum-
marized in Table 9.
27

 (Initial Public Draft)
November 2024
Algorithm 7 Ascon-CXOF128(𝑀, 𝐿, 𝑍)
Input: Bitstring 𝑀 ∈{0,1}∗ ; Output length 𝐿 >0; customization string 𝑍 ∈ {0,1}∗, where
𝑍| ≤ 2048
Output: Digest 𝐻 ∈ {0,1}𝐿
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](𝐼𝑉 ‖0256)
0
,𝑍̃
| 𝑍 …,𝑍 | ← parse(𝑍,64) |
| -------- | -------------- |
| 1 𝑚−1 𝑚 |
← pad(𝑍̃,64)
𝑍
for 𝑖 = 0 to 𝑚 do
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
end for
,𝑀̃
| 𝑀 ,…,𝑀 | ← parse(𝑀,64) | ▷ Absorbing message |
| ------ | -------------- | -------------------- |
| 0 𝑛−1 | 𝑛 |
← pad(𝑀̃,64)
𝑀
for 𝑖 = 0 to 𝑛 − 1 do
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
end for
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S) ▷ Squeezing
ℎ ← ⌈𝐿/64⌉ − 1
for 𝑖 = 0 to ℎ−1 do
𝐻 ← S
S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
end for
𝐻 ← S
ℎ [0∶63]
𝐻′ ←𝐻 ‖…‖𝐻
0 ℎ
𝐻 ←𝐻′
[0∶𝐿−1]
return 𝐻
28

 (Initial Public Draft)
November 2024
Table 9. Security strengths of Ascon-Hash256, Ascon-XOF128, and Ascon-CXOF128
algorithms
Output size Security strengths in bits
Function
in bits Collision Preimage 2nd Preimage
Ascon-Hash256 256 128 128 128
Ascon-XOF128 𝐿 min(𝐿/2,128) min(𝐿,128) min(𝐿,128)
Ascon-CXOF128 𝐿 min(𝐿/2,128) min(𝐿,128) min(𝐿,128)
References
648
[1] Dobraunig C, Eichlseder M, Mendel F, Schläffer M (2014) Ascon v1, Submission to
649
Round 1 of the CAESAR competition. Available at https://competitions.cr.yp.to/roun
650
d1/asconv1.pdf.
651
[2] Dobraunig C, Eichlseder M, Mendel F, Schläffer M (2015) Ascon v1.1, Submission to
652
Round 2 of the CAESAR competition. Available at https://competitions.cr.yp.to/roun
653
d2/asconv11.pdf.
654
[3] Dobraunig C, Eichlseder M, Mendel F, Schläffer M (2016) Ascon v1.2, Submission to
655
Round 3 of the CAESAR competition. Available at https://competitions.cr.yp.to/roun
656
d3/asconv12.pdf.
657
[4] National Institute of Standards and Technology (2001) Advanced Encryption Standard
658
(AES) (U.S. Department of Commerce), Report. DOI:10.6028/NIST.FIPS.197-upd1
659
[5] Dworkin MJ (2007) Recommendation for Block Cipher Modes of Operation: Ga-
660
lois/Counter Mode (GCM) and GMAC (National Institute of Standards and Technology),
661
Report. DOI:10.6028/NIST.SP.800-38D
662
[6] National Institute of Standards and Technology (2015) Secure Hash Standard (SHS)
663
(U.S. Department of Commerce), Report. DOI:10.6028/NIST.FIPS.180-4
664
[7] National Institute of Standards and Technology (2015) SHA-3 Standard: Permutation-
665
Based Hash and Extendable-Output Functions (U.S. Department of Commerce), Report.
666
DOI:10.6028/NIST.FIPS.202
667
[8] Dobraunig C, Eichlseder M, Mendel F, Schläffer M (2021) Ascon v1.2, Submission
668
to Final Round of the NIST Lightweight Cryptography project. Available at https:
669
//csrc.nist.gov/CSRC/media/Projects/lightweight-cryptography/documents/finalist-r
670
ound/updated-spec-doc/ascon-spec-final.pdf.
671
[9] Sönmez Turan M, Mc Kay KA, Çalık Ç, Chang D, Bassham I Lawrence E (2019) Status Re-
672
port on the First Round of the NIST Lightweight Cryptography Standardization Process
673
(National Institute of Standards and Technology), Report. DOI:10.6028/NIST.IR.8268
674
[10] Sönmez Turan M, Mc Kay KA, Chang D, Çalık Ç, Bassham I Lawrence E, Kang J, Kelsey
675
J (2021) Status Report on the Second Round of the NIST Lightweight Cryptography
676
Standardization Process (National Institute of Standards and Technology), Report.
677
DOI:10.6028/NIST.IR.8369
678
29

 (Initial Public Draft)
November 2024
[11] Sönmez Turan M, Mc Kay KA, Chang D, Bassham L, Kang J, Waller N, Kelsey J, Hong
679
D (2023) Status Report on the Final Round of the NIST Lightweight Cryptography
680
Standardization Process (National Institute of Standards and Technology), Report.
681
DOI:10.6028/NIST.IR.8454
682
[12] Dobraunig C, Mennink B (2024) Generalized initialization of the duplex construction.
683
Applied Cryptography and Network Security -22nd International Conference, ACNS
684
2024, Abu Dhabi, United Arab Emirates, March 5-8, 2024, Proceedings, Part II, eds
685
Pöpper C, Batina L (Springer), Lecture Notes in Computer Science, Vol. 14584, pp
686
460–484. DOI:10.1007/978-3-031-54773-7_18
687
[13] Bellare M, Hoang VT (2022) Efficient schemes for committing authenticated encryption.
688
Advances in Cryptology -EUROCRYPT 2022 -41st Annual International Conference on
689
the Theory and Applications of Cryptographic Techniques, Trondheim, Norway, May
690
30 -June 3, 2022, Proceedings, Part II, eds Dunkelman O, Dziembowski S (Springer),
691
Lecture Notes in Computer Science, Vol. 13276, pp 845–875. DOI:10.1007/978-3-031-
692
07085-3_29
693
[14] Barker E, Roginsky A, Davis R (2020) Recommendation for cryptographic key generation,
694
(National Institute of Standards and Technology, Gaithersburg, MD), NIST Special
695
Publication (SP) 800-133 Rev. 2. DOI:10.6028/NIST.SP.800-133r2.
696
[15] Chakraborty B, Dhar C, Nandi M (2023) Exact security analysis of ASCON. Advances
697
in Cryptology -ASIACRYPT 2023 -29th International Conference on the Theory and
698
Application of Cryptology and Information Security, Guangzhou, China, December 4-8,
699
2023, Proceedings, Part III, eds Guo J, Steinfeld R (Springer), Lecture Notes in Computer
700
Science, Vol. 14440, pp 346–369. DOI:10.1007/978-981-99-8727-6_12
701
[16] Lefevre C, Mennink B (2023) Generic Security of the Ascon Mode: On the Power of
702
Key Blinding, Cryptology e Print Archive, Paper 2023/796. Available at https://ia.cr/20
703
23/796.
704
[17] Chakraborty B, Dhar C, Nandi M (2024) Tight multi-user security of ascon and its large
705
key extension. Information Security and Privacy -29th Australasian Conference, ACISP
706
2024, Sydney, NSW, Australia, July 15-17, 2024, Proceedings, Part I, eds Zhu T, Li Y
707
(Springer), Lecture Notes in Computer Science, Vol. 14895, pp 57–76. DOI:10.1007/978-
708
981-97-5025-2_4
709
30

 (Initial Public Draft)
November 2024
Appendix A. Implementation Notes
710
This specification follows the little-endian ordering convention. That is, on little-endian
711
machines, byte strings or words of any size can be loaded from memory directly into the
712
Ascon state without the need to perform any conversion. Neither bytes nor bits need to be
713
reversed. The hexadecimal forms of the padding for Ascon functions are described in Sec.
714
A.2.
715
However, the convention for printing the Ascon state using 64-bit integer words in hex-
716
adecimal notation (most significant byte and bit first) is different from printing the Ascon
717
state using byte sequences or bitstrings (least significant byte and bit first). The conversion
718
functions between printing byte sequences and printing integers are specified in Sec. A.1.
719
The least significant bit of 𝑆 is 𝑠 (or S ) and the most significant bit of 𝑆 is 𝑠
(or S ). Similarly, the least significant byte of 𝑆 is the first byte of state (S ) and
the most significant byte of 𝑆 is the last byte of the state (S ). This relationship
between state words, bytes, and state bits is shown in Fig. 9, where 𝑆 [𝑗] denotes the 𝑗𝑡ℎ
| 723 | | | | | | | | | | 𝑖 |
| ---- | -------------------- | --- | ----------------------------- |
| | byte of state word 𝑆 | | for 0 ≤ 𝑖 ≤ 4 and 0 ≤ 𝑗 ≤ 7. |
| 724 | | | 𝑖 |
…
𝑆 [0] 𝑆 [1] 𝑆 [2] 𝑆 [3] 𝑆 [4] 𝑆 [5] 𝑆 [6] 𝑆 [7] 𝑆 [0] 𝑆 [1] 𝑆 [2] 𝑆 [3] 𝑆 [4] 𝑆 [5] 𝑆 [6] 𝑆 [7]
Figure 9. Mapping between state words, bytes, and bits
A.1. Conversion Functions
725
When printing values as integers using hexadecimal notation, the most significant byte and
726
most significant bit are shown first.
727
Integers and byte sequences. Printing the integer representation of a byte sequence
728
requires the byte order to be reversed. That is, the first element in the sequence of bytes is
729
the least significant byte of the integer, while the last element in the sequence of bytes is
730
the most significant byte of the integer.
731
Integers and bitstrings. Printing a bitstring as an integer requires the byte order to be
732
reversed, and additionally, bits within a byte to be reversed. That is, the first element of a
733
bitstring is the least significant bit of the integer (or byte), while the last element of the
734
bitstring is the least significant bit of the integer (or byte).
735
31

 (Initial Public Draft)
November 2024
Table 10. Address for each byte of Ascon state word 𝑆 in memory on little-endian and
𝑖
big-endian machines, where the word 𝑆 begins at memory address 𝑎.
𝑖
Word Little-endian Big-endian
byte address address
𝑆 [0] 𝑎 + 0 𝑎 + 7
𝑖
𝑆 [1] 𝑎 + 1 𝑎 + 6
𝑖
𝑆 [2] 𝑎 + 2 𝑎 + 5
𝑖
𝑆 [3] 𝑎 + 3 𝑎 + 4
𝑖
𝑆 [4] 𝑎 + 4 𝑎 + 3
𝑖
𝑆 [5] 𝑎 + 5 𝑎 + 2
𝑖
𝑆 [6] 𝑎 + 6 𝑎 + 1
𝑖
𝑆 [7] 𝑎 + 7 𝑎 + 0
𝑖
Loading 64-bit integer words from a byte sequence. When loading the state from a
736
sequence of bytes stored in memory, the first eight bytes are mapped to the first 64-bit
737
unsigned integer word 𝑆 in little-endian notation (i.e., without byte reversal on little-endian
738 0
machines). The next eight bytes are loaded to 𝑆 . Bytes continue to be loaded in the same
739 1
way until the final eight bytes of the stored state are loaded into 𝑆 .
740 4
An example of the mapping between memory addresses to state word bytes is presented in
741
Table 10 for both little-endian and big-endian machines. An example of mappings between
742
64-bit unsigned integers, byte sequences, and bitstrings is shown in Fig. 10. Note that
743
64-bit integers and bitstrings only appear to be reversed in the visual representation.
744
Writing 64-bit integer words to a byte sequence. The process for writing the 64-bit unsigned
745
integer Ascon state words to a byte sequence in memory is simply the reverse of loading
746
a state word from a byte sequence. The byte order does not need to be reversed on
747
little-endian machines.
748
A.2. Implementing with Integers
749
This section provides additional information for software implementations that employ
750
64-bit unsigned integers.
751
Padding. The padding rule described in Algorithm 2 appends a one followed by one or
752
more zeroes to data. For an integer 𝑥 that can be represented with 𝑛 < 8 bytes, an integer
753
𝑦 representing a padded version of 𝑥 is computed as:
754
𝑦 ←𝑥⊕(0x0000000000000001 ≪ 8𝑛)
755
Domain Separation Bit. The hexadecimal integer form of the domain separation bit is
0x8000000000000000. Therefore, the addition of this bit into the state may be imple-
32

 (Initial Public Draft)
November 2024
| State | State | | Word value (64-bit unsigned integers) |
| ---------- | ------ | --- | -------------------------------------- | ------------------- |
| bits | word |
| S | 𝑆 | | | 0x0706050403020100 |
| [0∶63] | 0 |
| S | 𝑆 | | | 0x0F0E0D0C0B0A0908 |
| [64∶127] | 1 |
| S | 𝑆 | | | 0x1716151413121110 |
| [128∶191] | 2 |
| S | 𝑆 | | | 0x1F1E1D1C1B1A1918 |
| [192∶255] | 3 |
| S | 𝑆 | | | 0x2726252423222120 |
| [256∶319] | 4 |
↕
| State | State | | | Word value (byte sequence) |
| ---------- | ------ | ----- | ----- | --------------------------- | ----- | ----- | ----- | ----- | ----- |
| bits | word |
| S | 𝑆 | 0x00 | 0x01 | 0x02 | 0x03 | 0x04 | 0x05 | 0x06 | 0x07 |
| [0∶63] | 0 |
| S | 𝑆 | 0x08 | 0x09 | 0x0A | 0x0B | 0x0C | 0x0D | 0x0E | 0x0F |
| [64∶127] | 1 |
| S | 𝑆 | 0x10 | 0x11 | 0x12 | 0x13 | 0x14 | 0x15 | 0x16 | 0x17 |
| [128∶191] | 2 |
| S | 𝑆 | 0x18 | 0x19 | 0x1A | 0x1B | 0x1C | 0x1D | 0x1E | 0x1F |
| [192∶255] | 3 |
| S | 𝑆 | 0x20 | 0x21 | 0x22 | 0x23 | 0x24 | 0x25 | 0x26 | 0x27 |
| [256∶319] | 4 |
↕
| State | State | | | Word value (bitstring) |
| ---------- | ------ | ----- | --------- | ----------------------- | ----- | ----- | ----- | ----- | ----- |
| bits | word |
| S | 𝑆 | 0000 | 0000 | 1000 | 0000 | 0100 | 0000 | 1100 | 0000 |
| [0∶63] | 0 |
| | | 0010 | 0000 | 1010 | 0000 | 0110 | 0000 | 1110 | 0000 |
| S | 𝑆 | 0001 | 0000 | 1001 | 0000 | 0101 | 0000 | 1101 | 0000 |
| [64∶127] | 1 |
| | | 0011 | 0000 | 1011 | 0000 | 0111 | 0000 | 1111 | 0000 |
| S | 𝑆 | 0000 | 1000 | 1000 | 1000 | 0100 | 1000 | 1100 | 1000 |
| [128∶191] | 2 |
| | | 0010 | 1000 | 1010 | 1000 | 0110 | 1000 | 1110 | 1000 |
| S | 𝑆 | 0001 | 1000 | 1001 | 1000 | 0101 | 1000 | 1101 | 1000 |
| [192∶255] | 3 |
| | | 0011 | 10001011 | | 1000 | 0111 | 1000 | 1111 | 1000 |
| S | 𝑆 | 0000 | 0100 | 1000 | 0100 | 0100 | 0100 | 1100 | 0100 |
| [256∶319] | 4 |
| | | 0010 | 0100 | 1010 | 0100 | 0110 | 0100 | 1110 | 0100 |
Figure 10. Representation of the Ascon state as 64-bit unsigned integers, byte sequences,
and bitstrings, where 64-bit unsigned integers are used to define the permutation, data
stored in memory is represented as byte sequences, and bitstrings are used to specify the
modes of operation. Note that 64-bit integers and bitstrings only appear to be reversed in
the visual representation.
33

 (Initial Public Draft)
November 2024
Table 11. Examples of padding an unsigned integer 𝑥 to a 64-bit block, where 𝑥 encodes a
sequence of bytes each having value 0xFF in little-endian byte order.
Length of 𝑥 # Padding Unsigned integer 𝑥 Padded 64-bit block
| (in bytes) | Bytes |
| ----------- | ---------------------- | ------------------- |
| 0 | 8 0x0000000000000000 | 0x0000000000000001 |
| 1 | 7 0x00000000000000FF | 0x00000000000001FF |
| 2 | 6 0x000000000000FFFF | 0x000000000001FFFF |
| 3 | 5 0x0000000000FFFFFF | 0x0000000001FFFFFF |
| 4 | 4 0x00000000FFFFFFFF | 0x00000001FFFFFFFF |
| 5 | 3 0x000000FFFFFFFFFF | 0x000001FFFFFFFFFF |
| 6 | 2 0x0000FFFFFFFFFFFF | 0x0001FFFFFFFFFFFF |
| 7 | 1 0x00FFFFFFFFFFFFFF | 0x01FFFFFFFFFFFFFF |
mented as:
𝑆 ←𝑆 ⊕ 0x8000000000000000.
4 4
64-bit Block Absorption. In Ascon-Hash256, Ascon-XOF128, or Ascon-CXOF128, the
absorption of a 64-bit message block expressed as the byte sequence 0x00, 0x01, 0x02,
0x03, 0x04, 0x05, 0x06, 0x07 can be implemented as:
𝑆 ←𝑆 ⊕ 0x0706050403020100,
0 0
128-bit Block Absorption. Absorbing a 128-bit associated data or plaintext block repre-
sented by byte sequence 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F can similarly be implemented as:
𝑆 ←𝑆 ⊕ 0x0706050403020100
0 0
𝑆 ←𝑆 ⊕ 0x0F0E0D0C0B0A0908
1 1
Key Addition. Ascon-AEAD128 has keyed initialization and finalization, where the key is
added to the state in various locations. For a key represented as a sequence of bytes
having value 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,
0x0C, 0x0D, 0x0E, 0x0F, the key addition at the beginning of the initialization phase may
be written as:
𝑆 ←𝑆 ⊕ 0x0706050403020100
1 1
𝑆 ←𝑆 ⊕ 0x0F0E0D0C0B0A0908,
2 2
the key addition at the end of the initialization phase may be written as:
𝑆 ←𝑆 ⊕ 0x0706050403020100
3 3
𝑆 ←𝑆 ⊕ 0x0F0E0D0C0B0A0908,
4 4
34

 (Initial Public Draft)
November 2024
the key addition at the beginning of the finalization phase can be expressed as:
𝑆 ←𝑆 ⊕ 0x0706050403020100
2 2
𝑆 ←𝑆 ⊕ 0x0F0E0D0C0B0A0908,
3 3
and the key addition at the end of finalization can be implemented as:
𝑆 ←𝑆 ⊕ 0x0706050403020100
3 3
𝑆 ←𝑆 ⊕ 0x0F0E0D0C0B0A0908.
4 4
35

 (Initial Public Draft)
November 2024
Appendix B. Determination of the Initial Values
756
Each variant of the Ascon family has a 64-bit initial value constructed as
757
𝐼𝑉 =𝑣∥08 ∥𝑎∥𝑏 ∥𝑡∥𝑟/8∥016 , (74)
758
where
759
• 𝑣 is a unique identifier for the algorithm (represented in 8 bits).
760
• 𝑎 is the number of rounds during initialization and finalization (represented in 4 bits).
761
• 𝑏 is the number of rounds during the processing of AD, plaintext and ciphertext for
762
AEAD, and the number of rounds during processing the message for hash, XOF and
763
CXOF (represented in 4 bits).
764
• 𝑡 is 128 for Ascon-AEAD128, 256 for Ascon-Hash256 and is 0 for Ascon-XOF128
765
and Ascon-CXOF128 (represented in 16 bits).
766
• 𝑟/8 is the number of input bytes processed per invocation of the underlying permu-
767
tation (represented in 8 bits).
768
The values of these parameters for each variant are given in Table 12, and initial values for
769
each Ascon variant are specified in Table 13.
770
Table 12. Parameters for initial value construction
𝑣 𝑎 𝑏 𝑡 𝑟/8
Ascon variants
(8 bits) (4 bits) (4 bits) (16 bits) (8 bits)
Ascon-AEAD128 1 12 8 128 16
Ascon-Hash256 2 12 12 256 8
Ascon-XOF128 3 12 12 0 8
Ascon-CXOF128 4 12 12 0 8
Table 13. Initial values as hexadecimal integers
Ascon variants Initial value
Ascon-AEAD128 0x00001000808c0001
Ascon-Hash256 0x0000080100cc0002
Ascon-XOF128 0x0000080000cc0003
Ascon-CXOF128 0x0000080000cc0004
36