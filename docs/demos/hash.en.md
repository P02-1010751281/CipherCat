# Hash Demos


> [← Back to index](../guides/DEMO.en.md) · [demo file index](../../demos/README.en.md)
>
> Scenario 3 (SHA-256) + Scenario 7 (SM3), per the `docs/DEMO.md` index.

---

## Scenario 3: SHA-256 Hash (5 min)

### Goal
Compute a SHA-256 hash of text; understand the padding and compression steps.

### Steps

1. **Load demo**: import `demos/SHA256-Atomic-Hash.json`
2. **Inspect**:
   - `data_value`: "abc" (the classic SHA-256 test vector)
   - `hash_sha256_pad`: padding (append 1+0*+64-bit length), outputs 512-bit block list
   - `hash_sha256_compress`: 64-round compression (σ0 σ1 Σ0 Σ1 Ch Maj bit ops)
3. **Generate**: click "▶", pick JavaScript
4. **Verify**: output is 8×32-bit integers = 256-bit digest

### Atomic blocks
| Block | Function | Standard |
|----|------|------|
| `data_text` | UTF-8 text input | — |
| `hash_sha256_pad` | SHA-256 message padding | FIPS 180-4 §5.1 |
| `hash_sha256_compress` | 64-round compression | FIPS 180-4 §6.2 |

### Verification
SHA-256("abc") = `ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad`. Run the generated code and compare.

---

## Scenario 7: SM3 Hash (10 min)

### Goal
Build SM3 padding + compression with atomic blocks, wrap as `SM3_Hash(msg)`, verify the GB/T 32905-2016 official vector.

### Steps

1. **Load demo**: import `demos/procedures/SM3-Hash.json`
2. **Inspect**:
   - `procedures_defreturn`: name `SM3_Hash`, param `msg: message`
   - RETURN: `hash_sm3_compress(V=IV const, W=hash_sm3_pad(msg))`
   - IV const = 8 32-bit words (`0x7380166f, 0x4914b2b9, ...`) via a `data_value` array literal
3. **Generate**: click "▶", pick Python or JavaScript
4. **Verify**:
   - Python: `SM3_Hash("abc")` → `66c7f0f4 62eeedd9 ... b0fb0e4e`
   - Official vector: SM3("abc") = `66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0` (GB/T 32905-2016 A.1)

> Note: the demo covers the single-block path (≤55 bytes); multi-block needs a `ctrl_iterate` loop, left as an extension.

### Blocks
| Block | Function |
|----|------|
| `hash_sm3_pad` | SM3 message padding (1‖0*‖64-bit length) |
| `hash_sm3_compress` | CF compression (64 rounds, W/W′ expanded internally) |
| `data_value` | pass-through expression (IV array literal) |

---

## Manual Assembly: SM3 Hash (from scratch)

1. **Drag**: toolbox "Hash" → drag `hash_sm3_pad` (message padding 1‖0*‖64-bit length)
2. **Message**: drag `data_value` with the message (e.g. text `"abc"`) into pad input
3. **Compress**: drag `hash_sm3_compress`; connect pad output to its input; fill IV input with `data_value` — SM3 initial values (`0x7380166F` `0x4914B2B9` `0x172442D7` `0xDA8A0600` `0xA96F30BC` `0x163138AA` `0xE38DEE4D` `0xB0FB0E4E`)
4. **Generate**: ▶ Generate → `sm3_compress(IV, hash_sm3_pad(msg))`
5. **Verify**: `SM3("abc") = 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0` (GB/T 32905 A.1 official vector)

> Note: single-block messages (≤55 bytes) use the direct chain; multi-block needs a `ctrl_iterate` loop compressing block by block (left as an extension in the demo).

---

**Official-vector verification**: `node dist-verify/verify-demo.js demos/procedures/SM3-Hash.json --exec` → `=== ALL VECTORS PASS ===`
