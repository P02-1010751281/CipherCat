# SHA-256 Functions & Constants (FIPS 180-4 §4)

来源: NIST FIPS 180-4 — Secure Hash Standard

https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf


                       4.1.2 SHA-224 and SHA-256 Functions ...................................................................................... 10
                       4.2.2 SHA-224 and SHA-256 Constants ...................................................................................... 11

       Word            A group of either 32 bits (4 bytes) or 64 bits (8 bytes), depending on the
                       secure hash algorithm.


2.2        Algorithm Parameters, Symbols, and Terms

2.2.1 Parameters
The following parameters are used in the secure hash algorithm specifications in this Standard.

       a, b, c, …, h   Working variables that are the w-bit words used in the computation of the
                       hash values, H(i).

       H (i )          The ith hash value. H(0) is the initial hash value; H(N) is the final hash value
                       and is used to determine the message digest.

       H (ij )         The jth word of the ith hash value, where H 0(i ) is the left-most word of hash
                       value i.

       Kt              Constant value to be used for the iteration t of the hash computation.

       k               Number of zeroes appended to a message during the padding step.

                      Length of the message, M, in bits.

       m               Number of bits in a message block, M(i).

       M               Message to be hashed.


                                                  4
       M(i)          Message block i, with a size of m bits.

       M (ij )       The jth word of the ith message block, where M 0(i ) is the left-most word of
                     message block i.

       n             Number of bits to be rotated or shifted when a word is operated upon.

       N             Number of blocks in the padded message.

       T             Temporary w-bit word used in the hash computation.

       w             Number of bits in a word.

       Wt            The tth w-bit word of the message schedule.

2.2.2 Symbols and Operations
The following symbols are used in the secure hash algorithm specifications; each operates on w-
bit words.

                    Bitwise AND operation.

                    Bitwise OR (“inclusive-OR”) operation.

                    Bitwise XOR (“exclusive-OR”) operation.

                    Bitwise complement operation.

       +             Addition modulo 2w.

       <<            Left-shift operation, where x << n is obtained by discarding the left-most n