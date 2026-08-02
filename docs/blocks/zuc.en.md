# ZUC Stream Cipher Block Reference (GB/T 33133)

> [English](./zuc.en.md) · [中文](./zuc.md)

ZUC is a Chinese national stream cipher, core component of 3GPP 128-EEA3/EIA3. Atomic blocks follow the algorithm structure: two 8×8 S-boxes + two 32-bit linear transforms + the non-linear function F.

## ZUC (GB/T 33133-2016)

| Block | Layer | Connection | Input→Output | Description |
|-------|-------|-----------|--------------|-------------|
| `zuc_s0` | 1 | value(→) | Number→Number | 8×8 S0 S-box lookup (Appendix A.1) |
| `zuc_s1` | 1 | value(→) | Number→Number | 8×8 S1 S-box lookup (Appendix A.2) |
| `zuc_l1` | 1 | value(→) | Number→Number | L1 linear transform: X⊕(X<<<2)⊕(X<<<10)⊕(X<<<18)⊕(X<<<24) |
| `zuc_l2` | 1 | value(→) | Number→Number | L2 linear transform: X⊕(X<<<8)⊕(X<<<14)⊕(X<<<22)⊕(X<<<30) |
| `zuc_f` | 1 | value(→) | Number×5→Number | Non-linear function F(X0,X1,X2,R1,R2)→W, with S0/S1 interleave + L1/L2 |

## Assembly Notes

- **S-box interleave**: 32-bit S(x) = S0(x>>24) ‖ S1(x>>16) ‖ S0(x>>8) ‖ S1(x) — done inside `zuc_f`; can be decomposed for teaching
- **F memory registers**: `zuc_f` is a pure function returning W; R1'/R2' updates are documented in the generator comment — a full keystream loop needs external variables (32 init rounds + work mode)
- **Official vectors**: GB/T 33133 Appendix C (all-zero / all-ones / random) verified in both Python and JavaScript

## Data Source

S0/S1 S-box data cross-checked against the ETSI TS 135 222 reference implementation (luminousmen/ZUC); S0 matches this repo's `docs/standards/gbt33133-ZUC/01-ZUC.md` Appendix A.1.
