# CipherCat Documentation Center


🐱 **Post-Quantum Cryptography Visual Programming Platform** — built on Blockly 13.x and Vue 3 (Composition API + TypeScript).


---

## Documentation Index

### 📖 Project Docs

| Doc | Audience | Description |
|------|------|------|
| [BLOCKLY-GUIDE.en.md](./guides/BLOCKLY-GUIDE.en.md) | Users/Devs | Blockly usage guide: editor ops, type system, function templates, algorithm assembly examples |
| [DEMO.md](./guides/DEMO.en.md) | Users/Devs | Demo guide index (per algorithm: SM4/AES/hash/SM2/post-quantum, with official-vector verification) |
| [ARCHITECTURE.md](./guides/ARCHITECTURE.en.md) | Devs | System architecture, data flow, module organization, type system |
| [DEVELOPMENT.md](./guides/DEVELOPMENT.en.md) | Devs | Environment setup, adding blocks, i18n, code style |

### 📊 Planning & Audits

| Doc | Audience | Description |
|------|------|------|
| [AUDIT-REPORT.md](./guides/AUDIT-REPORT.en.md) | Devs | Cryptographic primitive completeness audit (incl. Chinese national standards) |
| [TYPE-SYSTEM.md](./guides/TYPE-SYSTEM.en.md) | Devs | Data type spec: definitions, value ranges, conversion rules, compatibility matrix |

### 🔬 Algorithm Specs

Full coverage matrix (standard ↔ blocks ↔ demos ↔ templates ↔ guides): [standards/COVERAGE.md](./standards/COVERAGE.en.md). Complete list of standards directories below:

| Doc | Description |
|------|------|
| [blocks/INDEX.md](./blocks/INDEX.md) | Block standard-basis reference (split by category) |
| [COVERAGE.md](./standards/COVERAGE.en.md) | Standards coverage matrix (standard ↔ block ↔ demo ↔ template ↔ guide) |
| [fips197-AES/](./standards/fips197-AES/) | FIPS 197 AES reference |
| [fips180-4-SHA2/](./standards/fips180-4-SHA2/) | FIPS 180-4 SHA-2 reference |
| [fips202-SHA3/](./standards/fips202-SHA3/) | FIPS 202 SHA-3 / SHAKE / KECCAK-p |
| [fips198-1-hmac/](./standards/fips198-1-hmac/) | FIPS 198-1 HMAC |
| [sp800-38a-modes/](./standards/sp800-38a-modes/) | SP 800-38A block modes (ECB/CBC/CTR) |
| [sp800-38b-cmac/](./standards/sp800-38b-cmac/) | SP 800-38B CMAC |
| [sp800-38c-ccm/](./standards/sp800-38c-ccm/) | SP 800-38C CCM authenticated encryption |
| [sp800-38d-gcm/](./standards/sp800-38d-gcm/) | SP 800-38D GCM authenticated encryption |
| [sp800-38e-xts/](./standards/sp800-38e-xts/) | SP 800-38E XTS disk encryption |
| [sp800-90a-drbg/](./standards/sp800-90a-drbg/) | SP 800-90A DRBG random generator |
| [sp800-132-pbkdf2/](./standards/sp800-132-pbkdf2/) | SP 800-132 PBKDF2 |
| [sp800-232-ascon/](./standards/sp800-232-ascon/) | SP 800-232 ASCON lightweight AEAD |
| [fips186-5-ecdsa/](./standards/fips186-5-ecdsa/) | FIPS 186-5 ECDSA |
| [fips203-ML-KEM/](./standards/fips203-ML-KEM/) | FIPS 203 ML-KEM (Kyber) |
| [fips204-ML-DSA/](./standards/fips204-ML-DSA/) | FIPS 204 ML-DSA (Dilithium) |
| [fips205-SLH-DSA/](./standards/fips205-SLH-DSA/) | FIPS 205 SLH-DSA stateless hash-based signatures |
| [mceliece-goppa/](./standards/mceliece-goppa/) | McEliece / Goppa codes (code-based) |
| [rfc4648-base64/](./standards/rfc4648-base64/) | RFC 4648 Base64 |
| [rfc2315-pkcs7/](./standards/rfc2315-pkcs7/) | RFC 2315 PKCS#7 padding |
| [rfc5869-hkdf/](./standards/rfc5869-hkdf/) | RFC 5869 HKDF |
| [rfc7748-x25519/](./standards/rfc7748-x25519/) | RFC 7748 X25519 key exchange |
| [rfc8017-pkcs1/](./standards/rfc8017-pkcs1/) | RFC 8017 PKCS#1 RSA encryption/signature |
| [rfc8032-eddsa/](./standards/rfc8032-eddsa/) | RFC 8032 EdDSA |
| [rfc5903-ecdh/](./standards/rfc5903-ecdh/) | RFC 5903 ECDH key agreement (P-256) |
| [rfc9106-argon2/](./standards/rfc9106-argon2/) | RFC 9106 Argon2 password hash |
| [gbt32905-SM3/](./standards/gbt32905-SM3/) | GB/T 32905 SM3 hash |
| [gbt32907-SM4/](./standards/gbt32907-SM4/) | GB/T 32907 SM4 block cipher |
| [gbt32918-SM2/](./standards/gbt32918-SM2/) | GB/T 32918 SM2 public-key cryptography |
| [gbt32915-randomness/](./standards/gbt32915-randomness/) | GB/T 32915 randomness testing (Go backend) |
| [gbt33133-ZUC/](./standards/gbt33133-ZUC/) | GB/T 33133 ZUC stream cipher |
| [gbt36624-aead/](./standards/gbt36624-aead/) | GB/T 36624 authenticated encryption |
| [gbt38635-SM9/](./standards/gbt38635-SM9/) | GB/T 38635 SM9 identity-based cryptography |
| [gbt15852-mac/](./standards/gbt15852-mac/) | GB/T 15852 MAC |
| [gbt17964-modes/](./standards/gbt17964-modes/) | GB/T 17964 block cipher modes |
| [gmt0091-kdf/](./standards/gmt0091-kdf/) | GM/T 0091 key derivation |
| [gmt0103-rng/](./standards/gmt0103-rng/) | GM/T 0103 random number generator |
| [cnsa-pqc-tracking/](./standards/cnsa-pqc-tracking/) | CNSA post-quantum migration tracking |

### 📝 Root Specs

| File | Description |
|------|------|
| [README.md](../README.en.md) | Project intro, quick start |
| [RULES.md](../RULES.md) | Engineering behavior rules |
| [eslint.config.js](../eslint.config.js) | ESLint rules |
| [tsconfig.json](../tsconfig.json) | TypeScript config |
| [package.json](../package.json) | Dependencies & scripts |

---

## Doc Relationship

```
RULES.md               ← highest authority (code rules)
    │
    ▼
DEVELOPMENT.md         ← development operations guide (references RULES.md)
    │
    ▼
ARCHITECTURE.md        ← system architecture
    │
    ├── DEMO.md                  ← demo guide index (per algorithm, see demos/)
    └── AUDIT-REPORT.md          ← primitive coverage audit
```

Cross-project sync plan lives in `.codestable/compound/sync-plan.md` (CodeStable artifact; script `scripts/sync-to-metacrypt.sh`).

---

## Project Overview

- **Frontend**: Vue 3 (Composition API + TypeScript)
- **Visual programming**: Blockly 13.x
- **Desktop packaging**: Tauri 2.x
- **Build**: Vite + vue-tsc
- **Code rules**: ESLint 9.x + RULES.md
- **Local storage**: IndexedDB
- **Code generation**: JavaScript / Python
