# HMAC Algorithm (FIPS 198-1)

来源: NIST FIPS 198-1
The Keyed-Hash Message Authentication Code
https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.198-1.pdf

## HMAC Definition

HMAC(K, text) = H((K₀ ⊕ opad) ‖ H((K₀ ⊕ ipad) ‖ text))


FIPS PUB 198-1
FEDERAL INFORMATION PROCESSING STANDARDS PUBLICATION



The Keyed-Hash Message Authentication Code
(HMAC)



CATEGORY: COMPUTER SECURITY                      SUBCATEGORY: CRYPTOGRAPHY




Information Technology Laboratory
National Institute of Standards and Technology
Gaithersburg, MD 20899-8900



July 2008




U.S. Department of Commerce
Carlos M. Gutierrez, Secretary

National Institute of Standards and Technology
James M. Turner, Deputy Director
                                     FOREWORD
The Federal Information Processing Standards Publication Series of the National Institute
of Standards and Technology (NIST) is the official series of publications relating to
Standards and Guidelines adopted and promulgated under the provisions of the Federal
Information Security Management Act (FISMA) of 2002.

Comments concerning FIPS publications are welcomed and should be addressed to the
Director, Information Technology Laboratory, National Institute of Standards and
Technology, 100 Bureau Drive, Stop 8900, Gaithersburg, MD 20899-8900.
                                                   Cita Furlani, Director
                                                   Information Technology Laboratory




                                           ii
                                      Abstract

This Standard describes a keyed-hash message authentication code (HMAC), a
mechanism for message authentication using cryptographic hash functions. HMAC can
be used with any iterative Approved cryptographic hash function, in combination with a
shared secret key.

Keywords: computer security, cryptography, HMAC, MAC, message authentication,
Federal Information Processing Standards (FIPS).




                                         iii
            Federal Information Processing Standards Publication 198-1

                                       July 2008

                             Announcing the Standard for

         The Keyed-Hash Message Authentication Code (HMAC)

Federal Information Processing Standards Publications (FIPS PUBS) are issued by the
National Institute of Standards and Technology (NIST) after approval by the Secretary of
Commerce pursuant to Section 5131 of the Information Technology Management Reform
Act of 1996 (Public Law 104-106) and the Computer Security Act of 1987 (Public Law
100-235).

1. Name of Standard. The Keyed-Hash Message Authentication Code (HMAC) (FIPS
   PUB 198-1).

2. Category of Standard. Computer Security Standard. Subcategory. Cryptography.

3. Explanation. This Standard specifies an algorithm for applications requiring message
authentication. Message authentication is achieved via the construction of a message
authentication code (MAC). MACs based on cryptographic hash functions are known as
HMACs.

The purpose of a MAC is to authenticate both the source of a message and its integrity
without the use of any additional mechanisms. HMACs have two functionally distinct
parameters, a message input and a secret key known only to the message originator and
intended receiver(s). Additional applications of keyed-hash functions include their use in
challenge-response identification protocols for computing responses, which are a function
of both a secret key and a challenge message.

An HMAC function is used by the message sender to produce a value (the MAC) that is
formed by condensing the secret key and the message input. The MAC is typically sent to
the message receiver along with the message. The receiver computes the MAC on the
received message using the same key and HMAC function as were used by the sender,
and compares the result computed with the received MAC. If the two values match, the
message has been correctly received, and the receiver is assured that the sender is a
member of the community of users that share the key.


4. Approving Authority. Secretary of Commerce.




                                            iv
5. Maintenance Agency. Department of Commerce, National Institute of Standards
and Technology, Information Technology Laboratory (ITL).

6. Applicability. This Standard is applicable to all Federal departments and agencies for
the protection of sensitive unclassified information that is not subject to Title 10 United
States Code Section 2315 (10 USC 2315) and that is not within a national security system
as defined in Title 44 United States Code Section 3502(2) (44 USC 3502(2)). The
adoption and use of this Standard is available to private and commercial organizations.

7. Specifications. Federal Information Processing Standard (FIPS) 198-1, The Keyed-
Hash Message Authentication Code (HMAC) (affixed).

