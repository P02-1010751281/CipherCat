# CFB — Cipher Feedback Mode (SP 800-38A §6.3)

来源: NIST SP 800-38A

来源: NIST SP 800-38A



The Cipher Feedback (CFB) mode is a confidentiality mode that features the feedback of
successive ciphertext segments into the input blocks of the forward cipher to generate output
blocks that are exclusive-ORed with the plaintext to produce the ciphertext, and vice versa. The
CFB mode requires an IV as the initial input block. The IV need not be secret, but it must be
unpredictable; the generation of such IVs is discussed in Appendix C.

The CFB mode also requires an integer parameter, denoted s, such that 1 ≤ s ≤ b. In the
                                                                  #                            #
specification of the CFB mode below, each plaintext segment (P j) and ciphertext segment (C j)
consists of s bits. The value of s is sometimes incorporated into the name of the mode, e.g., the
1-bit CFB mode, the 8-bit CFB mode, the 64-bit CFB mode, or the 128-bit CFB mode.

The CFB mode is defined as follows:

       CFB Encryption:                I1 = IV;
                                                            #
                                      Ij = LSBb-s(Ij –1) | C j -1   for j = 2 … n;
                                      Oj = CIPHK(Ij)                for j = 1, 2 … n;
                                         #   #
                                      C j = P j ⊕ MSBs(Oj)          for j = 1, 2 … n.

       CFB Decryption:                I1 = IV;
                                                            #
                                      Ij = LSBb-s(Ij -1 )| C j -1   for j = 2 … n;



                                                   11
                                                              Oj = CIPHK(Ij)                                            for j = 1, 2 … n;
                                                               #     #
                                                              P j = C j ⊕ MSBs(Oj)                                      for j = 1, 2 … n.

In CFB encryption, the first input block is the IV, and the forward cipher operation is applied to
the IV to produce the first output block. The first ciphertext segment is produced by exclusive-
ORing the first plaintext segment with the s most significant bits of the first output block. (The
remaining b-s bits of the first output block are discarded.) The b-s least significant bits of the IV
are then concatenated with the s bits of the first ciphertext segment to form the second input
block. An alternative description of the formation of the second input block is that the bits of
the first input block circularly shift s positions to the left, and then the ciphertext segment
replaces the s least significant bits of the result.

The process is repeated with the successive input blocks until a ciphertext segment is produced
from every plaintext segment. In general, each successive input block is enciphered to produce
an output block. The s most significant bits of each output block are exclusive-ORed with the
corresponding plaintext segment to form a ciphertext segment. Each ciphertext segment (except
the last one) is “fed back” into the previous input block, as described above, to form a new input
block. The feedback can be described in terms of the individual bits in the strings as follows: if
                                                                                         th
i1i2…ib is the jth input block, and c1c2…cs is the jth ciphertext segment, then the (j+1) input block
is is+1is+2…ib c1c2…cs.


                                   INITIALIZATION
                                       VECTOR



                                                                            INPUT BLOCK 2                                    INPUT BLOCK n
                                   INPUT BLOCK 1
                                                                            (b-s) Bits s Bits                                (b-s) Bits s Bits




           ENCRYPT
                                      CIPHK                                    CIPHK                                            CIPHK
                                   OUTPUT BLOCK 1                           OUTPUT BLOCK 2                                   OUTPUT BLOCK n
                                   Select Discard                           Select Discard                                   Select Discard
                                   s Bits (b-s) Bits                        s Bits (b-s) Bits                                s Bits (b-s) Bits


                     PLAINTEXT 1
                        s Bits         ⊕
                                                              PLAINTEXT 2
                                                                 s Bits        ⊕                               PLAINTEXT n
                                                                                                                  s Bits        ⊕

                               CIPHERTEXT 1                             CIPHERTEXT 2                                     CIPHERTEXT n
                                   s Bits                                   s Bits                                           s Bits




                                                 INITIALIZATION
                                                     VECTOR


                                                                                           INPUT BLOCK 2                                    INPUT BLOCK n
                                                 INPUT BLOCK 1
                                                                                           (b-s) Bits s Bits                                (b-s) Bits s Bits

                                                    CIPHK                                       CIPHK                                            CIPHK

           DECRYPT
                                                OUTPUT BLOCK 1                            OUTPUT BLOCK 2                                   OUTPUT BLOCK n
                                                Select Discard                            Select Discard                                   Select Discard
                                                s Bits (b-s) Bits                         s Bits (b-s) Bits                                s Bits (b-s) Bits


                               CIPHERTEXT 1
                                   s Bits              ⊕                CIPHERTEXT 2
                                                                            s Bits
                                                                                                ⊕                        CIPHERTEXT n
                                                                                                                             s Bits              ⊕

                                               PLAINTEXT 1                               PLAINTEXT 2                                      PLAINTEXT n
                                                  s Bits                                    s Bits                                           s Bits




                                                             Figure 3: The CFB Mode

In CFB decryption, the IV is the first input block, and each successive input block is formed as in
CFB encryption, by concatenating the b-s least significant bits of the previous input block with


                                                                               12
the s most significant bits of the previous ciphertext. The forward cipher function is applied to
each input block to produce the output blocks. The s most significant bits of the output blocks
are exclusive-ORed with the corresponding ciphertext segments to recover the plaintext
segments.

In CFB encryption, like CBC encryption, the input block to each forward cipher function (except
the first) depends on the result of the previous forward cipher function; therefore, multiple
forward cipher operations cannot be performed in parallel. In CFB decryption, the required
forward cipher operations can be performed in parallel if the input blocks are first constructed (in
series) from the IV and the ciphertext.

The CFB mode is illustrated in Figure 3.

6.4   The Output Feedback Mode