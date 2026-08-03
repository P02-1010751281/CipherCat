# Data Type Specification


> Version v1.0 | 2026-07-18 | The type reference standard for all block implementations

## 1. Type Overview

| Blockly Type | Constant | Semantics | Value Range | Corresponding Python | Corresponding JavaScript |
|-------------|------|------|------|------------|----------------|
| `Bytes` | `TYPE_BYTES` | Byte sequence | `[0x00, 0xFF]` per element | `bytes` / `bytearray` | `Uint8Array` |
| `IntList` | `TYPE_INT_LIST` | Integer list | Depends on context | `list[int]` | `number[]` |
| `Bits` | `TYPE_BITS` | Bit array | `{0, 1}` per element | `list[int]` | `number[]` |
| `Number` | `TYPE_NUMBER` | Scalar integer | `[0, 2^53)` JS / arbitrary Python | `int` | `number` |
| `SBox` | `TYPE_SBOX` | S-box lookup table | 2D 4×4 ~ 32×32 | `list[list[int]]` | `number[][]` |
| `Matrix` | `TYPE_MATRIX` | Matrix (label) | 2D IntList | `list[list[int]]` | `number[][]` |
| `Vector` | `TYPE_VECTOR` | Vector (label) | 1D IntList | `list[int]` | `number[]` |

## 2. Detailed Specification per Type

### 2.1 Bytes — Byte Sequence

```
Definition: an ordered byte sequence; each element is an unsigned integer in [0x00, 0xFF].
Cryptographic semantics: keys, messages, ciphertexts, IVs, hash values, seeds, padded data.
```

| Property | Value |
|------|-----|
| Element type | `uint8` (0-255) |
| Length | Any non-negative integer, may be 0 |
| Python type | `bytes` (immutable) / `bytearray` (mutable) |
| JavaScript type | `Uint8Array` |
| Default value | `b""` / `new Uint8Array(0)` |
| Indexing | 0-based, `data[i]` returns an int |
| Slicing | `data[start:end]` returns a new Bytes |

**Conversion rules:**

| From | To | Python | JavaScript |
|----|----|--------|-----------|
| `Bytes` | `IntList` | `list(data)` | `Array.from(data)` |
| `Bytes` | `Bits` | `[(b>>j)&1 for b in data for j in range(8)]` | expand into a bit array |
| `Bytes` | `String(hex)` | `data.hex()` | `Array.from(data, b => b.toString(16).padStart(2,'0')).join('')` |
| `String(hex)` | `Bytes` | `bytes.fromhex(s)` | `Uint8Array.from(s.match(/.{2}/g), h => parseInt(h,16))` |
| `IntList` | `Bytes` | `bytes(lst)` (elements must be 0-255) | `new Uint8Array(lst)` |
| `Bits` | `Bytes` | pack every 8 bits into 1 byte | same as above |
| `Number` | `Bytes` | `n.to_bytes((n.bit_length()+7)//8, 'big')` | `new Uint8Array([...])` encoded as needed |

**Typical blocks that use Bytes:**
`seed_bytes`(output), `pq_bytes_to_bits`(input), `hash_sha256_pad`(output), `pad_pkcs7`(input/output), all hash outputs, `mode_*`(input/output)

---

### 2.2 IntList — Integer List

```
Definition: an ordered list of integers. In cryptography it carries three semantics:
  1. Polynomial coefficients: range [0, q-1], length = 256 (Kyber)
  2. NTT-domain elements: same range but different algebraic structure
  3. Big-number limbs: each element is 32-bit, little-/big-endian order
```

| Property | Value |
|------|-----|
| Element type | `int` (0 ~ q-1 or 0 ~ 2^32-1) |
| Length | Any |
| Python type | `list[int]` |
| JavaScript type | `number[]` |
| Default value | `[]` |

**Semantic distinction of subtypes:**

| Subtype | Typical value range | Typical length | Representative blocks |
|------|---------|---------|--------|
| Polynomial coefficients (Z_q) | `[0, q-1]`, q=3329 (Kyber) or q=12289 (NewHope) | 256 | `pq_sample_ntt`, `pq_ntt` |
| NTT-domain elements | same as above | 256 | `pq_ntt`(output) |
| Big-number limbs | `[0, 2^32-1]`, each element 32-bit | Any | `bn_add`, `bn_mul` |
| Generic list | any int | Any | `pq_poly_add` |

**⚠️ Key point: the difference between IntList and Bits**
Both are `number[]` at runtime, but the elements of Bits are **strictly restricted to {0,1}**. Blockly distinguishes them via the type strings `'Bits'` vs `'IntList'`; the generators are unaware of the difference (both generate `number[]`).

**Conversion rules:**

| From | To | Python | JavaScript |
|----|----|--------|-----------|
| `IntList` | `Bytes` | `bytes(lst)` (each element truncated to 0-255) | `new Uint8Array(lst)` |
| `IntList` (big-number limbs) | `Number` | `int.from_bytes(b''.join(x.to_bytes(4,'big') for x in limbs), 'big')` | compose the limbs into a big integer |
| `Number` | `IntList` (big-number limbs) | `[(n>>(i*32))&0xFFFFFFFF for i in range(limbs)]` | same logic as above |

---

### 2.3 Bits — Bit Array

```
Definition: an ordered bit sequence; each element is strictly 0 or 1.
Cryptographic semantics: bit streams, intermediate representation for encoding conversions.
```

| Property | Value |
|------|-----|
| Element type | `0` or `1` |
| Length | Any positive integer |
| Python type | `list[int]` (elements strictly 0/1) |
| JavaScript type | `number[]` (elements strictly 0/1) |
| Default value | `[]` |

