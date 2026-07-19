# GCM Elements (SP 800-38D §5)

来源: NIST SP 800-38D — GCM and GMAC

5.1 Block Cipher
The operations of GCM depend on the choice of an underlying symmetric key block cipher and
thus can be considered a mode of operation (mode, for short) of the block cipher. The GCM key
is the block cipher key (the key, for short).
For any given key, the underlying block cipher of the mode consists of two functions that are
inverses of each other. The choice of the block cipher includes the designation of one of the two
functions of the block cipher as the forward cipher function, as in the specification of the AES
algorithm in Ref. [2]. GCM does not employ the inverse cipher function.
The forward cipher function is a permutation on bit strings of a fixed length; the strings are
called blocks. The length of a block is called the block size. The key is denoted K, and the
resulting forward cipher function of the block cipher is denoted CIPH .
K
The underlying block cipher shall be approved, the block size shall be 128 bits, and the key size
shall be at least 128 bits. The key shall be generated uniformly at random, or close to uniformly
at random, i.e., so that each possible key is (nearly) equally likely to be generated.
Consequently, the key will be fresh, i.e., unequal to any previous key, with high probability. The
key shall be secret and shall be used exclusively for GCM with the chosen block cipher.
Additional requirements on the establishment and management of keys are discussed in Sec. 8.1.
5.2 Two GCM Functions
The two functions that comprise GCM are called authenticated encryption and authenticated
decryption. The authenticated encryption function encrypts the confidential data and computes
an authentication tag on both the confidential data and any additional, non-confidential data. The
authenticated decryption function decrypts the confidential data, contingent on the verification of
the tag.
An implementation may restrict the input to the non-confidential data, i.e., without any
confidential data. The resulting variant of GCM is called GMAC. For GMAC, the authenticated
encryption and decryption functions become the functions for generating and verifying an
authentication tag on the non-confidential data.
The requirements and notation for the input and output data of these functions are discussed in
Secs. 5.2.1 and 5.2.2. Algorithms for computing these functions are given in Sec. 7.
7

NIST Special Publication 800-38D
5.2.1 Authenticated Encryption Function
5.2.1.1 Input Data
Given the selection of an approved block cipher and key, there are three input strings to the
authenticated encryption function:
• a plaintext, denoted P;
• additional authenticated data (AAD), denoted A; and
• an initialization vector (IV), denoted IV.
The plaintext and the AAD are the two categories of data that GCM protects. GCM protects the
authenticity of the plaintext and the AAD; GCM also protects the confidentiality of the plaintext,
while the AAD is left in the clear. For example, within a network protocol, the AAD might
include addresses, ports, sequence numbers, protocol version numbers, and other fields that
indicate how the plaintext should be treated.
The IV is essentially a nonce, i.e, a value that is unique within the specified context, which
determines an invocation of the authenticated encryption function on the input data to be
protected. The uniqueness requirement on the IVs (and keys) is stated precisely in Sec. 8, and
two frameworks for constructing IVs are given in Sec. 8.2. Practical considerations in assuring
the requirement are discussed in Secs. 9.1 and 9.2. The critical importance of the uniqueness of
the IVs is detailed in Ref. [5] and summarized in Appendix A.
The bit lengths of the input strings to the authenticated encryption function shall meet the
following requirements:
• len(P) ≤ 239-256;
• len(A) ≤ 264-1;
• 1 ≤ len(IV) ≤ 264-1.
Although GCM is defined on bit strings, the bit lengths of the plaintext, the AAD, and the IV
shall all be multiples of 8, so that these values are byte strings.
An implementation may further restrict the bit lengths of these inputs, consistent with the above
requirements; for example, an implementation may establish smaller maximum values. The bit
lengths that an implementation allows are called the supported bit lengths. A single set of
supported bit lengths for each of the three inputs should be established for the entire
implementation, independent of the key.
For IVs, it is recommended that implementations restrict support to the length of 96 bits, to
promote interoperability, efficiency, and simplicity of design.
5.2.1.2 Output Data
The following two bit strings comprise the output data of the authenticated encryption function:
8

