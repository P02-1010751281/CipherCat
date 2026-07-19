# CBC — Cipher Block Chaining Mode (SP 800-38A §6.2)

来源: NIST SP 800-38A



The Cipher Block Chaining (CBC) mode is a confidentiality mode whose encryption process
features the combining (“chaining”) of the plaintext blocks with the previous ciphertext blocks.
The CBC mode requires an IV to combine with the first plaintext block. The IV need not be
secret, but it must be unpredictable; the generation of such IVs is discussed in Appendix C.
Also, the integrity of the IV should be protected, as discussed in Appendix D. The CBC mode is
defined as follows:

       CBC Encryption:                     C1 = CIPHK(P1 ⊕ IV);
                                           Cj = CIPHK(Pj ⊕ Cj-1)             for j = 2 … n.
                                                        -1
       CBC Decryption:                     P1 = CIPH K(C1) ⊕ IV;
                                           Pj = CIPH K(Cj) ⊕ Cj-1
                                                    -1
                                                                             for j = 2 … n.


                     INITIALIZATION   PLAINTEXT 1        PLAINTEXT 2          PLAINTEXT n
                        VECTOR
                                            ⊕                     ⊕                ⊕


           ENCRYPT
                                       INPUT BLOCK 1         INPUT BLOCK 2    INPUT BLOCK n

                                         CIPHK                 CIPHK            CIPHK
                                      OUTPUT BLOCK 1    OUTPUT BLOCK 2       OUTPUT BLOCK n



                                      CIPHERTEXT 1       CIPHERTEXT 2        CIPHERTEXT n




                                      CIPHERTEXT 1       CIPHERTEXT 2         CIPHERTEXT n




           DECRYPT
                                      INPUT BLOCK 1          INPUT BLOCK 2    INPUT BLOCK n

                                        CIPH-1K                CIPH-1   K      CIPH-1K
                                      OUTPUT BLOCK 1    OUTPUT BLOCK 2       OUTPUT BLOCK n


                                            ⊕                     ⊕                ⊕
                     INITIALIZATION
                         VECTOR        PLAINTEXT 1           PLAINTEXT 2      PLAINTEXT n




                                         Figure 2: The CBC Mode


In CBC encryption, the first input block is formed by exclusive-ORing the first block of the
plaintext with the IV. The forward cipher function is applied to the first input block, and the



                                                       10
resulting output block is the first block of the ciphertext. This output block is also exclusive-
ORed with the second plaintext data block to produce the second input block, and the forward
cipher function is applied to produce the second output block. This output block, which is the
second ciphertext block, is exclusive-ORed with the next plaintext block to form the next input
block. Each successive plaintext block is exclusive-ORed with the previous output/ciphertext
block to produce the new input block. The forward cipher function is applied to each input block
to produce the ciphertext block.

In CBC decryption, the inverse cipher function is applied to the first ciphertext block, and the
resulting output block is exclusive-ORed with the initialization vector to recover the first
plaintext block. The inverse cipher function is also applied to the second ciphertext block, and
the resulting output block is exclusive-ORed with the first ciphertext block to recover the second
plaintext block. In general, to recover any plaintext block (except the first), the inverse cipher
function is applied to the corresponding ciphertext block, and the resulting block is exclusive-
ORed with the previous ciphertext block.

In CBC encryption, the input block to each forward cipher operation (except the first) depends on
the result of the previous forward cipher operation, so the forward cipher operations cannot be
performed in parallel. In CBC decryption, however, the input blocks for the inverse cipher
function, i.e., the ciphertext blocks, are immediately available, so that multiple inverse cipher
operations can be performed in parallel.

The CBC mode is illustrated in Figure 2.

6.3   The Cipher Feedback Mode
