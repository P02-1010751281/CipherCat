# Primitive and teaching-surface audit report

> Snapshot date: 2026-09-24. This report distinguishes checks actually run in this review from unfinished audit work. “Covered” does not mean production cryptographic certification. See the [web research report](../research/CRYPTO-RESEARCH-2026-09-12.md) for standards and literature findings.

## Current snapshot

- **194 custom block types**: recursively expanding and deduplicating `ALL_BLOCK_TYPES` from `src/blocks/index.ts` yields 194 unique types.
- **29 function templates**: counted from `TEMPLATE_REGISTRY` in `src/blocks/procedure/blocks.ts`.
- **17 toolbox categories**: including custom crypto categories, Function Wrapping, Crypto Templates, and Blockly-native categories.
- **59 registered demos**: `demos/tests.json` matches 59 demo workspace `.json` files one-to-one (excluding the registry itself).
- **Function templates**: the 29 template registrations include three base `crypto_*` blocks already counted among the block types and 26 additional `proc_*` template types. Demo regressions cover registered workspaces; they do not prove that every block type is individually exercised.

## Coverage conclusions

- FIPS 180-4: SHA-224/256/384/512 blocks and demos are present; SHA-1, SHA-512/224, and SHA-512/256 are not implemented.
- FIPS 202: Keccak, SHA-3, and SHAKE atomic chains and wrapper demos are present.
- FIPS 203/204/205: ML-KEM, ML-DSA, and SLH-DSA primitives/structures plus property demos are present; complete FN-DSA/Falcon is not implemented.
- RSA, ECDH, ECDSA, EdDSA, X25519, Argon2, DRBG, PBKDF2, HKDF, AES/SM4 modes, and multiple AEAD/MAC primitives have standards directories and implementation records.
- SM2 includes point operations, signing/verification, encryption/decryption, and `sm2_key_exchange`; ZUC includes the EEA3 keystream block and demo.
- Three matrix entries intentionally have no Blockly atomic block: GB/T 36624 AEAD, GM/T 0005 randomness testing (Go backend), and China PQC public-information tracking. They must not be described as “all standards gaps closed.”

## Demo and generator audit

The `demos/tests.json` key set matches the demo-file set: 59 registered items, with no missing or stale keys. Every workspace loads through the Blockly headless harness; demos with test specifications execute generated Python and JavaScript and compare their expected output. Run `npm run verify:all`; local documentation links are checked with `npm run docs:check-links`.

The template harness checks template injection, chain shape, Python/JavaScript generation, and execution. The multi-parameter ML-KEM Encaps template additionally checks the `ek/m` signature, statement chain, and return reference.

## Known boundaries

1. Passing a vector proves agreement for the tested input; it is not third-party certification and does not make the generated code suitable for protecting production keys.
2. SHA-1, MD5, SHA-512/224, SHA-512/256, and Falcon/FN-DSA must not be described as implemented in README or coverage documents.
3. CMAC, Base64, and PKCS#7 have blocks but no independent procedure demo. Keep the distinction “block present, demo absent”; do not summarize this as complete demo coverage.
4. Frontend generated-code trials are not platform-side backend randomness assessment. Sampling, statistical testing, isolated execution, and decisions run in the `metacrypt_server` backend pipeline; this is not certification or proof of entropy-source quality.

## Acceptance status and limits (2026-09-24)

- Passed: `npm run test:unit` (49/49 across 8 files); `npm run type-check`; `npm run cycles:check` (357 files, no circular dependencies); `npm run build`; `npm run verify:all` (standards metadata/split/formula/inventory checks, 29/29 templates, 59/59 demos, and local-link checks across 388 Markdown files with 0 broken links).
- Procedure generators: Python and JavaScript no longer treat the first parameter as a missing return value or infer the return type from it. A connected return block supplies its own Blockly output type for annotations; no-return procedures emit no `return`; call expressions and statements follow their respective shapes. Focused regression tests pass 4/4.
- AES: atomic MixColumns now processes contiguous four-byte columns in the column-major state layout. The explicit normal-round expression runs SubBytes → ShiftRows → MixColumns → AddRoundKey; the final round omits MixColumns. Python/JavaScript regression outputs pass for project-fixed inputs, not the full FIPS Appendix C.1 encryption vector. AES-Atomic-Round mutates shared state in top-level workspace order for a single-round demonstration; it is not a complete AES-128 interface. The specified order follows [NIST FIPS 197](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf).
- Backend regression boundary: `metacrypt_server` backend unit tests report 534 passed, 1 skipped, and 103 warnings; `go test ./...` in the randomness module passes. The sandbox single-slot lock waits at most five seconds; atomic request claiming prevents duplicate execution; user code cannot enumerate the shared queue or create work-directory subdirectories, and cleanup failures return an explicit error. Undispatched Celery queue backlog remains uncapped. A Python `multiprocessing.resource_tracker` `KeyError` was observed after pytest exited with code 0; its source remains unisolated.
- Podman runtime: a single `randomness-sandbox` container was built and started with an isolated rootless VFS store. The backend-client request/result round trip, runner UID 1002, EACCES on the queue directory, denied nested `mkdir`, one-time request claiming while running, and an empty `/tmp` after jobs were exercised. This covers the sandbox service only—not the full Compose stack, GPU path, backend/Nginx 401 behavior, or production deployment. The host's default store still has an old `mc-randomness-sandbox` instance without the current `CAP_KILL`/`CAP_SETUID` requirements; it was not restarted or replaced in this review.
- Full `npm run lint:check` exited 0 with no error or warning diagnostics; `npm run type-check` also passes in this repository. The 384 TypeScript diagnostics previously found belong to `metacrypt_server/frontend` and must not be attributed to this repository.
- Review-round status: the 2026-09-22 baseline records three primary reviews with independent rebuttals, but its conclusion was **not accepted** and listed unresolved code, backend-assessment architecture, and delivery issues. This incremental pass also reviewed the crypto-category navigation, bilingual capability tables, and block/template counts alongside the AES/procedure-generator/sandbox slices. Two reviewers independently confirmed 194 unique block types and a 220-type deduplicated block/template union; a separate reviewer found no issue in the documentation diff. Unit tests, type-check, lint, cycle check, `verify:all`, and production build pass. This is not a current whole-repository three-round acceptance: manual UI walkthroughs, screenshot/environment consistency, and other algorithm and architecture areas remain unaccepted.
- These checks demonstrate engineering regressions and behavior on selected inputs only. They are not evidence of CAVP/ACVTS, CMVP/FIPS 140-3, constant-time, side-channel security, or formal verification.
