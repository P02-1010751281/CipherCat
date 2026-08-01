# Modes — 6.5 The Counter Mode

来源: NIST SP 800-38A

6.5 The Counter Mode
The Counter (CTR) mode is a confidentiality mode that features the application of the forward
cipher to a set of input blocks, called counters, to produce a sequence of output blocks that are
exclusive-ORed with the plaintext to produce the ciphertext, and vice versa. The sequence of
counters must have the property that each block in the sequence is different from every other
block. This condition is not restricted to a single message: across all of the messages that are
encrypted under the given key, all of the counters must be distinct. In this recommendation, the
counters for a given message are denoted T , T , … , T . Methods for generating counters are
1 2 n
discussed in Appendix B. Given a sequence of counters, T , T , … , T , the CTR mode is
1 2 n
defined as follows:
CTR Encryption: O = CIPH (T) for j = 1, 2 … n;
j K j
C = P ⊕ O for j = 1, 2 … n-1;
j j j
C* = P* ⊕ MSB(O).
n n u n
CTR Decryption: O = CIPH (T) for j = 1, 2 … n;
j K j
P = C ⊕ O for j = 1, 2 … n-1;
j j j
P* = C* ⊕ MSB(O).
n n u n
In CTR encryption, the forward cipher function is invoked on each counter block, and the
resulting output blocks are exclusive-ORed with the corresponding plaintext blocks to produce
the ciphertext blocks. For the last block, which may be a partial block of u bits, the most
significant u bits of the last output block are used for the exclusive-OR operation; the remaining
b-u bits of the last output block are discarded.
In CTR decryption, the forward cipher function is invoked on each counter block, and the
resulting output blocks are exclusive-ORed with the corresponding ciphertext blocks to recover
the plaintext blocks. For the last block, which may be a partial block of u bits, the most
significant u bits of the last output block are used for the exclusive-OR operation; the remaining
b-u bits of the last output block are discarded.
In both CTR encryption and CTR decryption, the forward cipher functions can be performed in
parallel; similarly, the plaintext block that corresponds to any particular ciphertext block can be
recovered independently from the other plaintext blocks if the corresponding counter block can
be determined. Moreover, the forward cipher functions can be applied to the counters prior to the
availability of the plaintext or ciphertext data.
15

| --- | ------------ | --------------- | --------------- | ------------ | --------------- | --------------- | -------- | ------------ | --------------- | --------------- |
|  |  | COUNTER 1 |  |  | COUNTER 2 |  |  |  | COUNTER n |
|  |  | INPUT BLOCK 1 |  |  | INPUT BLOCK 2 |  |  |  | INPUT BLOCK n |
|  | TPYRCNE |  |  |  |  |  | .  .  . | .  . |
|  |  | CIPH |  |  | CIPH |  |  |  | CIPH |
|  |  | OUTPUT BLOCK 1 |  |  | OUTPUT BLOCK 2 |  |  |  | OUTPUT BLOCK n |
|  | PLAINTEXT 1 |  |  | PLAINTEXT 2 |  |  |  | PLAINTEXT n |
|  |  | CIPHERTEXT 1 |  |  | CIPHERTEXT 2 |  |  |  | CIPHERTEXT n |
|  |  |  |  | COUNTER 1 |  | COUNTER 2 |  |  |  | COUNTER n |
|  |  |  | INPUT BLOCK 1 |  |  | INPUT BLOCK 2 |  |  |  | INPUT BLOCK n |
|  | TPYRCED |  |  | CIPH |  | CIPH |  | .  . | .     .  . |
|  |  |  |  | K |  |  | K |  |  | CIPH K |
|  |  |  | OUTPUT BLOCK 1 |  |  | OUTPUT BLOCK 2 |  |  |  | OUTPUT BLOCK n |
|  |  | CIPHERTEXT 1 |  | ⊕ | CIPHERTEXT 2 |  | ⊕ |  | CIPHERTEXT n | ⊕ |
|  |  |  |  | PLAINTEXT 1 |  | PLAINTEXT 2 |  |  |  | PLAINTEXT n |

