# Cryptographic Capability Map

This page organizes the platform’s cryptographic algorithms and reusable components by purpose. It explains how Blockly blocks relate to user-side verification and the platform’s randomness assessment. This is an overview; block interfaces, demo assertions, and standards text are documented in the linked references.

The taxonomy follows primary function. Post-quantum cryptography (PQC) is not a peer algorithm function alongside symmetric cryptography, hashes, and public-key cryptography: ML-KEM and the post-quantum signatures ML-DSA and SLH-DSA are listed by service, with their lattice- or hash-based construction noted. Quantum key distribution (QKD) is outside this platform’s scope.

## 1. How to read capability status

| Capability state | What it tells you | What it does not establish |
|---|---|---|
| Blockly blocks | A corresponding block is available; language-generation scope is indexed in the [block index](../blocks/INDEX.en.md) and [standards coverage matrix](../standards/COVERAGE.en.md) | It does not automatically mean a complete algorithm, all parameters, or every language implementation is covered |
| Demos and tests | The [demo index](../../demos/README.en.md) lists workspaces and registered vectors, property assertions, or cross-checks | A passing demo establishes only its registered checks, not full standards conformance or certification |
| Standards references | The [standards coverage matrix](../standards/COVERAGE.en.md) links structured entries, source text, formulas, pseudocode, blocks, and demos | A standards document does not prove that the corresponding implementation is complete or verified |
| Backend randomness assessment | The server runs the submitted Python generator in an isolated environment, generates samples, runs statistical tests, and produces a report | Statistical results do not prove entropy-source quality or cryptographic-module certification |

These states complement one another and must not be treated as interchangeable.

## 2. Algorithm overview

| Category | Subcategory / function | Representative algorithms or components | What it does | Guides and standards references |
|---|---|---|---|---|
| Symmetric cryptography | Block ciphers and modes | AES, SM4; ECB, CBC, CTR, XTS | Expresses block transformations and mode composition | [Symmetric blocks](../blocks/symmetric.en.md) · [coverage matrix](../standards/COVERAGE.en.md) |
| Symmetric cryptography | Authenticated encryption | CCM, GCM, ASCON | Encrypts and authenticates ciphertext and associated data | [Symmetric blocks](../blocks/symmetric.en.md) · [demo index](../../demos/README.en.md) |
| Symmetric cryptography | Stream ciphers | ZUC, EEA3 | Generates keystream and expresses stream-encryption flows | [Stream-cipher blocks](../blocks/zuc.en.md) · [coverage matrix](../standards/COVERAGE.en.md) |
| Public-key cryptography | Key agreement | ECDH, X25519, SM2 key exchange | Derives a shared secret from both parties’ key material | [Public-key and elliptic-curve blocks](../blocks/ecc-sbox.en.md) · [coverage matrix](../standards/COVERAGE.en.md) |
| Public-key cryptography | Key encapsulation (post-quantum, lattice-based) | ML-KEM | Encapsulates and decapsulates a shared secret | [Post-quantum blocks](../blocks/post-quantum.en.md) · [demo index](../../demos/README.en.md) |
| Public-key cryptography | Digital signatures | RSA, ECDSA, EdDSA, SM2, SM9; ML-DSA (lattice-based), SLH-DSA (hash-based) | Signs messages and verifies signatures | [Public-key and elliptic-curve blocks](../blocks/ecc-sbox.en.md) · [number-theory blocks](../blocks/numtheory.en.md) · [post-quantum blocks](../blocks/post-quantum.en.md) |
| Public-key cryptography | Public-key encryption | RSA, SM2; McEliece/Goppa (educational components only) | RSA/SM2 encrypt with a public key and decrypt with the corresponding private key; McEliece/Goppa demos show coding and decoding steps | [Public-key blocks](../blocks/ecc-sbox.en.md) · [post-quantum blocks](../blocks/post-quantum.en.md) |
| Hash and XOF | Fixed-length digests and extendable output | SHA-2, SHA-3, SHAKE, SM3, Keccak | Computes a digest or output of a requested length | [Hash blocks](../blocks/hash.en.md) · [coverage matrix](../standards/COVERAGE.en.md) |
| Message authentication | Integrity and origin authentication | HMAC, CMAC, EIA3 | Generates or verifies a message authentication code; EIA3 provides ZUC-based integrity | [Hash blocks](../blocks/hash.en.md) · [symmetric blocks](../blocks/symmetric.en.md) · [stream-cipher blocks](../blocks/zuc.en.md) |
| Key derivation | Derivation from keying material | HKDF, PBKDF2 | Derives purpose-specific keys from existing keying material | [coverage matrix](../standards/COVERAGE.en.md) |
| Password processing | Password hashing | Argon2 | Raises the cost of offline password guessing through configurable parameters | [coverage matrix](../standards/COVERAGE.en.md) |
| Randomness | Deterministic random-bit generation and platform assessment | SP 800-90A HMAC-DRBG; project `gm_rng` (an SM3-HMAC teaching example inspired by its state update) | Demonstrates the standard DRBG and a project teaching example; platform randomness assessment runs on the backend | [coverage matrix](../standards/COVERAGE.en.md) · [demo index](../../demos/README.en.md) |
| Mathematics and data representation | Reusable algorithm primitives | Finite fields, polynomials, matrices, NTT, sampling, encoding, bit/byte conversion | Expresses mathematical steps and data conversions; does not form a cryptographic algorithm by itself | [number-theory blocks](../blocks/numtheory.en.md) · [post-quantum blocks](../blocks/post-quantum.en.md) |

