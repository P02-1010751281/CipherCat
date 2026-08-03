# SM4 Demos


> [← Back to index](../guides/DEMO.en.md) · [demo file index](../../demos/README.en.md)
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

## Manual Assembly: SM4 Round Function (from scratch)

No demo import — build scenario 1's round function from the toolbox:

1. **Drag**: toolbox "Symmetric" category → drag out `sm4_round_func` (round function F)
2. **Wire state words**: `sm4_round_func` has 4 state-word inputs (X0-X3) + round key rk:
   - Drag 4 `data_value` blocks ("Data" category), fill 32-bit hex words (e.g. `0x01234567` / `0x89ABCDEF` / `0xFEDCBA98` / `0x76543210`), connect to X0..X3
   - Drag one more `data_value` for round key rk (e.g. `0x01234567`)
3. **Connection check**: X0..X3/rk are all Number type — plugs turn green when connectable
4. **Linear transform** (optional): drag `sm4_linear_transform` onto F's output to see L(B) rotate-xor composition
5. **Generate**: ▶ Generate → JavaScript / Python
6. **Verify**: output is a 4-word integer list (round output = new state)

> Compare: identical block topology to `demos/SM4-Atomic-Round.json` (demo stores intermediates in variables_set; manual uses direct data_value inputs).

---

**Official-vector verification**: `node dist-verify/verify-demo.js demos/procedures/SM4-Sbox.json --exec` → `=== ALL VECTORS PASS ===`
