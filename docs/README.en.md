# CipherCat Documentation Center

> [中文](./README.md)

🐱 **Post-Quantum Cryptography Visual Programming Platform** — built on Blockly 12.x and Vue 3 (Composition API + TypeScript).

Covers the full range of cryptographic primitives — from bit operations, S-Boxes and hash functions to post-quantum cryptography (ML-KEM / ML-DSA): 98 custom blocks + 27 function templates, 13 categories, complete type-constraint system. Every block is annotated with its international / national standard basis — see [BLOCK-STANDARDS.md](./BLOCK-STANDARDS.en.md).

---

## Documentation Index

### 📖 Project Docs

| Doc | Audience | Description |
|------|------|------|
| [DEMO.md](./DEMO.en.md) | Users/Devs | Demo guide index (per algorithm: SM4/AES/hash/SM2/post-quantum, with official-vector verification) |
| [ARCHITECTURE.md](./ARCHITECTURE.en.md) | Devs | System architecture, data flow, module organization, type system |
| [DEVELOPMENT.md](./DEVELOPMENT.en.md) | Devs | Environment setup, adding blocks, i18n, code style |

### 📊 Planning & Audits

| Doc | Audience | Description |
|------|------|------|
| [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.en.md) | Devs/PM | Full implementation plan: 7 milestones 77→140 blocks |
| [AUDIT-REPORT.md](./AUDIT-REPORT.en.md) | Devs | Cryptographic primitive completeness audit (incl. Chinese national standards) |
| [TYPE-SYSTEM.md](./TYPE-SYSTEM.en.md) | Devs | Data type spec: definitions, value ranges, conversion rules, compatibility matrix |

### 🔬 Algorithm Specs

| Doc | Description |
|------|------|
| [blocks/INDEX.md](./blocks/INDEX.md) | Block standard-basis reference (split by category) |
| [fips197-AES/](./fips197-AES/) | FIPS 197 AES reference |
| [fips180-4-SHA2/](./fips180-4-SHA2/) | FIPS 180-4 SHA-2 reference |
| [fips202-SHA3/](./fips202-SHA3/) | FIPS 202 SHA-3 / SHAKE / KECCAK-p |
| [fips203-ML-KEM/](./fips203-ML-KEM/) | FIPS 203 ML-KEM (Kyber) |
| [fips204-ML-DSA/](./fips204-ML-DSA/) | FIPS 204 ML-DSA (Dilithium) |
| [gbt32907-SM4/](./gbt32907-SM4/) | GB/T 32907 SM4 block cipher |
| [gbt32905-SM3/](./gbt32905-SM3/) | GB/T 32905 SM3 hash |
| [sp800-38a-modes/](./sp800-38a-modes/) | SP 800-38A block modes (ECB/CBC/CTR) |
| [sp800-38d-gcm/](./sp800-38d-gcm/) | SP 800-38D GCM authenticated encryption |
| [fips198-1-hmac/](./fips198-1-hmac/) | FIPS 198-1 HMAC |
| [fips186-5-ecdsa/](./fips186-5-ecdsa/) | FIPS 186-5 ECDSA |
| [sp800-132-pbkdf2/](./sp800-132-pbkdf2/) | SP 800-132 PBKDF2 |
| [rfc5869-hkdf/](./rfc5869-hkdf/) | RFC 5869 HKDF |
| [rfc4648-base64/](./rfc4648-base64/) | RFC 4648 Base64 |
| [rfc2315-pkcs7/](./rfc2315-pkcs7/) | RFC 2315 PKCS#7 padding |

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
    ├── IMPLEMENTATION-PLAN.md   ← roadmap (references ARCHITECTURE)
    └── AUDIT-REPORT.md          ← primitive coverage audit
```

Cross-project sync plan lives in `.codestable/compound/sync-plan.md` (CodeStable artifact; script `scripts/sync-to-metacrypt.sh`).

---

## Project Overview

- **Frontend**: Vue 3 (Composition API + TypeScript)
- **Visual programming**: Blockly 12.x
- **Desktop packaging**: Tauri 2.x
- **Build**: Vite + vue-tsc
- **Code rules**: ESLint 9.x + RULES.md
- **Local storage**: IndexedDB
- **Code generation**: JavaScript / Python
