# Symmetric Crypto Block Reference (AES + SM4 + Modes + Padding)

## Document role and evidence entry points

This is the category detail page under the [block overview](INDEX.en.md). It records block inputs/outputs, composition, and current engineering boundaries; page length is not a capability weight.

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [FIPS 197 AES](../standards/fips197-AES/), [GB/T 32907 SM4](../standards/gbt32907-SM4/), [SP 800-38A](../standards/sp800-38a-modes/), [coverage matrix](../standards/COVERAGE.en.md) |
| Implementation | the corresponding blocks in the toolbox and their code generators |
| Example workspaces | [Demo guide](../guides/DEMO.en.md), and AES/SM4/CCM/GCM/XTS/ASCON workspaces under `demos/procedures/` |
| Boundary | Atomic rounds, modes, and selected vectors do not imply every parameter set, rejection path, or production security property; use the coverage matrix for per-algorithm gaps |


## AES (FIPS 197)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `aes_sub_bytes` | 1 | value(→) | IntList→IntList | S-box substitution, 16 bytes |
| `aes_shift_rows` | 1 | value(→) | IntList→IntList | row cyclic left shift |
| `aes_mix_columns` | 1 | value(→) | IntList→IntList | GF(2⁸) mix columns |
| `aes_add_round_key` | 1 | value(→) | IntList&IntList→IntList | ⊕ round key |

## SM4 (GB/T 32907-2016)


| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `sm4_round_func` | 1 | value(→) | IntList&IntList&IntList&IntList&Number→IntList | round function F(X0,X1,X2,X3,rk) |
| `sm4_sbox` | 1 | value(→) | Number→Number | GB/T 32907-2016 byte S-box lookup; input is an integer from 0 to 255 |
| `sm4_linear_transform` | 1 | value(→) | IntList→IntList | L(B) linear transform |

## Block Modes (NIST SP 800-38A)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `mode_ecb_encrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB encrypt (teaching only) |
| `mode_ecb_decrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB decrypt; ciphertext must contain complete 16-byte blocks; no unpadding |
| `mode_cbc_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CBC encrypt (needs IV) |
| `mode_ctr_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CTR encrypt (needs nonce) |

## Padding

| Block | Layer | Connection | Input→Output | Standard |
|----|----|------|----------|------|
| `pad_pkcs7` | 1 | value(→) | Bytes&Number→Bytes | RFC 2315 §10.3; block size 1–255 bytes |
| `pad_zero` | 1 | value(→) | Bytes&Number→Bytes | Project extension; not a universal standard padding scheme |

PKCS#7 requires an integer block size from 1 through 255; an already aligned input receives a full padding block. ECB decryption accepts only complete ciphertext blocks and preserves any padding bytes rather than removing them. The project’s zero-padding operation aligns to the selected block size and appends a full zero block to already aligned input. The original length cannot be recovered reliably from trailing zero bytes, so callers must retain it separately.

## Block MAC (NIST SP 800-38B)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `cmac_mac` | 1 | value(→) | Bytes&Bytes→Bytes | CMAC(key, msg) → 16-byte tag; CIPHER dropdown AES-128 (official vectors) / SM4 (GB/T 15852 counterpart) |

## Authenticated Encryption CCM (NIST SP 800-38C)

| Block | Layer | Connection | Input→Output | Description |
|-------|-------|------------|--------------|-------------|
| `ccm_b0` | 1 | value(→) | IntList&Number&Number→IntList | CCM B0 block (SP 800-38C §A.2): flags ‖ nonce ‖ message length; tagLen dropdown 4–16 |
| `ccm_counter_block` | 1 | value(→) | IntList&Number→IntList | CCM counter block A_i (§A.3): flags(=L−1) ‖ nonce ‖ i (L-byte big-endian) |
| `ccm_cbc_mac` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | CCM CBC-MAC (§A.2): whole-string CBC-MAC over B0‖length-coded AAD‖plaintext (per-segment zero padding), 16-byte output |
| `ccm_ctr` | 1 | value(→) | Bytes&IntList&Bytes→Bytes | CCM counter mode (§A.3): ciphertext only, no tag |
| `cmac_double` | 1 | value(→) | IntList→IntList | CMAC subkey doubling (SP 800-38B §6.1): one-bit left shift, XOR 0x87 when the top bit is set |
| `cmac_subkeys` | 1 | value(→) | Bytes→Bytes | CMAC subkeys K1‖K2 (§6.1, AES-128): 32-byte output |
| `xts_tweak_mul` | 1 | value(→) | IntList→IntList | XTS tweak ×α (SP 800-38E / IEEE 1619): little-endian one-bit shift, XOR 0x87 into byte 0 on byte-15 carry |
| `ccm_aad_len_prefix` | 1 | value(→) | Number→IntList | CCM AAD length encoding (SP 800-38C §A.2.2): two big-endian bytes below 0xFF00, otherwise 0xFFFE ‖ four bytes |
| `ccm_encrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | CCM encryption returns ciphertext concatenated with the authentication tag; tag length is selected in bytes (4–16). Current AES-128 regressions cover Appendix C Examples 1–3 only. |