Figure 5: The CTR Mode

The CTR mode is illustrated in Figure 5.
16

Appendix A: Padding
For the ECB, CBC, and CFB modes, the plaintext must be a sequence of one or more complete
data blocks (or, for CFB mode, data segments). In other words, for these three modes, the total
number of bits in the plaintext must be a positive multiple of the block (or segment) size.
If the data string to be encrypted does not initially satisfy this property, then the formatting of the
plaintext must entail an increase in the number of bits. A common way to achieve the necessary
increase is to append some extra bits, called padding, to the trailing end of the data string as the
last step in the formatting of the plaintext. An example of a padding method is to append a
single ‘1’ bit to the data string and then to pad the resulting string by as few ‘0’ bits, possibly
none, as are necessary to complete the final block (segment). Other methods may be used; in
general, the formatting of the plaintext is outside the scope of this recommendation.
For the above padding method, the padding bits can be removed unambiguously, provided the
receiver can determine that the message is indeed padded. One way to ensure that the receiver
does not mistakenly remove bits from an unpadded message is to require the sender to pad every
message, including messages in which the final block (segment) is already complete. For such
messages, an entire block (segment) of padding is appended. Alternatively, such messages can
be sent without padding if, for every message, the existence of padding can be reliably inferred,
e.g., from a message length indicator.
17

Appendix B: Generation of Counter Blocks
The specification of the CTR mode requires a unique counter block for each plaintext block that
is ever encrypted under a given key, across all messages. If, contrary to this requirement, a
counter block is used repeatedly, then the confidentiality of all of the plaintext blocks
corresponding to that counter block may be compromised. In particular, if any plaintext block
that is encrypted using a given counter block is known, then the output of the forward cipher
function can be determined easily from the associated ciphertext block. This output allows any
other plaintext blocks that are encrypted using the same counter block to be easily recovered
from their associated ciphertext blocks.
There are two aspects to satisfying the uniqueness requirement. First, an incrementing function
for generating the counter blocks from any initial counter block can ensure that counter blocks do
not repeat within a given message. Second, the initial counter blocks, T , must be chosen to
1
ensure that counters are unique across all messages that are encrypted under the given key.
B.1 The Standard Incrementing Function
In general, given the initial counter block for a message, the successive counter blocks are
derived by applying an incrementing function. As in the above specifications of the modes, n is
the number of blocks in the given plaintext message, and b is the number of bits in the block.
The standard incrementing function can apply either to an entire block or to a part of a block.
Let m be the number of bits in the specific part of the block to be incremented; thus, m is a
positive integer such that m ≤ b. Any string of m bits can be regarded as the binary representation
of a non-negative integer x that is strictly less than 2m. The standard incrementing function takes
[x] and returns [x+1 mod 2m] .
m m
For example, let the standard incrementing function apply to the five least significant bits of
eight bit blocks, so that b=8 and m=5 (unrealistically small values); let * represent each unknown
bit in this example, and let ***11110 represent a block to be incremented. The following
sequence of blocks results from four applications of the standard incrementing function:
* * * 1 1 1 1 0
* * * 1 1 1 1 1
* * * 0 0 0 0 0
* * * 0 0 0 0 1
* * * 0 0 0 1 0.
Counter blocks in which a given set of m bits are incremented by the standard incrementing
function satisfy the uniqueness requirement within the given message provided that n ≤ 2m.
Whether the uniqueness requirement for counter blocks is satisfied across all messages that are
encrypted under a given key then depends on the choices of the initial counter blocks for the
messages, as discussed in the next section.
18

