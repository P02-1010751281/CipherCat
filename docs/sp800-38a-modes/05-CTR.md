# CTR — Counter Mode (SP 800-38A §6.5)

来源: NIST SP 800-38A



The Counter (CTR) mode is a confidentiality mode that features the application of the forward
cipher to a set of input blocks, called counters, to produce a sequence of output blocks that are
exclusive-ORed with the plaintext to produce the ciphertext, and vice versa. The sequence of
counters must have the property that each block in the sequence is different from every other
block. This condition is not restricted to a single message: across all of the messages that are
encrypted under the given key, all of the counters must be distinct. In this recommendation, the
counters for a given message are denoted T1, T2, … , Tn. Methods for generating counters are
discussed in Appendix B. Given a sequence of counters, T1 , T2 , … , Tn, the CTR mode is
defined as follows:

       CTR Encryption:                Oj = CIPHK(Tj)                for j = 1, 2 … n;
                                      Cj = Pj ⊕ Oj                  for j = 1, 2 … n-1;
                                       *      *
                                      C n = P n ⊕ MSBu(On).

       CTR Decryption:                Oj = CIPHK(Tj)                for j = 1, 2 … n;
                                      Pj = Cj ⊕ Oj                  for j = 1, 2 … n-1;
                                       *      *
                                      P n = C n ⊕ MSBu(On).

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
                                     COUNTER 1                           COUNTER 2                                   COUNTER n




                                   INPUT BLOCK 1                       INPUT BLOCK 2                                INPUT BLOCK n

                                                                                             . . . . .
           ENCRYPT
                                     CIPHK                                CIPHK                                       CIPHK
                                   OUTPUT BLOCK 1                      OUTPUT BLOCK 2                              OUTPUT BLOCK n



                     PLAINTEXT 1        ⊕                PLAINTEXT 2        ⊕                        PLAINTEXT n         ⊕


                                   CIPHERTEXT 1                        CIPHERTEXT 2                                 CIPHERTEXT n




                                                   COUNTER 1                           COUNTER 2                                    COUNTER n



                                                 INPUT BLOCK 1                       INPUT BLOCK 2                               INPUT BLOCK n


                                                    CIPHK                               CIPHK         . . . . .                     CIPHK

           DECRYPT
                                              OUTPUT BLOCK 1                      OUTPUT BLOCK 2                              OUTPUT BLOCK n




                                    CIPHERTEXT 1       ⊕                CIPHERTEXT 2       ⊕                        CIPHERTEXT n        ⊕

                                                   PLAINTEXT 1                         PLAINTEXT 2                                  PLAINTEXT n




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
not repeat within a given message. Second, the initial counter blocks, T1, must be chosen to
ensure that counters are unique across all messages that are encrypted under the given key.

B.1    The Standard Incrementing Function

In general, given the initial counter block for a message, the successive counter blocks are
derived by applying an incrementing function. As in the above specifications of the modes, n is
the number of blocks in the given plaintext message, and b is the number of bits in the block.

The standard incrementing function can apply either to an entire block or to a part of a block.
Let m be the number of bits in the specific part of the block to be incremented; thus, m is a
positive integer such that m ≤ b. Any string of m bits can be regarded as the binary representation
                                                        m
of a non-negative integer x that is strictly less than 2 . The standard incrementing function takes
                            m
[x]m and returns [x+1 mod 2 ]m.

For example, let the standard incrementing function apply to the five least significant bits of
eight bit blocks, so that b=8 and m=5 (unrealistically small values); let * represent each unknown
bit in this example, and let ***11110 represent a block to be incremented. The following
sequence of blocks results from four applications of the standard incrementing function:

               ***11110
               ***11111
               ***00000
               ***00001
               * * * 0 0 0 1 0.

Counter blocks in which a given set of m bits are incremented by the standard incrementing
                                                                                             m
function satisfy the uniqueness requirement within the given message provided that n ≤ 2 .
Whether the uniqueness requirement for counter blocks is satisfied across all messages that are
encrypted under a given key then depends on the choices of the initial counter blocks for the
messages, as discussed in the next section.




                                                18
This recommendation permits the use of any other incrementing function that generates n unique
strings of m bits in succession from the allowable initial strings. For example, if the initial string
of m bits is not the “zero” string, i.e., if it contains at least one ‘1’ bit, then an incrementing
function can be constructed from a linear feedback shift register that is specialized to ensure a
sufficiently large period; see Ref. [5] for information about linear feedback shift registers.

B.2    Choosing Initial Counter Blocks

The initial counter blocks, T1, for each message that is encrypted under the given key must be
chosen in a manner than ensures the uniqueness of all the counter blocks across all the messages.
Two examples of approaches to choosing the initial counter blocks are given in this section.

In the first approach, for a given key, all plaintext messages are encrypted sequentially. Within
the messages, the same fixed set of m bits of the counter block is incremented by the standard
