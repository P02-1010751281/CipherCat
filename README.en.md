# CipherCat · Schrödinger's Cat Editor

> [中文](./README.md)

🐱 A visual programming platform for post-quantum cryptography — built on Blockly and Vue 3.

> "The cat is both alive and dead until you open the box.  
> Your cipher is both secure and broken until you audit the code."

## Features

- 🔮 **Post-quantum cryptography** — a full suite of post-quantum primitives such as NTT/INTT, encode/compress, SampleNTT (the core highlight)
- 🔐 **Comprehensive crypto coverage** — symmetric ciphers (S-Box, bitwise operations), hash functions (SM3/SHA), number-theoretic operations
- 🧩 **Visual programming** — drag and drop blocks to write crypto code like building with LEGO
- 🌐 **Multilingual** — Chinese/English UI, Blockly blocks switch in sync
- 💻 **Code generation** — generate executable JavaScript / Python code in one click
- 📁 **Project management** — multi-project local management based on IndexedDB, with auto-save
- 🖥️ **Desktop app** — Tauri wrapper, runs natively on Windows / Linux / macOS
- 📱 **Responsive** — adapts to wide and narrow screens, panels resizable by dragging

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev          # → http://localhost:3001

# Build the production bundle
npm run build

# Tauri desktop app
npm run tauri:dev    # development mode
npm run tauri:build  # package
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 (Composition API + TypeScript) |
| Visual programming | Blockly 12.x |
| Code highlighting | highlight.js |
| Desktop wrapper | Tauri 2.x |
| Build tooling | Vite + vue-tsc |
| Code standards | ESLint 9.x |
| Local storage | IndexedDB (idb) |

## Project Structure

```
src/
├── App.vue                     # Main editor view
├── main.ts                     # Application entry
├── router/                     # Routes (editor + docs + project management)
├── views/                      # Page views (ProjectList / DocsView)
├── blocks/                     # Blockly block definitions (grouped by category)
│   ├── ctrl/ data/ array/ logic/ bitwise/ sbox/ hash/
│   ├── symmetric/ numtheory/ ecc/ post-quantum/
│   ├── procedure/              # Function templates + Blockly native procedure overrides
│   └── remaining.ts            # Math primitives + HMAC + encoding utilities
├── generators/                 # Code generators
│   ├── javascript/             # JavaScript generation
│   └── python/                 # Python generation
├── composables/                # Vue Composables
│   ├── locale.ts               # Internationalization (zh/en)
│   ├── generator.ts            # Code generation logic
│   ├── useEditorProject.ts     # Project management
│   └── useProjectDB.ts         # IndexedDB operations
├── constants/                  # Constant configuration
│   ├── block-types.ts          # Type system
│   ├── code-languages.ts       # Supported languages
│   └── workspace-config.ts     # Blockly workspace configuration
├── components/                 # Shared components
│   ├── BlocklyEditor.vue       # Blockly editor component
│   ├── CodePreviewer.vue       # Code previewer
│   └── CryptoFunctionPanel.vue # Function template management panel
├── utils/                      # Utility functions (toolbox-config / migration / markdown)
├── styles/                     # Global styles / CSS variables
└── assets/                     # Static assets
```

## Supported Crypto Modules (98 custom blocks, 13 categories)

| Category | Blocks | Blocks |
|------|------|--------|
| Control flow | 1 | Loop iteration |
| Basic math | 7 | Modular arithmetic (Mod/ModPow/DivRem), big-number BN add/sub/mul/div |
| Array | 1 | Array partition |
| Data & conversion | 9 | Value input, seed (bytes/hex), key derivation, bit/byte length, type conversion |
| Bitwise | 8 | AND/OR/XOR, NOT, shifts, rotate, byte substitution, infix expression |
| Logic | 3 | Logical operations, compound operations, NOT |
| S-Box | 4 | S-Box define/substitute, S-Box variable read/write |
| Hash | 18 | SM3 compress/pad, SHA-256 compress/pad, SHA-3 Keccak-f/absorb/squeeze/pad, SHAKE XOF/PRF, HMAC |
| Symmetric ciphers | 12 | AES four-step operations, SM4 round function/linear transform, ECB/CBC/CTR modes, PKCS#7/zero padding |
| Number theory | 10 | NTT/INTT, NTT butterfly/multiply, field addition, modular inverse, GF(2⁸) multiplication, polynomial add/sub, matrix×vector |
| Elliptic curves | 5 | Curve parameter load, point load, point doubling, point addition, scalar multiplication |
| Post-quantum | 11 | Encode/decode, compress/decompress, byte concat/slice, SampleNTT, SamplePolyCBD |
| Encoding utilities | 5 | Base64 encode/decode, Hex↔Bytes, byte order conversion |
| Function wrappers | 4 | crypto_return, encrypt/decrypt/hash function templates |

> 98 custom blocks in total (`ALL_BLOCK_TYPES` in `src/blocks/index.ts`); plus 27 `proc_*` function templates and Blockly native procedure blocks (function wrapper category).

## Code Generation Example

Drag blocks → generate executable code in one click, using the Kyber (FIPS 203) NTT post-quantum primitive as an example:

### Python

```python
def ntt(a, q=3329, n=256):
    """FIPS 203 Cooley-Tukey NTT with bit-reversed zetas (Algorithm 6)"""
    gen = 17 if q == 3329 else 3
    res = list(a)
    ln = len(res)
    def _brv(x, bits):
        r = 0
        for _ in range(bits):
            r = (r << 1) | (x & 1)
            x >>= 1
        return r
    nbits = n.bit_length() - 1
    stride = ln // 2
    zz = 0
    while stride >= 2:  # FIPS 203 Alg 6: for(len=128; len>=2; len>>=1)
        for start in range(0, ln, stride * 2):
            zz += 1
            zp = pow(gen, _brv(zz, nbits - 1), q)
            for i in range(start, start + stride):
                u = res[i]
                t = (zp * res[i + stride]) % q
                res[i] = (u + t) % q
                res[i + stride] = (u - t + q) % q
        stride >>= 1
    return res

# Pointwise multiplication in the NTT domain
result = ntt_mul(ntt_a, ntt_b, q=3329)
```

### JavaScript

```javascript
function ntt(a, q = 3329, n = 256) {
    const gen = (q === 3329) ? 17 : 3;
    const res = a.slice();
    const len = res.length;
    const brv = (x, bits) => {
        let r = 0;
        for (let i = 0; i < bits; i++) { r = (r << 1) | (x & 1); x >>= 1; }
        return r;
    };
    const nbits = Math.log2(n) | 0;
    let stride = len / 2;
    let zz = 0;
    while (stride >= 2) {  // FIPS 203 Alg 6: for(len=128; len>=2; len>>=1)
        for (let start = 0; start < len; start += stride * 2) {
            zz++;
            const zp = modPow(gen, brv(zz, nbits - 1), q);
            for (let i = start; i < start + stride; i++) {
                const u = res[i];
                const t = (zp * Number(res[i + stride])) % q;
                res[i] = (u + t) % q;
                res[i + stride] = (u - t + q) % q;
            }
        }
        stride >>= 1;
    }
    return res;
}
```

## License

[MIT](LICENSE)