Rows describe capability entry points, not a certification list. Check the coverage matrix and demo index for parameters, generated languages, and verified scope.

### 2.1 Interface blocks versus interfaces built from blocks

Two kinds of cryptographic blocks exist. **Primitive blocks** do one step (padding, compression, NTT, point multiplication). **Interface blocks** wrap a whole standard algorithm in a single block, such as `rsa_encrypt`, `sm2_sign`, `mldsa_sign`, and `gcm_encrypt`. An interface block is directly usable, but having one does not mean the same interface can be assembled from lower-level blocks — that assembly is the platform's capability boundary.

Interfaces currently assembled from primitives:

| Interface | Workspace |
|---|---|
| ML-KEM Encaps | `demos/procedures/ML-KEM-Encaps.json` |
| AES single round | `demos/AES-Atomic-Round.json`, `demos/procedures/AES-Round.json` |
| SM4 round | `demos/SM4-Atomic-Round.json`, `demos/procedures/SM4-Round.json` |
| SHA-256, SM3 | `demos/procedures/SHA256-Hash.json`, `SM3-Hash.json` |
| ECB / CBC / CTR modes | `demos/procedures/Mode-*.json` |
| EIA3 | `demos/procedures/EIA3.json` |

The following interfaces currently exist only as interface blocks, with no primitive-level workspace or template: RSA, SM2, SM9, ECDSA, EdDSA, X25519, ECDH, ML-DSA, SHA-224/384/512, SHA3-224/256/384/512, HMAC-SHA-256, GCM/CCM/XTS, Argon2, HKDF, PBKDF2, and DRBG. Closing that gap requires intermediate primitives (for example the PKCS#1/OAEP encoding chain for RSA, the KDF and derivation chain for SM2, and the rejection-sampling and hint chain for ML-DSA) plus templates.

## 3. Families and their boundaries

### 3.1 Symmetric cryptography

Symmetric capabilities include block ciphers, modes, authenticated encryption, and stream ciphers. AES and SM4 are block ciphers; ECB, CBC, CTR, and XTS are modes; CCM, GCM, and ASCON provide authenticated encryption; ZUC and EEA3 are used for stream encryption. These serve different purposes: a mode or authenticated-encryption construction is not a new block cipher.

The AES demo shows a single-round primitive chain; it does not establish a complete AES-128 encryption interface. See the [demo index](../../demos/README.en.md) and [coverage matrix](../standards/COVERAGE.en.md) for the registered scope of ZUC, GCM, CCM, XTS, and ASCON.

The Metacrypto backend also includes a DES known-plaintext key-range search for cryptanalysis teaching. It is not a DES encryption block or a production encryption scheme. [NIST found DES insufficient to protect government information](https://csrc.nist.gov/news/2004/proposed-withdrawal-of-fips-for-the-des-and-reques); do not use DES for new production data protection.

### 3.2 Public-key cryptography: compare classical and post-quantum by function

| Function | Classical constructions | Post-quantum constructions | Current demo scope |
|---|---|---|---|
| Key establishment | ECDH, X25519, SM2 key exchange | ML-KEM (lattice-based key-encapsulation mechanism) | Key agreement and ML-KEM encapsulation use different protocol interfaces; ML-KEM demos cover registered parameters and flows, not every parameter set |
| Digital signatures | RSA, ECDSA, EdDSA, SM2, SM9 | ML-DSA (lattice-based), SLH-DSA (hash-based) | Registered tests cover RSA and ML-DSA; SLH-DSA demos cover selected structures and properties, not the full parameter family or complete KAT coverage |
| Public-key encryption | RSA, SM2 | McEliece/Goppa (educational components only) | The RSA demo uses an educational PKCS#1 v1.5 flow; McEliece/Goppa demos cover mathematical and decoding steps, not a complete cryptosystem |

Post-quantum describes the security objective against quantum-capable attackers; lattice-based, hash-based, and error-correcting-code-based describe construction foundations. ML-KEM is a lattice-based KEM, ML-DSA a lattice-based signature, and SLH-DSA a hash-based signature. Their functions differ; “post-quantum” does not make them one algorithm class.

### 3.3 Hash and extendable-output functions

SHA-2, SHA-3, and SM3 produce fixed-length digests; SHAKE provides extendable output, and Keccak is the related permutation construction. Hash and XOF blocks are also components of other algorithms, but their availability does not imply that every dependent protocol or signature scheme is implemented.

### 3.4 Message authentication and integrity

HMAC, CMAC, and EIA3 provide message integrity/authentication. EIA3 is based on ZUC and is an integrity algorithm, not an encryption algorithm. See the [demo index](../../demos/README.en.md) for registered vectors and parameters.

### 3.5 Key derivation and password hashing

HKDF and PBKDF2 derive keys; Argon2 hashes passwords. They are not encryption algorithms and are not interchangeable. Refer to the [coverage matrix](../standards/COVERAGE.en.md) for input restrictions, parameters, and test vectors.

### 3.6 Random-bit generation and platform assessment

SP 800-90A defines the HMAC-DRBG deterministic random-bit generation mechanism. Blockly `gm_rng` is a project-specific SM3-HMAC teaching example inspired by HMAC_DRBG's state update; it is not an SP 800-90A DRBG implementation. For an assessment, the user submits a Python generator and parameters; the backend executes that generator in an isolated environment, then the server-side assessment workflow runs registered statistical tests on the generated samples and produces a report. The frontend supports editing and user-side experiments, and submits tasks and displays reports; it does not issue the platform assessment from browser-generated samples.

Blockly `gm_rng` is only a reproducible teaching example; it neither collects nor validates an entropy source and does not claim conformance to GM/T 0103, GM/T 0105, or SP 800-90A.

Statistical tests apply to the given samples and configuration. They do not prove source entropy, attack resistance, or cryptographic-module compliance. Test suites and decision boundaries are described in the [standards coverage matrix](../standards/COVERAGE.en.md) and the linked randomness-assessment references.

### 3.7 Mathematics, sampling, and encoding

Finite fields, polynomials, matrices, NTT, sampling, bit/byte conversion, and encoding are reusable components, especially in lattice-based and error-correcting-code constructions. They help express algorithm steps but are not complete ML-KEM, ML-DSA, SLH-DSA, or McEliece implementations by themselves. See the [user guide](./USER-GUIDE.en.md) for Blockly types and the block index and standards entries for port and generation details.

## 4. From blocks to verification and platform assessment

1. **Choose a family.** Start from the [block index](../blocks/INDEX.en.md) and confirm the algorithm’s purpose, input types, and limitations.
2. **Build the flow.** Connect Blockly blocks; when reusing components across algorithms, follow port types and the standard’s data representation.
3. **Generate and run code.** Generate Python or JavaScript and inspect it in a user-side runtime. Code generation supports learning and experimentation; it does not automatically produce a platform assessment.
4. **Reproduce a demo.** Import a [demo workspace](../../demos/README.en.md) and check its registered vector, property assertion, or cross-check. Do not mistake a fixed-input regression value for a standards vector.
5. **Submit a randomness assessment.** Submit a Python generator and assessment parameters. The backend runs the generator in an isolated environment and produces samples; the server-side assessment workflow then runs the tests and records parameters and results. This workflow is specific to randomness and does not verify other algorithms.

## 5. Teaching, research, and production boundaries

| Intended use | Suitable today | Evidence or capability still required |
|---|---|---|
| Teaching | Inspect algorithm structure with blocks, generate code, and run registered demos and test vectors | Distinguish primitives, algorithm fragments, and complete algorithms; results apply only to registered inputs and assertions |
| Research | Use as a starting point for controlled experiments, cryptography education research, or implementation comparisons | Pin the source revision, standard/vector provenance, parameters, random seeds or samples, dependencies, and hardware; preserve raw outputs, logs, and repeated runs. A uniform reproducibility record is not yet implemented for every algorithm |
| Production | Use as a design reference or prototype; do not treat generated Blockly code or a platform statistics report as a production security conclusion | Requires complete target-standard testing, a threat model, key and entropy management, side-channel/implementation-security review, and independent validation. No CipherCat algorithm implementation is listed as [NIST CAVP-validated](https://csrc.nist.gov/Projects/cryptographic-algorithm-validation-program), and the platform holds no [CMVP/FIPS 140-3 cryptographic-module validation certificate](https://csrc.nist.gov/projects/cryptographic-module-validation-program); it does not certify entropy sources |

Backend statistical randomness tests are sample diagnostics. NIST SP 800-22 does not replace applicable SP 800-90A/B/C evaluation of DRBGs, entropy sources, and complete random-bit-generator constructions; algorithm-vector tests do not replace cryptographic-module validation. See the [standards coverage matrix](../standards/COVERAGE.en.md) and project development/assessment guidance for scope and next steps.

## 6. Scope notes

- Block availability, code generation, demo success, and complete standards references are different states.
- A demo covers only its registered inputs, parameters, vectors, or properties. Check the [standards coverage matrix](../standards/COVERAGE.en.md) for gaps.
- A platform randomness report is not a CAVP algorithm-validation result, evidence of CMVP/FIPS 140-3 cryptographic-module validation, or proof of entropy-source quality.
- Post-quantum cryptography on this page does not include quantum-communication technologies such as QKD.

## 7. Continue by purpose

- **Getting started:** [User guide](./USER-GUIDE.en.md) · [Step-by-step tutorials](./TUTORIALS.en.md) · [Step-by-step assembly guide](../build/INDEX.en.md) (how each function is built) · [Blockly guide](./BLOCKLY-GUIDE.en.md) · [Demo guide](./DEMO.en.md)
- **Finding blocks:** [Block index](../blocks/INDEX.en.md) · [Symmetric cryptography](../blocks/symmetric.en.md) · [Public-key and elliptic curves](../blocks/ecc-sbox.en.md) · [Hash](../blocks/hash.en.md) · [Post-quantum cryptography](../blocks/post-quantum.en.md) · [Number theory and encoding](../blocks/numtheory.en.md) · [Stream ciphers](../blocks/zuc.en.md)
- **Checking evidence:** [Standards coverage](../standards/COVERAGE.en.md) · [Documentation status](../standards/DOCUMENT-STATUS.en.md) · [Demo workspaces and verification index](../../demos/README.en.md)
