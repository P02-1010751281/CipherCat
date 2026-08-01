# SM4 Demos

> [中文](./sm4.md)

> [← Back to index](../DEMO.en.md) · [demo file index](../../demos/README.en.md)
>
> Scenario 1 (round function) + Scenario 6 (S-box lookup), per the `docs/DEMO.md` index.

---

## Scenario 1: SM4 Round Function (5 min)

### Goal
Build SM4's round function F and linear transform L with atomic blocks; understand national standard §7.3.

### Steps

1. **Load demo**: import `demos/SM4-Atomic-Round.json`
2. **Inspect**:
   - 5 `variables_set`: X0 X1 X2 X3 (4 32-bit state words) + RK (round key)
   - `sm4_round_func`: F(X0,X1,X2,X3,rk) = (X0⊕X1⊕X2⊕X3⊕rk) through S-box + L
   - `sm4_linear_transform`: L(B) = B ⊕ (B<<<2) ⊕ (B<<<10) ⊕ (B<<<18) ⊕ (B<<<24)
3. **Generate**: click "▶" and pick JavaScript
4. **Verify**: output is a 4-word integer list (new X0 X1 X2 X3)

### Atomic blocks
| Block | Function | Standard |
|----|------|------|
| `sm4_round_func` | F(X0,X1,X2,X3,rk) | GM/T 0002 §7.3 |
| `sm4_linear_transform` | L(B) 32-bit rotations | GM/T 0002 §7.2.2 |
| `variables_set` / `variables_get` | variable assign/read | Blockly built-in |

---

## Scenario 6: SM4 S-box Lookup (3 min)

### Goal
Wrap the `sm4_sbox` atomic block with `procedures_defreturn`; verify the GM/T 0002-2012 S-box table.

### Steps

1. **Load demo**: import `demos/procedures/SM4-Sbox.json`
2. **Inspect**:
   - `procedures_defreturn`: name `SM4_Sbox`, param `x: int`
   - RETURN: `sm4_sbox(x)` lookup
3. **Generate**: click "▶", pick Python or JavaScript
4. **Verify**:
   - Python: `SM4_Sbox(1)` → `144` (0x90)
   - Official vector: S(0x01)=0x90 (GM/T 0002-2012 appendix)

### Blocks
| Block | Function |
|----|------|
| `sm4_sbox` | SM4 8×8 S-box lookup (GM/T 0002-2012) |
| `procedures_defreturn` | define a typed-parameter function |

---

**Official-vector verification**: `node dist-verify/verify-demo.js demos/procedures/SM4-Sbox.json --exec` → `=== ALL VECTORS PASS ===`