**Conversion rules:**

| From | To | Method |
|----|----|------|
| `Bytes` | `Bits` | expand each byte into 8 bits (little-endian: bit j = (byte>>j)&1) |
| `Bits` | `Bytes` | pack every 8 bits into 1 byte (Σ bit_j · 2^j) |
| `Bits` | `IntList` | direct assignment (types compatible, semantics differ) |
| `IntList` | `Bits` | ⚠️ no runtime check; blocked by the Blockly type system |

**Blocks that use Bits:**
`pq_bytes_to_bits`(output → Bits), `pq_bits_to_bytes`(input ← Bits)

---

### 2.4 Number — Scalar Integer

```
Definition: a single integer value. A native Blockly type.
Used in cryptography for: lengths, indices, moduli, round counts, bit offsets.
```

| Property | Value |
|------|-----|
| Python type | `int` (arbitrary precision) |
| JavaScript type | `number` (safe range [0, 2^53-1], bitwise-operation range [0, 2^32-1]) |
| Blockly default | `0` |
| Typical cryptographic range | `[0, q-1]` (modulus), `[1, 256]` (length), `[0, 31]` (bit offset) |

**⚠️ JavaScript limitation:**
Bitwise operations in JS are automatically truncated to 32-bit. The correct approach is to use `>>> 0` to ensure unsigned behavior.

**Conversion rules:**

| From | To | Python | JavaScript |
|----|----|--------|-----------|
| `Number` | `Bytes` | `n.to_bytes((n.bit_length()+7)//8, 'big')` | construct a Uint8Array manually |
| `Number` | `IntList` (limbs) | split into 32-bit chunks | same as above |
| `Bytes` | `Number` | `int.from_bytes(data, 'big')` | BigInt / manual loop |

---

### 2.5 SBox — S-box Lookup Table

```
Definition: a 2D byte matrix used for non-linear substitution.
Managed through the Blockly variable system; the variable type is 'SBox'.
```

| Property | Value |
|------|-----|
| Dimensions | `ROW × COL`, default 16×16 |
| Element range | `[0x00, 0xFF]` |
| Representation format | 1D or 2D |
| Python type | `list[list[int]]` (2D) or `list[int]` (1D) |
| JavaScript type | `number[][]` (2D) or `number[]` (1D) |

**SBox operations:**
- `sbox`: define/edit an SBox
- `sbox_sub`: byte substitution `output = sbox[byte]` (a 32-bit word is split into 4 bytes, each looked up separately)
- `sbox_variables_get/set`: read/write through the variable system

---

### 2.6 Matrix / Vector — Matrix and Vector Labels

```
Definition: these exist only as Blockly type labels; they have no independent runtime representation.
Matrix: 2D IntList (number[][])
Vector: 1D IntList (number[])
```

| Property | Matrix | Vector |
|------|--------|--------|
| Python type | `list[list[int]]` | `list[int]` |
| JS type | `number[][]` | `number[]` |
| Typical use | the k×k matrix A of ML-KEM | the k-dimensional vectors t̂, ŝ of ML-KEM |

**⚠️ No generic matrix primitive blocks are provided.** "Matrix multiplication" in cryptography is not standard linear algebra but a composition of NTT-domain polynomial operations. The `Matrix` label is used only to prevent type confusion.

---

## 3. Type Compatibility Matrix

Indicates whether the output of a block of type A can connect to the input of a block of type B:

| Output ↓ / Input → | Bytes | IntList | Bits | Number | SBox | Matrix |
|-----------------|-------|---------|------|--------|------|--------|
| **Bytes** | ✅ | ⚠️ implicit | ❌ | ❌ | ❌ | ❌ |
| **IntList** | ⚠️ implicit | ✅ | ❌ | ❌ | ❌ | ⚠️ implicit |
| **Bits** | ⚠️ implicit | ✅ allowed | ✅ | ❌ | ❌ | ❌ |
| **Number** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **SBox** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Matrix** | ❌ | ⚠️ implicit | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ Types fully match; connect directly
- ⚠️ Runtime-compatible but requires implicit conversion (the generator inserts conversion code)
- ❌ Blockly blocks the connection

---

## 4. Type Conventions in Generators

### Python

```python
# Variable naming conventions (for easy in-generator inline checks)
data: bytes          # current seed/input bytes
padded: bytes        # padded data
state: list[int]     # internal state (16×IntList or 25×IntList)
W: list[int]         # message expansion (32-bit word list)
H: list[int]         # hash chain value list
result: bytes        # final output

# Implicit conversion patterns
isinstance(msg, list): msg = bytes(msg)     # IntList → Bytes
isinstance(x, (bytes, bytearray)): ...      # Bytes detection
int.from_bytes(data[start:end], 'big')       # Bytes → Number
```

### JavaScript

```javascript
// Implicit conversion patterns
Array.isArray(msg) ? msg = new Uint8Array(msg)   // IntList → Bytes
data instanceof Uint8Array                        // Bytes detection
(data[0] << 24) | (data[1] << 16) | ...          // Bytes → Number (big-endian)
```

## 5. Type-Check Checklist for Adding New Blocks

- [ ] Every value input declares `setCheck(TYPE_*)`
- [ ] Every value output declares `setOutput(true, TYPE_*)`
- [ ] The runtime type produced by the generator code matches the declared type
- [ ] If a type conversion is involved, the generator contains implicit conversion code
- [ ] `TYPE_MAP` already contains the three-language mapping for the type
- [ ] The type information is documented in `BLOCK-REFERENCE.md`
- [ ] The test JSON verifies the correctness of the type chain
