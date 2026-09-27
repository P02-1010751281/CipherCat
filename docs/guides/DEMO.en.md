# Demo guide


Pre-built Blockly workspace examples built from atomic blocks: top-level atomic demos show the block chain directly, while Procedure demos place the same chains inside reusable functions; no convenience-wrapper blocks are used. Split into per-algorithm docs; corresponding demo files are listed in the [demos/README.md](../../demos/README.en.md) file index:

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

## Quick start

The recommended entry point for platform operation is the [user tutorial](./TUTORIALS.en.md). This page is the algorithm-oriented demo index and records the corresponding workspace, vector, and function-wrapping information.

1. Open the editor → choose "More → Import Workspace" → select a `.json` file from `demos/`;
2. Check the block wiring → choose "Generate" to view JavaScript/Python output;
3. Open a function-wrapping demo and inspect its calls from other flows.

![Import-workspace entry in the More menu (interface example)](/docs-assets/tutorials/03-import-menu.png)

_Figure: Start by choosing Import Workspace from the More menu._

![Imported AES atomic-round workspace (interface screenshot)](/docs-assets/tutorials/04-editor-imported.png)

_Figure: The imported workspace shows the AES atomic-block chain. Choose Generate to display its code._

![Generated Python code (interface screenshot)](/docs-assets/tutorials/05-generated-python.png)

_Figure: The generated-code panel displays Python for the current workspace._

## Demo verification status

All 59 registered demos are checked by the automated harness in both Python and JavaScript. Test specifications include standard vectors, property assertions, and independent cross-checks; commands and results are listed in [demos/README.en.md](../../demos/README.en.md).

---

## Going further

### Atomic block chains
The following round-function examples are direct atomic-block chains (convenience composites removed):
- The AES atomic demo calls four primitives on shared state in workspace order; explicit value connections are in `demos/procedures/AES-Round.json`.
- SM4 round = `sm4_round_func` (includes S-box + L transform details)

### Custom function wrapping
1. Select the crypto pipeline you built
2. Wrap it in `procedures_defreturn`
3. Set parameter types (bytes / int_list / poly / seed)
4. Export via right-click → import in another project

### Data types and connections

Types determine which blocks can connect and describe what the data means. See the [user guide’s introduction to data types and block connections](./USER-GUIDE.en.md) for the basics; runtime mappings, value ranges, and full compatibility rules are in the [Type System specification for developers](./TYPE-SYSTEM.en.md).

---

## Related docs

- [demo file index](../../demos/README.en.md) — all pre-built workspaces + test-specification verification commands
- [Block index](../blocks/INDEX.en.md) — complete list of all custom blocks
- [Architecture](./ARCHITECTURE.en.md) — system architecture and data flow
- [Development guide](./DEVELOPMENT.en.md) — environment setup, adding blocks
- [Type System specification](./TYPE-SYSTEM.en.md) — developer reference for type mappings, ranges, and conversions
