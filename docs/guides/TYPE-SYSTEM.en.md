# Data Type Specification


> Version v1.1 | 2026-09-25 | The type reference standard for all block implementations

> Connection checks and runtime conversions are separate. The conversion tables below show explicit expressions; they do not mean Blockly allows different types to connect. Use the connection rules and each block's declared input/output types to determine whether a connection is allowed.

## 1. Type Overview

| Blockly Type | Constant | Semantics | Value Range | Corresponding Python | Corresponding JavaScript |
|-------------|------|------|------|------------|----------------|
| `Bytes` | `TYPE_BYTES` | Byte sequence | `[0x00, 0xFF]` per element | `bytes` / `bytearray` | `Uint8Array` |
| `IntList` | `TYPE_INT_LIST` | Integer list | Depends on context | `list[int]` | `number[]` |
| `Bits` | `TYPE_BITS` | Bit array | `{0, 1}` per element | `list[int]` | `number[]` |
| `Number` | `TYPE_NUMBER` | Numeric scalar; cryptographic blocks impose their own constraints | JavaScript binary64; Python int/float | `int` / `float` | `number` |
| `SBox` | `TYPE_SBOX` | S-box lookup table | 2D 4×4 ~ 32×32 | `list[list[int]]` | `number[][]` |
| `Matrix` | `TYPE_MATRIX` | Matrix (label) | 2D IntList | `list[list[int]]` | `number[][]` |
| `Vector` | `TYPE_VECTOR` | Vector (label) | 1D IntList | `list[int]` | `number[]` |
| `String` | `TYPE_STRING` | Text | Unicode string | `str` | `string` |
| `Boolean` | `TYPE_BOOLEAN` | Boolean value | `True` / `False` | `bool` | `boolean` |
| `Array` | `TYPE_ARRAY` | Generic array label (not used by current primitive ports) | Depends on elements | `list[Any]` | `Array<unknown>` |

These names are type labels used by the project for Blockly connection checks; they do not validate runtime values or convert data automatically. `String` and `Boolean` are used for some text/curve parameters and verification results; `Array` is retained as a generic label but is not currently used by cryptographic primitive ports. Each primitive's documentation defines integer requirements and valid ranges.

## 2. Detailed Specification per Type

### 2.1 Bytes — Byte Sequence

```text
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

```text
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
| `IntList` | `Bytes` | `bytes(lst)` (requires integer elements in 0-255; out-of-range values raise `ValueError`) | `new Uint8Array(lst)` (out-of-range values wrap modulo 256; fractions truncate toward zero) |
| `IntList` (big-number limbs) | `Number` | `int.from_bytes(b''.join(x.to_bytes(4,'big') for x in limbs), 'big')` | compose the limbs into a big integer |
| `Number` | `IntList` (big-number limbs) | `[(n>>(i*32))&0xFFFFFFFF for i in range(limbs)]` | same logic as above |

Python `bytes(lst)` and JavaScript `Uint8Array.from(lst)` handle out-of-range values differently. For strict, consistent input, validate that every element is an integer in 0–255 before converting.

---

### 2.3 Bits — Bit Array

```text
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
| `Bits` | `IntList` | The runtime containers can be assigned directly; type-constrained ports still cannot connect directly, and the semantics must be checked |
| `IntList` | `Bits` | Check that every element is 0 or 1; type-constrained ports still cannot connect directly |

**Blocks that use Bits:**
`pq_bytes_to_bits`(output → Bits), `pq_bits_to_bytes`(input ← Bits)

---

### 2.4 Number — Numeric Scalar

```text
Definition: a Blockly numeric scalar; Python uses `int` or `float`, and JavaScript uses binary64 `number`.
Cryptographic ports often require integers; this label does not validate integrality or range. Integer uses include lengths, indices, moduli, round counts, and bit offsets.
```

| Property | Value |
|------|-----|
| Python type | `int` / `float`; integer operations use arbitrary-precision `int` |
| JavaScript type | `number` (binary64; safe integer range [−(2^53−1), 2^53−1]) |
| Blockly default | `0` |
| Typical cryptographic range | `[0, q-1]` (modulus), `[1, 256]` (length), `[0, 31]` (bit offset) |

**⚠️ JavaScript limitation:**
Ordinary bitwise operations first coerce values to signed 32-bit integers. Use `>>> 0` only when an unsigned 32-bit result is intended; use `BigInt` for wider integers.

**Conversion rules:**

| From | To | Python | JavaScript |
|----|----|--------|-----------|
| `Number` | `Bytes` | `n.to_bytes((n.bit_length()+7)//8, 'big')` | construct a Uint8Array manually |
| `Number` | `IntList` (limbs) | split into 32-bit chunks | same as above |
| `Bytes` | `Number` | `int.from_bytes(data, 'big')` | BigInt / manual loop |

---

### 2.5 SBox — S-box Lookup Table

```text
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

```text
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

### 2.7 String / Boolean / Array — general-purpose labels

| Type | Common use | Python | JavaScript | Notes |
|---|---|---|---|---|
| `String` | Identifier text, hexadecimal or curve-parameter text | `str` | `string` | Not `Bytes`; explicitly select UTF-8, hexadecimal, or another encoding when needed |
| `Boolean` | Verification results for signatures, decryption, etc. | `bool` | `boolean` | A truth value, not a 0/1 byte |
| `Array` | Generic array type label | `list[Any]` | `Array<unknown>` | Does not specify element type or cryptographic structure; not used by current primitive ports |

## 3. Type Connection Rules

Blockly checks the types declared on the connections. It does not infer compatibility from the generated language's underlying representation:

| Output type and input check | Connection result |
|---|---|
| Both declare the same type | Connects |
| Both have checks and declare different types | Does not connect |
| Input has no type check (`setCheck(null)`) | Accepts any output type |

Blockly does not permit a connection merely because `Bits`, `IntList`, and `Bytes` may use similar array representations in generated code, and it does not insert general-purpose conversions automatically. Conversion helpers only affect code paths where a generator explicitly calls them; they do not expand Blockly's connection rules.

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

# Explicit type-handling examples
if any(type(value) is not int or not 0 <= value <= 255 for value in msg):
    raise ValueError("IntList items must be bytes")
msg_bytes = bytes(msg)

is_bytes = isinstance(data, (bytes, bytearray))
number = int.from_bytes(data[start:end], "big")
```

### JavaScript

```javascript
const msgBytes = Uint8Array.from(msg, (value) => {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError("IntList items must be bytes")
  }
  return value
})

const isBytes = data instanceof Uint8Array
const number = data.slice(start, end).reduce(
  (value, byte) => (value << 8n) | BigInt(byte),
  0n,
)
```

## 5. Type-Check Checklist for Adding New Blocks

- [ ] Every value input declares `setCheck(TYPE_*)`
- [ ] Every value output declares `setOutput(true, TYPE_*)`
- [ ] The runtime type produced by the generator code matches the declared type
- [ ] If a type conversion is involved, the generator contains explicit conversion code
- [ ] `TYPE_MAP` already contains the three-language mapping for the type
- [ ] The type information is documented in `BLOCK-REFERENCE.md`
- [ ] The test JSON verifies the correctness of the type chain