This recommendation permits the use of any other incrementing function that generates n unique
strings of m bits in succession from the allowable initial strings. For example, if the initial string
of m bits is not the “zero” string, i.e., if it contains at least one ‘1’ bit, then an incrementing
function can be constructed from a linear feedback shift register that is specialized to ensure a
sufficiently large period; see Ref. [5] for information about linear feedback shift registers.
B.2 Choosing Initial Counter Blocks
The initial counter blocks, T , for each message that is encrypted under the given key must be
1
chosen in a manner than ensures the uniqueness of all the counter blocks across all the messages.
Two examples of approaches to choosing the initial counter blocks are given in this section.
In the first approach, for a given key, all plaintext messages are encrypted sequentially. Within
the messages, the same fixed set of m bits of the counter block is incremented by the standard
incrementing function. The initial counter block for the initial plaintext message may be any
string of b bits. The initial counter block for any subsequent message can be obtained by
applying the standard incrementing function to the fixed set of m bits of the final counter block
of the previous message. In effect, all of the plaintext messages that are ever encrypted under the
given key are concatenated into a single message; consequently, the total number of plaintext
blocks must not exceed 2m. Procedures should be established to ensure the maintenance of the
state of the final counter block of the latest encrypted message, and to ensure the proper
sequencing of the messages.
A second approach to satisfying the uniqueness property across messages is to assign to each
message a unique string of b/2 bits (rounding up, if b is odd), in other words, a message nonce,
and to incorporate the message nonce into every counter block for the message. The leading b/2
bits (rounding up, if b is odd) of each counter block would be the message nonce, and the
standard incrementing function would be applied to the remaining m bits to provide an index to
the counter blocks for the message. Thus, if N is the message nonce for a given message, then
the jth counter block is given by T = N | [j] , for j = 1…n. The number of blocks, n, in any
j m
message must satisfy n < 2m. A procedure should be established to ensure the uniqueness of the
message nonces.
This recommendation allows other methods and approaches for achieving the uniqueness
property. Validation that an implementation of the CTR mode conforms to this recommendation
will typically include an examination of the procedures for assuring the uniqueness of counter
blocks within messages and across all messages that are encrypted under a given key.
19

Appendix C: Generation of Initialization Vectors
The CBC, CFB, and OFB modes require an initialization vector as input, in addition to the
plaintext. An IV must be generated for each execution of the encryption operation, and the same
IV is necessary for the corresponding execution of the decryption operation. Therefore, the IV, or
information that is sufficient to calculate the IV, must be available to each party to the
communication.
The IV need not be secret, so the IV, or information sufficient to determine the IV, may be
transmitted with the ciphertext.
For the CBC and CFB modes, the IVs must be unpredictable. In particular, for any given
plaintext, it must not be possible to predict the IV that will be associated to the plaintext in
advance of the generation of the IV.
There are two recommended methods for generating unpredictable IVs. The first method is to
apply the forward cipher function, under the same key that is used for the encryption of the
plaintext, to a nonce. The nonce must be a data block that is unique to each execution of the
encryption operation. For example, the nonce may be a counter, as described in Appendix B, or
a message number. The second method is to generate a random data block using a FIPS-
approved random number generator.
For the OFB mode, the IV need not be unpredictable, but it must be a nonce that is unique to
each execution of the encryption operation. For example, the nonce may be a counter, as
described in Appendix B, or a message number.
If, contrary to this requirement, the same IV is used for the OFB encryption of more than one
message, then the confidentiality of those messages may be compromised. In particular, if a
plaintext block of any of these messages is known, say, the jth plaintext block, then the jth output
of the forward cipher function can be determined easily from the jth ciphertext block of the
message. This information allows the jth plaintext block of any other message that is encrypted
using the same IV to be easily recovered from the jth ciphertext block of that message.
Confidentiality may similarly be compromised if any of the input blocks to the forward cipher
function for the OFB encryption of a message is designated as the IV for the encryption of
another message under the given key. One consequence of this observation is that IVs for the
OFB mode should not be generated by invoking the block cipher on another IV.
Validation that an implementation of the CBC, CFB, or OFB mode conforms to this
recommendation will typically include an examination of the procedures for assuring the
unpredictability or uniqueness of the IV.
20

