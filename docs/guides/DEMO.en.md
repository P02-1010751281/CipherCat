# Demo Guide


Pre-built Blockly workspace examples, **all using atomic blocks** (no convenience wrappers), to understand the low-level implementation of each cryptographic primitive. Split into per-algorithm docs; corresponding demo files are listed in the [demos/README.md](../../demos/README.en.md) file index:

| Algorithm | Build steps | Demo files |
|------|----------|----------------|
| SM4 | [demos/sm4.en.md](../demos/sm4.en.md) | `SM4-Atomic-Round.json` / `procedures/SM4-Sbox.json` |
| AES | [demos/aes.en.md](../demos/aes.en.md) | `AES-Atomic-Round.json` / `Procedure-AES-Round.json` |
| Hash | [demos/hash.en.md](../demos/hash.en.md) | `SHA256-Atomic-Hash.json` / `procedures/SM3-Hash.json` |
| SM2 | [demos/sm2.en.md](../demos/sm2.en.md) | `procedures/SM2-PointMul.json` |
| Post-quantum | [demos/post-quantum.en.md](../demos/post-quantum.en.md) | `ML-KEM-Atomic.json` / `procedures/ML-KEM-Encaps.json` |

> Standard build guides: ML-KEM-768 Encaps → [fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md](../standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md) · ML-DSA signing → [fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.en.md](../standards/fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.en.md) · ZUC keystream → [gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.en.md](../standards/gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.en.md)
> Full standard↔block↔demo↔template↔guide coverage matrix: [standards/COVERAGE.en.md](../standards/COVERAGE.en.md).

---

## Quick Start

1. Open the editor → Menu "More → Import Workspace" → pick a `.json` file from `demos/`
2. Inspect the block wiring → "▶ Generate" to view JS/Python output
3. Procedure demo → see how the wrapped function is called elsewhere

## Official-Vector Verification (scenarios 6-9)

All official-vector demos are verified end-to-end (Python + JavaScript) via the headless harness; verification commands live in [demos/README.md](../../demos/README.en.md).

---

## Going Further

### Atomic block chains
All round functions are direct atomic-block chains (convenience composites removed):
- AES round = `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key`
- SM4 round = `sm4_round_func` (includes S-box + L transform details)

### Custom function wrapping
1. Select the crypto pipeline you built
2. Wrap it in `procedures_defreturn`
3. Set parameter types (bytes / int_list / poly / seed)
4. Export via right-click → import in another project

### Type system
- `Bytes` (yellow): Uint8Array / bytes — keys, ciphertext, seeds
- `IntList` (blue): number[] / list[int] — polynomial coefficients, state words
- `Number` (pink): native Blockly number — scalar parameters

Blockly enforces connection types — mismatched connections are rejected.

---

## Related Docs

- [demo file index](../../demos/README.en.md) — all pre-built workspaces + official-vector verification commands
- [Block index](../blocks/INDEX.md) — complete list of all custom blocks
- [Architecture](./ARCHITECTURE.en.md) — system architecture and data flow
- [Development guide](./DEVELOPMENT.en.md) — environment setup, adding blocks
- [Type system](./TYPE-SYSTEM.en.md) — data type spec and conversion rules
