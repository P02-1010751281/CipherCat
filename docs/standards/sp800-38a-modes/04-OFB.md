# Modes — 6.4  The Output Feedback Mode

来源: NIST SP 800-38A

6.4  The Output Feedback Mode

The  Output Feedback (OFB) mode is a confidentiality mode that features the iteration of the
forward cipher on an IV to generate a sequence of output blocks that are exclusive-ORed with
the plaintext to produce the ciphertext, and vice versa.  The OFB mode requires that the IV is  a
nonce, i.e., the IV must be unique for each execution of the mode under the given key; the
generation of such IVs is discussed in Appendix C. The OFB mode is defined as follows:

1
|  |  | I = O |  | for j = 2 …  n; |
| --- | --- | ---------- | ---- | --------------------- |
|  |  | j | j -1 |
|  |  | O = CIPH | (I) | for j = 1, 2 …  n; |
j K j
j   j  j
C# = P# ⊕ MSB(O) for j = 1 … n.
j j s j
C = P ⊕ O for j = 1 … n−1;  (完整块：C = P ⊕ O)
j j j  j j j

|  |  | I = O |  | for j = 2 …  n; |
| --- | --- | ---------- | ---- | --------------------- |
|  |  | j | j -1 |
|  |  | O = CIPH | (I) | for j = 1, 2 …  n; |
j K j
j  j  j
P*  = C* ⊕  MSB(O).
|  |  | n | n  u | n |

完整块（j = 1 … n−1）：加密 C_j = P_j ⊕ O_j；解密 P_j = C_j ⊕ O_j。

In OFB encryption, the IV is transformed by the forward cipher function to produce the first
output block.  The first output block is exclusive-ORed with the first plaintext block to produce
the first ciphertext block.  The forward cipher function is then invoked on the first output block
to produce the second output block.  The second output block is exclusive-ORed with the second
plaintext  block  to  produce  the second ciphertext block, and the forward cipher function is
invoked on the second output block to produce the third output block.  Thus, the successive
output blocks are produced from applying the forward cipher function to the previous output
blocks, and the output blocks are exclusive-ORed with the corresponding plaintext blocks to
produce the ciphertext blocks.  For the last block, which may be a partial block of u bits, the
most significant u bits of the last output block are used for the exclusive-OR operation; the
remaining b-u bits of the last output block are discarded.

In OFB decryption, the IV is transformed by the forward cipher function to produce the first
13

output block.  The first output block is exclusive-ORed with the first ciphertext block to recover
the first plaintext block.  The first output block is then transformed by the forward cipher
function to produce the second output block.  The second output block is exclusive-ORed with
the second ciphertext block to produce the second plaintext block, and the second output block is
also transformed by the forward cipher function to produce the third output block.  Thus, the
successive output blocks are produced from applying the forward cipher function to the previous
output blocks, and the output blocks are exclusive-ORed with the corresponding ciphertext
blocks to recover the plaintext blocks.   For the last block, which may be a partial block of u bits,
the most significant u bits of the last output block are used for the exclusive-OR operation; the
remaining b-u bits of the last output block are discarded.

INITIALIZATION
VECTOR
TPYRCNE
|  |  | CIPH |  |  | CIPH |  |  |  | CIPH |
| --- | ------------ | --------------- | --- | ------------ | --------------- | --- | --- | ------------ | --------------- |
|  |  | OUTPUT BLOCK 1 |  |  | OUTPUT BLOCK 2 |  |  |  | OUTPUT BLOCK n |
|  | PLAINTEXT 1 |  |  | PLAINTEXT 2 |  |  |  | PLAINTEXT n |
|  |  | CIPHERTEXT 1 |  |  | CIPHERTEXT 2 |  |  |  | CIPHERTEXT n |
INITIALIZATION
VECTOR
|  |  |  | INPUT BLOCK 1 |  |  |  | INPUT BLOCK 2 |  |  |  | INPUT BLOCK n |
| --- | ------- | --- | --------------- | --- | --- | --- | --------------- | --- | --- | --- | --------------- |
|  |  |  | CIPH |  |  |  | CIPH |  |  |  | CIPH |
|  | TPYRCED |  |  | K |  |  |  | K |  |  | K |
|  |  |  | OUTPUT BLOCK 1 |  |  |  | OUTPUT BLOCK 2 |  |  |  | OUTPUT BLOCK n |
⊕
|  |  | CIPHERTEXT 1 |  |  | CIPHERTEXT 2 |  | ⊕ |  | CIPHERTEXT n |  | ⊕ |
| --- | --- | ------------- | ------------ | --- | ------------- | --- | ------------ | --- | ------------- | --- | -------------- |
|  |  |  | PLAINTEXT 1 |  |  |  | PLAINTEXT 2 |  |  |  | PLAINTEXT n |

Figure 4: The OFB Mode

In both OFB encryption and OFB decryption, each forward cipher function (except the first)
depends on the results of the previous forward cipher function; therefore, multiple forward cipher
functions cannot be performed in parallel.  However, if the IV is known, the output blocks can be
generated prior to the availability of the plaintext or ciphertext data.

The OFB mode requires a unique IV for every message that is ever encrypted under the given
key.  If, contrary to this requirement, the same IV is used for the encryption of more than one
message, then the confidentiality of those messages may be compromised.  In particular, if a
plaintext block of any of these messages is known, say, the jth plaintext block, then the jth output
of the forward cipher function can be determined easily from the jth ciphertext block of the
14

using the same IV to be easily recovered from the jth ciphertext block of that message.
Confidentiality may similarly be compromised if any of the input blocks to the forward cipher
function for the encryption of a message is designated as the IV for the encryption of another
message under the given key.
The OFB mode is illustrated in Figure 4.
