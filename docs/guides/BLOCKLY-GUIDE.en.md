# Blockly Usage Guide


Build crypto algorithms with the Blockly 12 visual editor: drag blocks, connect by type, generate Python / JavaScript with one click. This guide covers editor operations, the type system, function templates, and algorithm assembly examples.

---

## 1. Interface Overview

```
┌──────────┬──────────────────────────────────────────┐
│ Toolbox  │          Workspace                       │
│ (categories)                                        │
│          │    Blocks dragged here connect & edit    │
│  ▸ Control flow                                     │
│  ▸ Variables                                       │
│  ▸ Math                                            │
│  ▸ Data                                            │
│  ▸ Bitwise                                         │
│  ▸ S-Box                                           │
│  ▸ Hash                                            │
│  ▸ Number theory                                   │
│  ▸ ECC                                             │
│  ▸ Post-quantum                                    │
│  ▸ Symmetric                                       │
│  ▸ Modes                                           │
│  ▸ Functions                                       │
│                                   ▶ Generate (JS/Py) │
└──────────┴──────────────────────────────────────────┘
```

- **Toolbox**: category list on the left. Click a category to reveal blocks, drag one onto the workspace.
- **Workspace**: central canvas. Zoom with Ctrl+scroll, pan by dragging.
- **Generate**: toolbar button that translates the workspace into JavaScript or Python.

## 2. Basic Operations

| Action | How |
|--------|-----|
| Add block | drag from toolbox to workspace |
| Connect | drag a block's plug (value/statement input) onto another block's socket (output); connect on highlight |
| Disconnect | drag the connected block away |
| Delete | right-click → Delete (or drag to trash / press Delete) |
| Duplicate | right-click → Duplicate |
| Undo/Redo | Ctrl+Z / Ctrl+Shift+Z |
| Zoom | Ctrl+scroll / right-click → Zoom |
| Clean up | right-click → Clean up blocks (auto-arrange) |

## 3. Data & Type System

Crypto blocks carry type annotations; **mismatched types refuse to connect** (Blockly connection checks):

| Type | Meaning | Typical blocks |
|------|---------|----------------|
| `Bytes` | byte sequence | `data_bytes_from_hex`, hash inputs |
| `IntList` | integer array (finite-field coefficients, etc.) | `pq_sample_poly_cbd`, `pq_ntt` |
| `Number` | scalar integer | `math_number`, modulus params |
| `SBox` | S-box lookup table (CSV import) | `sbox_define` |

On mismatch the plug turns red and connection is blocked — the first line of defense against algorithm-semantic errors.

**Variables**: create variables (e.g. `state`, `rk`, `block`) in the Variables category. Crypto blocks are mostly pure (return new values rather than mutating variables), which keeps generated code verifiable.

## 4. Functions & Algorithm Templates

### 4.1 Custom Functions

The Functions category uses Blockly's native procedure system:

- **＋New**: inserts a function definition with typed parameters (gear ⚙ mutator adds/removes params)
- Function body is assembled from atomic blocks; `RETURN` yields the result
- Call: drag a **call block**, pick the function from the dropdown; params sync automatically

### 4.2 Algorithm Templates (Function Manager)

The "Crypto Templates / Function Manager" area provides **28 crypto algorithm templates** (AES/SM4 encryption, hashing, HMAC, PBKDF2, ML-KEM KeyGen/Encaps, ...). **Drag-and-go**: the template auto-prefills the full atomic chain — no manual assembly:

- Round-function templates (e.g. AES round): auto-build `AES SubBytes → ShiftRows → MixColumns → AddRoundKey`
- Loop templates (key schedule / iterated hash): auto-inject `ctrl_iterate` loops (10/16/32 rounds)
- Template parameters (key/iv/nonce etc.) are left open for you to fill with data blocks

> Templates are **teaching aids that reveal algorithm structure**: every atomic step is visible and inspectable after dragging out.

### 4.3 Function Manager Panel

Toolbar "Function Manager": ＋new function, 📥 import (.json), 📤 export, and add/remove templates from the toolbox (＋📦).

## 5. Code Generation

Click **▶ Generate**; toggle between Python and JavaScript. Generated code is runnable (helpers inlined). Example — SM3 hash workspace generates:

```python
def hash_sm3_pad(msg):  # ...
    ...
def sm3_compress(v, block):  # ...
    ...
result = sm3_compress(IV, hash_sm3_pad(b"abc"))
```

Official-vector verification: the 4 demos in `demos/procedures/` (SM4-Sbox / SM3-Hash / SM2-PointMul / ML-KEM-Encaps) generate output matching official test vectors in both languages (see `scripts/verify-demo.ts`).

## 6. Import / Export

- **Workspace import**: menu → Import Workspace → pick `.json` (Blockly standard serialization)
- **Workspace export**: menu → Export Workspace → save `.json`
- **Function export**: Function Manager → select → 📤 export `.json`
- **Samples**: `demos/` ships atomic-block workspaces (`demos/README.md` is the authoritative index)

## 7. Algorithm Assembly Examples

> Full walkthroughs: [DEMO.en.md](./DEMO.en.md) and `docs/demos/{sm4,aes,hash,sm2,post-quantum}.en.md`. Minimal runnable chains below.

### 7.1 SM4 S-box lookup

```
sm4_sbox( 0x01 )  →  0x90   (GM/T 0002 official vector)
```

### 7.2 SM3 hash

```
hash_sm3_pad("abc")  →  64-byte padded block
sm3_compress(IV, block)  →  66c7f0f4…ba8e0 (GB/T 32905 official vector)
```

### 7.3 AES-128 single round

```
AES AddRoundKey(
  AES MixColumns(
    AES ShiftRows(
      AES SubBytes(state)     ← byte substitution (S-box)
    )
  ), rk)
```

### 7.4 ML-KEM-512 Encaps (FIPS 203)

```
1. Parse ek: t̂ = ByteDecode12(ek[0:768]), ρ = ek[768:800]
2. K = first 32 bytes of G(m ‖ H(ek)) (SHA3-512)
3. Â ← SampleNTT(ρ): chain pq_seed_with_nonce (ρ‖j‖i, 34 bytes)
4. ŝ ← pq_sample_poly_cbd(η₁, PRF(r, 0)); e₁/e₂ likewise (η₂, nonce offset)
5. u = INTT(Âᵀ∘ŝ) + e₁; v = INTT(t̂ᵀ∘ŝ) + e₂ + Decompress₁(m)
6. c = ByteEncode₁₀(Compress₁₀(u)) ‖ ByteEncode₄(Compress₄(v))
```

> ML-KEM has no matrix block; unroll `ntt_mul` + `poly_add` for k=2. t̂ from ek is already in NTT domain — **do NOT apply NTT again**.

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| Plug turns red, won't connect | type mismatch (check Bytes/IntList/Number) |
| Template chain incomplete after drag | template inputs (key/iv/nonce) are open; fill with data blocks |
| Generated code errors | check the template is on the main workspace (flyout preview doesn't generate) |
| Want to verify results | open `demos/procedures/*.json` and ▶ Generate against official vectors |