## Disk Encryption XTS (NIST SP 800-38E)

| Block | Layer | Connection | Input→Output | Description |
|-------|-------|------------|--------------|-------------|
| `xts_encrypt` | 1 | value(→) | Bytes&IntList&Bytes→Bytes | XTS encryption: `key` holds two distinct AES-128 keys (32 bytes) and `tweak` is 16 bytes. Data units run from 16 bytes to 16 MiB and the final partial block uses ciphertext stealing. This is a fixed project regression: IEEE 1619-2007 is a paid document not distributed with the repository, so there is no third-party cross-check. |

## Lightweight Authenticated Encryption ASCON (NIST SP 800-232)

| Block | Layer | Connection | Input→Output | Description |
|-------|-------|------------|--------------|-------------|
| `ascon_encrypt` / `ascon_decrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | Ascon-AEAD128 encryption and decryption; decryption verifies the 128-bit tag and rejects a wrong one. The current demo is a small fixed regression and does not run the complete 1,089-case AEAD KAT. |
| `ascon_hash256` / `ascon_xof128` / `ascon_cxof128` | 1 | value(→) | Bytes[&Bytes][&Number]→Bytes | SP 800-232 Hash256, XOF128, and CXOF128; output length is in bytes and the CXOF customization string is at most 256 bytes. Empty messages and the `abc` customization string are covered by byte-aligned ACVP cases in both languages |

## Authenticated Encryption GCM (NIST SP 800-38D)

| Block | Layer | Connection | Input→Output | Description |
|-------|-------|------------|--------------|-------------|
| `gcm_gf128_mul` | 1 | value(→) | IntList&IntList→IntList | GF(2¹²⁸) block multiplication (SP 800-38D Algorithm 1): two 16-byte blocks, right-shift convention with 0xE1 reduction; the GHASH building block |
| `gcm_ghash` | 1 | value(→) | IntList&IntList&IntList→IntList | GHASH_H(A, C) (Algorithm 2): 16-byte block chaining plus a 64-bit length block; outputs a 16-byte hash |
| `gcm_gctr` | 1 | value(→) | Bytes&IntList&Bytes→Bytes | GCTR_K(ICB, X) (Algorithm 3): AES-128 counter mode, same function for both directions; the caller derives ICB |
| `gcm_inc32` | 1 | value(→) | IntList→IntList | inc32 (§6.2): increments only the low 32 bits modulo 2³² and leaves the rest untouched |
| `gcm_j0` | 1 | value(→) | IntList&IntList→IntList | J0 derivation (§7.1 Step 1): a 96-bit IV becomes iv‖0³¹‖1; other lengths use GHASH_H({}, IV) |
| `gcm_encrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | GCM encryption returns ciphertext concatenated with a 128-bit tag. GHASH (GF(2^128), R=0xE1‖0^120) plus GCTR; with a 12-byte IV, J0 = iv‖0^31‖1, otherwise J0 is derived with GHASH. Verified vectors are GCM-spec Test Case 2/13 (the numbering comes from the GCM specification, not SP 800-38D) and 15 NIST ACVP AES-GCM cases with tagLen=128; TC2/TC13 were also recomputed with an independent implementation. SP 800-38D itself has no test-vector appendix, TC3 is not covered, and this is not the full test suite. |
