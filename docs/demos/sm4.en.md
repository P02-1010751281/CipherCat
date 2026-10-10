# SM4 Demos


> [← Back to index](../guides/DEMO.en.md) · [demo file index](../../demos/README.en.md)
>
> Round function and S-box lookup, per the [Demo guide](../guides/DEMO.en.md).

---

> Step-by-step block chains live in the [assembly guide](../build/INDEX.en.md); this page covers the scenario, inputs/outputs, and boundaries.

## Scenario 1: SM4 Round Function (5 min)

### Goal
Inspect one SM4 round. The `sm4_round_func` block already performs both the S-box substitution and linear transform L; this demo does not split L into a second block.

### Steps

1. **Load demo**: import `demos/SM4-Atomic-Round.json`
2. **Inspect**:
   - Four input variables `i`, `j`, `k`, and `m`, each representing a 32-bit state word as a four-byte big-endian list
   - `RK` is supplied directly as the number `0xF12186F9`
   - Variable `n` receives the four-byte result of `sm4_round_func(i,j,k,m,RK)`
   - `sm4_round_func` computes `F = X0 ⊕ L(τ(X1 ⊕ X2 ⊕ X3 ⊕ RK))`; the S-box and L are internal to this block
3. **Generate**: click "▶" and choose JavaScript or Python
4. **Verify**: `n` is `27fad345`, the first-round output in GB/T 32907-2016 Appendix A.1; this is one round vector, not a complete encryption suite

### Atomic blocks
| Block | Function | Standard |
|----|------|------|
| `sm4_round_func` (used in this workspace) | Full single-round F, including the S-box and L | GB/T 32907-2016 §7.3 |
| `variables_set` / `variables_get` | variable assign/read | Blockly built-in |

`sm4_linear_transform` is available as a separate primitive but is not in this workspace. To inspect L alone, build `data_value(B) → sm4_linear_transform → variables_set(C)` and inspect C in the generated code. For `B=[0x00,0x00,0x00,0x01]`, standard equation (3) gives `C=[0x01,0x04,0x04,0x05]`. Do not connect L after `sm4_round_func`: that would compute `L(F(...))`, not the L step inside F.

---

## Scenario 6: SM4 S-box Lookup (3 min)

### Goal
Wrap the `sm4_sbox` atomic block with `procedures_defreturn`; check the GB/T 32907-2016 Appendix A S-box table.

### Steps

1. **Load demo**: import `demos/procedures/SM4-Sbox.json`
2. **Inspect**:
   - `procedures_defreturn`: name `SM4_Sbox`, param `x: int`
   - RETURN: `sm4_sbox(x)` lookup
3. **Generate**: click "▶", pick Python or JavaScript
4. **Verify**:
   - Python: `SM4_Sbox(1)` → `144` (0x90)
   - Standard sample: S(0x01)=0x90 (GB/T 32907-2016 Appendix A)

### Blocks
| Block | Function |
|----|------|
| `sm4_sbox` | SM4 8×8 S-box lookup (GB/T 32907-2016) |
| `procedures_defreturn` | define a typed-parameter function |

---

## Manual Assembly: SM4 Round Function (from scratch)

No demo import — build scenario 1's round function from the toolbox:

1. **Drag**: toolbox "Symmetric" category → drag out `sm4_round_func` (round function F)
2. **Wire state words**: X0-X3 accept `IntList`, with each input represented by a four-byte big-endian list (for example, `[0x01,0x23,0x45,0x67]`). RK accepts `Number`, for example `0xF12186F9`.
3. **Connection check**: connect four-byte lists to X0-X3 and a number to RK; `sm4_round_func` returns a four-byte list.
4. **Inspect L separately (optional)**: add another `data_value` containing a four-byte big-endian value `B`, connect it to `sm4_linear_transform`, and connect that result to `variables_set` as `C`. For example, `B=[0x00,0x00,0x00,0x01]` gives `C=[0x01,0x04,0x04,0x05]`; do not apply L to the completed F output.
5. **Generate**: ▶ Generate → JavaScript / Python
6. **Verify**: output is a four-byte list representing the next state word `X4` in big-endian order

> Both constructions call the complete single-round `sm4_round_func`. The demo stores its four inputs in variables and writes the result to `n`; a manual workspace can provide inputs directly with `data_value` blocks.

---

This page compares the workspace-generated variable `n` with the GB/T 32907-2016 Annex A.1 first-round value `27fad345`; `SM4-Sbox.json` separately checks S(0x01)=0x90. Both cover only the listed samples, not full algorithm certification.

---

## Corresponding Standard Guides

| Standard | Guide |
|----------|-------|
| GB/T 32907 SM4 | No build guide yet (standard text & algorithm breakdown: [`standards/gbt32907-SM4/`](../standards/gbt32907-SM4/README.md)) |
| GB/T 32905 SM3 | No build guide yet (standard text: [`standards/gbt32905-SM3/`](../standards/gbt32905-SM3/README.md)) |

> For standards with build guides, see the [standards/COVERAGE.en.md](../standards/COVERAGE.en.md) coverage matrix.
