# ZUC Stream Cipher Block Reference (GB/T 33133)


ZUC is a Chinese national stream cipher, core component of 3GPP 128-EEA3/EIA3. Blockly provides atomic blocks for the algorithm components (two 8×8 S-boxes, two 32-bit linear transforms, and the non-linear function F), plus a `zuc_keystream` block that manages the complete stateful loop.

## Document role and evidence entry points

This is the stream-cipher detail page under the [block overview](INDEX.en.md). ZUC is a stream cipher, not post-quantum cryptography; EEA3/EIA3 are higher-level mobile-communications algorithms and must not be conflated with the ZUC atomic functions.

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [GB/T 33133 ZUC](../standards/gbt33133-ZUC/), [coverage matrix](../standards/COVERAGE.en.md); 3GPP LTE context explains EEA3/EIA3 parameter construction |
| Implementation | the corresponding blocks in the toolbox and their code generators |
| Example workspaces | [Demo guide](../guides/DEMO.en.md), [EEA3 workspace](../../demos/procedures/EEA3.json), [EIA3 workspace](../../demos/procedures/EIA3.json) |
| Boundary | Covers ZUC-128 keystream, an EEA3 teaching chain, and EIA3 MAC generation; this does not imply certification, constant-time behavior, or production security |

## ZUC (GB/T 33133-2016)

| Block | Layer | Connection | Input→Output | Description |
|-------|-------|-----------|--------------|-------------|
| `zuc_s0` | 1 | value(→) | Number→Number | 8×8 S0 S-box lookup (Appendix A.1); input must be an integer from 0 to 255 |
| `zuc_s1` | 1 | value(→) | Number→Number | 8×8 S1 S-box lookup (Appendix A.2); input must be an integer from 0 to 255 |
| `zuc_l1` | 1 | value(→) | Number→Number | L1 linear transform; input must be an unsigned 32-bit integer: X⊕(X<<<2)⊕(X<<<10)⊕(X<<<18)⊕(X<<<24) |
| `zuc_l2` | 1 | value(→) | Number→Number | L2 linear transform; input must be an unsigned 32-bit integer: X⊕(X<<<8)⊕(X<<<14)⊕(X<<<22)⊕(X<<<30) |
| `zuc_f` | 1 | value(→) | Number×5→Number | Non-linear function F(X0,X1,X2,R1,R2)→W; all five inputs must be unsigned 32-bit integers |
| `zuc_keystream` | 2 | value(→) | Bytes×2 + Number→IntList | Complete ZUC-128 keystream algorithm; takes a 16-byte key, 16-byte IV, and output-word count, and manages initialization, state updates, and work mode |
| `zuc_eia3` | 2 | value(→) | Bytes×2 + Number×4→Number | 128-EIA3 integrity code: 16-byte key, 32-bit COUNT, 5-bit BEARER, DIRECTION, message and bit length; returns a 32-bit MAC-I |

## Assembly Notes

- **S-box interleave**: 32-bit S(x) = S0(x>>24) ‖ S1(x>>16) ‖ S0(x>>8) ‖ S1(x) — done inside `zuc_f`; can be decomposed for teaching
- **Full flow and atomic blocks**: `zuc_keystream` manages R1/R2 and LFSR state across 32 initialization rounds, the discarded round, and work mode. The atomic `zuc_f` block exposes W for inspecting F but does not manage cross-round state. Use `zuc_keystream` or the keystream Procedure template for the complete flow.
- **Vector coverage**: Unit regressions cover GB/T 33133.1 Appendix C keystream vectors C1 (all-zero), C2 (key and IV are each 16 bytes of `0xFF`), and C3 (random) in both Python and JavaScript. Demo regression additionally covers the EEA3 vector from GB/T 33133.2 Appendix A.1 and EIA3 Examples 1 and 2 from GB/T 33133.3-2021 Appendix B. The build guide lists all three Appendix C inputs and expected outputs, with links to the original PDF pages for [C1 input/output (physical p. 13)](../standards/gbt33133-ZUC/GBT-33133.1-2016.pdf#page=13), [C1 state table and C2 (physical p. 14)](../standards/gbt33133-ZUC/GBT-33133.1-2016.pdf#page=14), and [C3 (physical p. 15)](../standards/gbt33133-ZUC/GBT-33133.1-2016.pdf#page=15).
- **Keystream inputs**: `zuc_keystream` requires a 16-byte key, a 16-byte IV, and a non-negative integer output length. The generator also applies a resource limit to output length; this is not a limit in the standard algorithm.
- **EIA3 vectors**: GB/T 33133.3-2021 Appendix B Examples 1 and 2 (1-bit and 577-bit messages) pass in generated Python and JavaScript; invalid parameters are also rejected
- **Primitive inputs**: S0/S1 reject non-integers and values outside 0–255; L1/L2/F reject non-integers and values outside the unsigned 32-bit range. Integer-valued floats (for example, `1.0`) are treated as their corresponding integers.

## Data Source

S0/S1 S-box data is compared item by item against the GB/T 33133.1 Appendix A.1/A.2 tables extracted in this repo's `docs/standards/gbt33133-ZUC/00-Standard-Source.md`.