NIST Special Publication 800-38D
• A ciphertext, denoted C, whose bit length is the same as that of the plaintext.
• An authentication tag, or tag, for short, denoted T.
The bit length of the tag, denoted t, is a security parameter, as discussed in Appendix B. In
general, t may be any one of the following five values: 128, 120, 112, 104, or 96. For certain
applications, t may be 64 or 32; guidance for the use of these two tag lengths, including
requirements on the length of the input data and the lifetime of the key in these cases, is given in
Appendix C.
An implementation shall not support values for t that are different from the seven choices in the
preceding paragraph. An implementation may restrict its support to as few as one of these
values. A single, fixed value for t from among the supported choices shall be associated with
each key.
5.2.2 Authenticated Decryption Function
Given the selection of an approved block cipher, key, and an associated tag length, the inputs to
the authenticated decryption function are values for IV, A, C, and T, as described in Sec. 5.2.1
above. The output is one of the following:
• the plaintext P that corresponds to the ciphertext C, or
• a special error code, denoted FAIL in this document.
The output P indicates that T is the correct authentication tag for IV, A, and C; otherwise, the
output is FAIL. The authentication assurance that can be inferred in each case is discussed in
Appendix B.
The values for len(C), len (A), and len(IV) that an implementation supports for the authenticated
decryption function shall be the same as the values for len(P), len (A), and len(IV) that the
implementation supports for the authenticated encryption function.
5.3 Primitives for Confidentiality and Authentication
The mechanism for the confidentiality of the plaintext within GCM is a variation of the Counter
mode [10], with a particular incrementing function, denoted inc , for generating the necessary
32
sequence of counter blocks. The first counter block for the plaintext encryption is generated by
incrementing a block that is generated from the IV.
The authentication mechanism within GCM is based on a hash function, called GHASH1, that
features multiplication by a fixed parameter, called the hash subkey, within a binary Galois field.
1 The designers of GCM define GHASH somewhat differently, appending encodings of the lengths of its two
arguments. In this Recommendation, these encodings are incorporated instead into the definitions of the
authenticated encryption/decryption functions. The specifications of the authenticated encryption/decryption
functions are ultimately equivalent, but the simplified version of GHASH in this Recommendation does not obtain
all of the properties that are shown for the designers' definition of GHASH in Ref. [7].
9

NIST Special Publication 800-38D
The hash subkey, denoted H, is generated by applying the block cipher to the “zero” block. The
resulting instance of this hash function, denoted GHASH , is used to compress an encoding of
H
the AAD and the ciphertext into a single block, which is then encrypted to produce the
authentication tag.
GHASH is a keyed hash function but not, on its own, a cryptographic hash function. This
Recommendation only approves GHASH for use within the context of GCM.
The intermediate values in the execution of the GCM functions shall be secret. In particular, this
requirement precludes a system in which GCM is implemented using the hash subkey publicly
for some other purpose, for example, as an unpredictable value or as an integrity check value on
the key.
6 Mathematical Components of GCM
This section presents the mathematical components that appear in the specifications of the
authenticated encryption and authenticated decryption functions in Sec. 7 below. Examples of
the basic operations and functions on bit strings are given in Sec. 6.1. The incrementing function
is defined in Sec. 6.2. Algorithm 1 for “multiplying” blocks is defined in Sec. 6.3. Algorithm 2
for the GHASH function that is constructed from this multiplication is defined in Sec 6.4.
Algorithm 3 for the GCTR function is defined in Sec. 6.5.
The specifications of Algorithms 1-3 include the inputs, the outputs, the steps of the algorithm,
diagrams, and summaries. Equivalent sets of steps that produce the correct output are permitted.
The inputs that are typically fixed across many invocations of the function are called the
prerequisites, although they may also be regarded as (varying) inputs.