Appendix D: Error Properties
A bit error is the substitution of a ‘0’ bit for a ‘1’ bit, or vice versa. This appendix contains a
discussion of the effects of bit errors in ciphertext blocks (or segments), counter blocks, and IVs
on the modes in this recommendation. Insertion or deletion of bits into ciphertext blocks (or
segments) is also discussed.
For any confidentiality mode, if there are any bit errors in a single ciphertext block (or segment),
then the decryption of that ciphertext block (or segment) will be incorrect, i.e., it will differ from
the original plaintext block (or segment). In the CFB, OFB, and CTR modes, the bit error(s) in
the decrypted ciphertext block (or segment) occur in the same bit position(s) as in the ciphertext
block (or segment); the other bit positions are not affected. In the ECB and CBC modes, a bit
error may occur, independently, in any bit position of the decrypted ciphertext block, with an
expected error rate of fifty percent, depending on the strength of the underlying block cipher.
For the ECB, OFB, and CTR modes, bit errors within a ciphertext block do not affect the
decryption of any other blocks. In the CBC mode, any bit positions that contain bit errors in a
ciphertext block will also contain bit errors in the decryption of the succeeding ciphertext block;
the other bit positions are not affected. In the CFB mode, bit errors in a ciphertext segment affect
the decryption of the next b/s (rounded up to the nearest integer) ciphertext segments. A bit error
may occur, independently, in any bit position in these decrypted segments, with an expected
error rate of fifty percent.
Similarly, for the CTR mode, if there is a bit error in a counter block, then a bit error may occur,
independently, in any bit position of the decryption of the corresponding ciphertext, with an
expected error rate of fifty percent.
Bit errors in IVs also affect the decryption process. In the OFB mode, bit errors in the IV affect
the decryption of every ciphertext block. In the CFB mode, bit errors in the IV affect, at a
minimum, the decryption of the first ciphertext segment, and possibly successive ciphertext
segments, depending on the bit position of the rightmost bit error in the IV. (In general, a bit
error in the ith most significant bit position affects the decryptions of the first i/s (rounding up)
ciphertext segments.) For both the OFB and CFB modes, a bit error may occur, independently,
in any bit position of the affected ciphertext blocks (or segments), with an expected error rate of
fifty percent. In the CBC mode, if bit errors occur in the IV, then the first ciphertext block will
be decrypted incorrectly, and bit errors will occur in exactly the same bit positions as in the IV;
the decryptions of the other ciphertext blocks are not affected.
Consequently, for the CBC mode, the decryption of the first ciphertext block is vulnerable to the
(deliberate) introduction of bit errors in specific bit positions of the IV if the integrity of the IV is
not protected. Similarly, for the OFB and CTR modes, the decryption of any ciphertext block is
vulnerable to the introduction of specific bit errors into that ciphertext block if its integrity is not
protected. The same property also holds for the ciphertext segments in the CFB mode; however,
for every ciphertext segment except the last one, the existence of such bit errors may be detected
by their randomizing effect on the decryption of the succeeding ciphertext segment.
21

Table D.1 summarizes the effects of bit errors in a ciphertext block or IV on the decryption of the
ciphertext for each of the five confidentiality modes.
Table D.1e five confidentiality modes.
Table D.2: Summary of Effect of Bit Errors on Decryption
Mode Effect of Bit Errors in C Effect of Bit Errors in the IV
j
ECB RBE in the decryption of C Not applicable
j
RBE in the decryption of C
CBC j SBE in the decryption of C
SBE in the decryption of C 1
j+1
SBE in the decryption of C RBE in the decryption of C, C, …, C
CFB j 1 2 j
RBE in the decryption of C ,…,C for some j between 1 and b/s
j+1 j+b/s
