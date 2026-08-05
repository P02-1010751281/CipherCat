# Modes — 6.1  The Electronic Codebook Mode

来源: NIST SP 800-38A

6.1  The Electronic Codebook Mode

The Electronic Codebook (ECB) mode is a confidentiality mode that features, for a given key,
the assignment of a fixed ciphertext block to each plaintext block, analogous to the assignment of
code words in a codebook. The Electronic Codebook (ECB) mode is defined as follows:

j K j

| ECB Encryption:  C = CIPH (P) for j = 1 … n. | | ECB Decryption: P = CIPH -1 (C) for j = 1 … n. |
| j         K j                | | j         K j  |

In ECB encryption, the forward cipher function is applied directly and independently to each
block of the plaintext. The resulting sequence of output blocks is the ciphertext.

In ECB decryption, the inverse cipher function is applied directly and independently to each
block of the ciphertext. The resulting sequence of output blocks is the plaintext.

| ECB Encryption |  | ECB Decryption |
| --------------- | ------------- | --------------- | ------------- |
|  | PLAINTEXT |  | CIPHERTEXT |
|  | INPUT BLOCK |  | INPUT BLOCK |
|  | CIPH |  | CIPH-1 |
|  | OUTPUT BLOCK |  | OUTPUT BLOCK |
|  | CIPHERTEXT |  | PLAINTEXT |

Figure 1: The ECB Mode

In ECB encryption and ECB decryption, multiple forward cipher functions and inverse cipher
functions can be computed in parallel.

In the ECB mode, under a given key, any given plaintext block always gets encrypted to the
9

same ciphertext block.  If this property is undesirable in a particular application, the ECB mode
should not be used.

The ECB mode is illustrated in Figure 1.
