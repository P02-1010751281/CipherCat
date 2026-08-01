# Data + Encoding Block Reference

> [中文](./data-encoding.md)

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
| `arr_partition_to_array` | 1 | stmt(→→) | null&null&null→— |

## Encoding Conversion

| Block | Layer | Connection | Input→Output | Standard |
|----|----|------|----------|------|
| `base64_encode` | 3 | value(→) | Bytes→String | RFC 4648 |
| `base64_decode` | 3 | value(→) | String→Bytes | RFC 4648 |
| `hex_to_bytes` | 3 | value(→) | String→Bytes | generic |
| `bytes_to_hex` | 3 | value(→) | Bytes→String | generic |
| `endian_swap` | 3 | value(→) | IntList→IntList | generic |
