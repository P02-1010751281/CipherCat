# 数据 + 编码块参考


## 数据

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `data_value` | 1 | value(→) | —→null |
| `seed_bytes` | 1 | value(→) | —→Bytes |
| `seed_hex` | 1 | value(→) | —→null |
| `cipher_key_from_seed` | 1 | value(→) | —→IntList |
| `data_bit_length` | 1 | value(→) | null→Number |
| `data_byte_length` | 1 | value(→) | null→Number |

## 数据转换

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `data_convert_to_int` | 1 | stmt(→→) | null→— |
| `data_convert_bits_to_bytes` | 1 | stmt(→→) | null&null→— |
| `data_convert_bytes_to_bits` | 1 | stmt(→→) | null&null→— |

## 数组

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `arr_partition_to_array` | 1 | stmt(→→) | null&null&null→— |

## 编码转换

| 块 | 层 | 连接 | 输入→输出 | 标准 |
|----|----|------|----------|------|
| `base64_encode` | 3 | value(→) | Bytes→String | RFC 4648 |
| `base64_decode` | 3 | value(→) | String→Bytes | RFC 4648 |
| `hex_to_bytes` | 3 | value(→) | String→Bytes | 通用 |
| `bytes_to_hex` | 3 | value(→) | Bytes→String | 通用 |
| `endian_swap` | 3 | value(→) | IntList→IntList | 通用 |
