# Data + Encoding Block Reference


## Data

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `data_value` | 1 | value(→) | —→null |
| `seed_bytes` | 1 | value(→) | —→Bytes |
| `seed_hex` | 1 | value(→) | —→null |
| `cipher_key_from_seed` | 1 | value(→) | —→IntList |
| `data_bit_length` | 1 | value(→) | null→Number |
| `data_byte_length` | 1 | value(→) | null→Number |

## Data Conversion

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `data_convert_to_int` | 1 | stmt(→→) | null→— |
| `data_convert_bits_to_bytes` | 1 | stmt(→→) | null&null→— |
| `data_convert_bytes_to_bits` | 1 | stmt(→→) | null&null→— |

## Arrays

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `arr_partition_to_array` | 1 | stmt(→→) | null&Number&null→— |
| `arr_slice` | 1 | value(→) | IntList&Number&Number→IntList |

## Encoding Conversion

| Block | Layer | Connection | Input→Output | Standard |
|----|----|------|----------|------|
| `base64_encode` | 3 | value(→) | Bytes→String | RFC 4648 |
| `base64_decode` | 3 | value(→) | String→Bytes | RFC 4648 |
| `hex_to_bytes` | 3 | value(→) | String→Bytes | generic |
| `bytes_to_hex` | 3 | value(→) | Bytes→String | generic |
| `endian_swap` | 3 | value(→) | IntList→IntList | generic |

`data_bit_length` / `data_byte_length` measure text after UTF-8 encoding. JavaScript `Uint8Array` / `ArrayBuffer` and Python `bytes`, plus ordinary arrays/lists in either language, are measured by byte or element count. Numeric values follow the project convention of 32 bits / 4 bytes; booleans and other unsupported values return 0.

## Data Conversion Contract

- `data_convert_to_int`: byte sequences are interpreted as unsigned big-endian integers. Strings must contain hexadecimal digits and may use a `0x` prefix and a sign. Numeric inputs are truncated toward zero. To keep JavaScript and Python results identical, outputs are limited to JavaScript's safe-integer range; invalid formats and out-of-range values raise an error.
- `base64_encode`: encodes with the RFC 4648 standard alphabet and includes the required `=` padding. Large inputs are processed in chunks; the practical maximum still depends on available runtime memory.
- `hex_to_bytes`: input must be an even-length ASCII hexadecimal string; upper- and lowercase digits are accepted, but a `0x` prefix and whitespace are rejected. An empty string produces an empty byte sequence. Both generated languages reject malformed input.
- `bytes_to_hex`: returns lowercase ASCII hexadecimal with exactly two digits per byte; an empty byte sequence returns an empty string.
- `endian_swap`: returns a reversed copy of the input sequence without mutating the input.
- `data_convert_bits_to_bytes`: input may contain only `0` and `1`. If its length is not a multiple of eight, the final group is left-padded with zeroes before conversion; an empty string produces an empty byte sequence.
- `data_convert_bytes_to_bits`: accepts byte sequences (`Uint8Array`, `ArrayBuffer`, or a byte array in JavaScript; `bytes`, `bytearray`, or a list in Python). Every item must have an integral value from 0 to 255. Each byte becomes eight binary digits, including leading zeroes; invalid byte values raise an error.
- The destination sockets on all three conversion statement blocks must be connected to an assignable variable name (for example, `result` or `结果`), not a number, constant, function call, or language-reserved/non-writable name (such as JavaScript's `undefined`, `NaN`, or `Infinity`). Connect expressions only to source sockets.
- `seed_bytes` / `seed_hex`: expose the runtime-injected seed as bytes and lowercase hexadecimal, respectively.
- `cipher_key_from_seed`: takes the first 16 seed bytes and splits them into four unsigned 32-bit big-endian integers. It is not a key-derivation function (KDF) and must not replace a standard KDF.
- `arr_partition_to_array`: explicitly select byte slices or 32-bit words. Byte mode divides a byte sequence into the requested number of equal, non-empty slices. Word mode requires exactly four bytes per part and decodes each part as an unsigned big-endian 32-bit integer. The count expression must evaluate to a positive integer number (strings, booleans, and arrays are rejected), and the data length must divide exactly; invalid input raises an error instead of silently dropping trailing data. Byte-array/list elements must be integer-valued numbers in `[0,255]`; to keep JavaScript and Python behavior aligned, Python lists also accept integral floats such as `1.0`, but reject booleans and strings. Integer input is minimally encoded as big-endian bytes in byte mode (`0` becomes `00`) and encoded as exactly four big-endian bytes in word mode. The destination must be a variable name.
- `arr_slice`: slices by start index and element count. Both values must be safe integers. A negative start is relative to the end and clamped to zero; a negative length is rejected; an end past the sequence is truncated. Both generators evaluate each input once and return a new list.
- Legacy workspace migration: when the mode field is missing, targets named `B`, `Block`, `padded`, `data`, or `state` migrate to byte mode; all other targets migrate to 32-bit word mode. This is a one-time compatibility default that can be changed explicitly after migration; generators no longer infer the mode from the target name.
