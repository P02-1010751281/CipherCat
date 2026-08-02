# SM2 Demos

> [中文](./sm2.md)

> [← Back to index](../guides/DEMO.en.md) · [demo file index](../../demos/README.en.md)
>
> Scenario 8 (point multiplication), per the `docs/DEMO.md` index.

---

## Scenario 8: SM2 Point Multiplication (10 min)

### Goal
Build scalar multiplication on the sm2p256v1 curve with ECC statement blocks; verify the GB/T 32918.5-2017 official vector k·G.

### Steps

1. **Load demo**: import `demos/procedures/SM2-PointMul.json`
2. **Inspect** (`procedures_defreturn` with STACK statements + RETURN value):
   - STACK: `ecc_load_curve_params` (sm2p256v1 a/b/p) → `ecc_load_point` (G coords) → `ecc_multiply` (k·G → variable R)
   - RETURN: variable R (point `{x, y}`)
3. **Generate**: click "▶", pick Python or JavaScript
4. **Verify**:
   - output x = `04ebfc71 8e8d1798 ...`, y = `e858f9d8 1e5430a5 ...`
   - official vector: k·G x-coordinate matches the GB/T 32918.5-2017 example (k = `59276E27...`)

> The JS generator now uses BigInt — 256-bit field arithmetic requires arbitrary precision; plain numbers overflow.

### Blocks
| Block | Function |
|----|------|
| `ecc_load_curve_params` | set curve a/b/p |
| `ecc_load_point` | define a curve point (G) |
| `ecc_multiply` | double-and-add scalar multiplication k·G |

---

## Manual Assembly: SM2 Point Multiplication k·G (from scratch)

1. **Curve params**: toolbox "ECC" → drag `ecc_load_curve_params`, fill SM2 recommended curve parameters (p/a/b/G/n; see `gbt32918-SM2/` standards dir)
2. **Base point**: drag `ecc_load_point` with G's x/y coordinates
3. **Scalar multiply**: drag `ecc_multiply`, connect curve, base point and scalar k (`data_value`) in order
4. **Generate**: ▶ Generate (JS generator uses BigInt — no overflow in 256-bit field arithmetic)
5. **Verify**: k·G x-coordinate = `0x04ebfc71...` (GB/T 32918.5 official vector)

> Compare: `demos/procedures/SM2-PointMul.json` wraps the same chain in a function; the manual version wires it directly on the workspace.

---

**Official-vector verification**: `node dist-verify/verify-demo.js demos/procedures/SM2-PointMul.json --exec` → `=== ALL VECTORS PASS ===`