8. Implementations. The authentication mechanism described in this Standard may be
implemented in software, firmware, hardware, or any combination thereof. NIST has
developed a Cryptographic Module Validation Program that will test implementations for
conformance with this HMAC Standard. Information on this program is available at
http://csrc.nist.gov/groups/STM/index.html.

Agencies are advised that keys used for HMAC applications should not be used for other
purposes.

9. Other Approved Security Functions. HMAC implementations that comply with this
Standard shall employ cryptographic algorithms, cryptographic key generation
algorithms and key management techniques that have been approved for protecting
Federal government sensitive information. Approved cryptographic algorithms and
techniques include those that are either:

   a. specified in a Federal Information Processing Standard (FIPS),
   b. adopted in a FIPS or NIST Recommendation, or
   c. specified in the list of Approved security functions for FIPS 140-2.

10.     Export Control. Certain cryptographic devices and technical data regarding them
are subject to Federal export controls. Exports of cryptographic modules
implementing this Standard and technical data regarding them must comply with these
Federal regulations and be licensed by the Bureau of Export Administration of the U.S.
Department of Commerce. Information about export regulations is available at:
http://www.bis.doc.gov/index.htm.

11. Implementation Schedule. Guidance regarding the testing and validation to FIPS
198-1 and its relationship to FIPS 140-2 can be found in IG 1.10 of the Implementation
Guidance for FIPS PUB 140-2 and the Cryptographic Module Validation Program at
http://csrc.nist.gov/groups/STM/cmvp/index.html.

5.    TRUNCATION

A well-known practice with MACs is to truncate their outputs (i.e., the length of the
MACs used is less than the length of the output of the HMAC function L). Applications
of this standard may truncate the outputs of the HMAC. When truncation is used, the λ
leftmost bits of the output of the HMAC function shall be used as the MAC. For
information about the choice of λ and the security implications of using truncated outputs
of the HMAC function, see SP 800-107.


6.     IMPLEMENTATION NOTE

The HMAC algorithm is specified for an arbitrary Approved iterative cryptographic hash
function, H. In the HMAC algorithm, values of the ipad and the opad depend on the
block size, B, of the Approved hash function. An HMAC implementation can easily
replace one Approved iterative hash function, H, with another Approved iterative hash


                                                5
function, H’ by generating new ipad and opad using the block size of H’ instead of H as
defined in Section 2.3.

Conceptually, the intermediate results of the compression function on the B-byte blocks
(K0 ⊕ ipad) and (K0 ⊕ opad) can be precomputed once, at the time of generation of the
key K, or before its first use. These intermediate results can be stored and then used to
initialize H each time that a message needs to be authenticated using the same key. For
each authenticated message using the key K, this method saves the application of the hash
function of H on two B-byte blocks (i.e., on (K ⊕ ipad) and (K ⊕ opad)). This saving
may be significant when authenticating short streams of data. These stored intermediate
values shall be treated and protected in the same manner as secret keys.

Choosing to implement HMAC in this manner has no effect on interoperability.

Object identifiers (OIDs) for HMAC are posted at
http://csrc.nist.gov/groups/ST/crypto_apps_infra/csor/algorithms.html,
along with procedures for adding new OIDs.

Examples of HMAC are available at
http://csrc.nist.gov/groups/ST/toolkit/examples.html.




                                            6
APPENDIX A: The Differences Between FIPS 198 and FIPS 198-1
The length of truncated HMAC outputs and their security implications in FIPS 198 is not
mentioned in this Standard; instead, it is described in SP 800-107. The discussion about
the limitations of MAC algorithms has been moved to SP 800-107. The examples and
OIDs have been posted on the NIST web sites referenced in Section 6.


APPENDIX B: References
[HMAC]      H. Krawczyk, M. Bellare, and R. Canetti, HMAC: Keyed-Hashing for
            Message Authentication, Internet Engineering Task Force, Request for
            Comments (RFC) 2104, February 1997.

[FIPS 180-3]     National Institute of Standards and Technology, Secure Hash Standards
                (SHS), Federal Information Processing Standards Publication 180-3,
                October 2008.

[SP 800-57]      NIST Special Publication (SP) 800-57, Recommendation for Key
                 Management – Part 1: General (Revised), March 2007.

[SP 800-107]     NIST Special Publication (SP) 800-107, Recommendation for
                 Applications Using Approved Hash Algorithms, February 2009.




                                           7
