# AES Demos


> [← Back to index](../guides/DEMO.en.md) · [demo file index](../../demos/README.en.md)
>
> Scenario 2 (single-round encryption) + Scenario 5 (function wrapping), per the `docs/DEMO.md` index.

---

## Scenario 2: AES Single-Round Encryption (10 min)

### Goal
Chain 4 atomic blocks into one full AES round; understand the four-step FIPS 197 §5.1 structure.

### Steps

1. **Load demo**: import `demos/AES-Atomic-Round.json`
2. **Inspect**:
   - `variables_set`: 16-byte STATE + 16-byte ROUND_KEY
   - `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key`
3. **Chaining**: each block's STATE output connects to the next block's STATE input
4. **Generate**: click "▶", pick Python
5. **Verify**: output is a 16-word integer list (state matrix after one round)

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
Use `procedures_defreturn` (native Blockly function definition) to wrap an atomic-block chain into a reusable function — the end goal of crypto education: **build once, call anywhere**.

### Steps

1. **Load demo**: import `demos/Procedure-AES-Round.json`
2. **Inspect**:
   - `procedures_defreturn`: name `AES_Round`, params `state: int_list` + `round_key: int_list` (added via the gear ⚙ mutator)
   - body: `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key`
3. **Generate**: click "▶", pick Python
4. **Output**:
   ```python
   def aes_round(state: list[int], round_key: list[int]) -> list[int]:
       """AES_Round"""
       # SubBytes → ShiftRows → MixColumns → AddRoundKey
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
2. **Chain**: connect `aes_shift_rows` to SubBytes output → `aes_mix_columns` → `aes_add_round_key`, yielding `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))))`
3. **State input**: drag `data_value` with a 16-byte state (IntList, e.g. `[0x00,0x01,...,0x0F]`) into `aes_sub_bytes`
4. **Round key**: drag `data_value` with a 16-byte round key into `aes_add_round_key`'s ROUND_KEY input
5. **Generate**: ▶ Generate
6. **Verify**: 16-byte list output; single-round intermediate matches FIPS-197 C.1 appendix vector

> Full AES-128 = 10 rounds + key schedule — use the AES template in Function Manager (auto-injects ctrl_iterate loops) or unroll `ctrl_iterate` manually.

---

## Corresponding Standard Guides

| Standard | Guide |
|----------|-------|
| FIPS 197 AES | No build guide yet (standard text & algorithm breakdown: [`standards/fips197-AES/`](../standards/fips197-AES/README.md)) |

> For standards with build guides, see the [standards/COVERAGE.en.md](../standards/COVERAGE.en.md) coverage matrix.
