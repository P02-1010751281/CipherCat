# AES Demos


> [← Back to index](../guides/DEMO.en.md) · [demo file index](../../demos/README.en.md)
>
> Scenario 2 (single-round encryption) + Scenario 5 (function wrapping), per the `docs/DEMO.md` index.

---

## Scenario 2: AES Single-Round Transformation (10 min)

### Goal
Run one AES round in the FIPS 197 §5.1 order. `AES-Atomic-Round.json` places four primitives at the workspace top level; generated code calls them in order and mutates shared state in place. They are not joined by value connections. See `demos/procedures/AES-Round.json` for explicit dataflow connections.

### Steps

1. **Load demo**: import `demos/AES-Atomic-Round.json`
2. **Inspect**:
   - `variables_set`: 16-byte state and round key in shared variables `i` and `j`
   - Four top-level primitives: `aes_sub_bytes`, `aes_shift_rows`, `aes_mix_columns`, and `aes_add_round_key`
3. **Execution order**: generated code calls the primitives in workspace order and mutates the same state; their value sockets are not connected on the canvas
4. **Generate**: click **Generate**, select Python or JavaScript, then run the code in your own environment
5. **Verify**: the repository regression checks `4807f3cfdcc929d006f1297cdb24c59f` for the configured state and round key. This is a fixed-input project regression value, not a complete FIPS 197 Appendix C.1 encryption vector.

### Atomic blocks
| Block | Function | Standard |
|----|------|------------|
| `aes_sub_bytes` | 16-byte S-Box substitution | FIPS 197 §5.1.1 |
| `aes_shift_rows` | row cyclic shift | FIPS 197 §5.1.2 |
| `aes_mix_columns` | GF(2⁸) mix columns | FIPS 197 §5.1.3 |
| `aes_add_round_key` | state ⊕ round key | FIPS 197 §5.1.4 |

---

## Scenario 5: Function Wrapping (5 min)

### Goal
Use `procedures_defreturn` (Blockly function definition) to wrap an AES single-round chain in a reusable function. This demo uses explicit value connections between stages.

### Steps

1. **Load demo**: import `demos/Procedure-AES-Round.json`
2. **Inspect**:
   - `procedures_defreturn`: name `AES_Round`, params `state: int_list` + `round_key: int_list` (added via the gear ⚙ mutator)
   - return chain: `aes_add_round_key(aes_mix_columns(aes_shift_rows(aes_sub_bytes(state))), round_key)`
3. **Generate**: click "▶", pick Python
4. **Output**:
   ```python
   def aes_round(state: list[int], round_key: list[int]) -> list[int]:
       """AES_Round"""
       # AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)
       ...
   ```
5. **Call**: find `AES_Round` in the workspace flyout, drag out and feed state and round_key

### Export & reuse
- Right-click the function block → "📤 Export function block" → save `.json`
- Other projects → "📥 Import function" at the flyout bottom

### Blocks
| Block | Function |
|----|------|
| `procedures_defreturn` | define a typed-parameter function |
| `crypto_encrypt_func` (template) | preset encrypt function template |
| `crypto_decrypt_func` (template) | preset decrypt function template |
| `crypto_return` | explicit return statement |
---

## Manual Assembly: AES Single Round (from scratch)

1. **Drag**: toolbox "Symmetric" → drag out `aes_sub_bytes` (byte substitution)
2. **Chain**: connect `aes_sub_bytes` to the state, nest `aes_shift_rows` and `aes_mix_columns`, then place `aes_add_round_key` outermost and connect the round key: `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)`
3. **State input**: drag `data_value` with a 16-byte state (IntList, e.g. `[0x00,0x01,...,0x0F]`) into `aes_sub_bytes`
4. **Round key**: drag `data_value` with a 16-byte round key into `aes_add_round_key`'s ROUND_KEY input
5. **Generate**: ▶ Generate
6. **Verify**: check for a 16-byte output; the fixed-input regression is `4807f3cfdcc929d006f1297cdb24c59f`, not an official FIPS Appendix C.1 full-encryption vector

> This page demonstrates one round, not a complete AES-128 encryption interface. A complete flow must correctly connect the initial AddRoundKey, round keys from key expansion, nine normal rounds, and the final round. The current templates provide a single-round structure and an empty key-expansion loop scaffold; they are not a complete, validated AES-128 end-to-end template.

---

## Corresponding Standard Guides

| Standard | Guide |
|----------|-------|
| FIPS 197 AES | No build guide yet (standard text & algorithm breakdown: [`standards/fips197-AES/`](../standards/fips197-AES/README.md)) |

> For standards with build guides, see the [standards/COVERAGE.en.md](../standards/COVERAGE.en.md) coverage matrix.
