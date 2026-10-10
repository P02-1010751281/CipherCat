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
| `arr_partition_to_array` | 1 | stmt(→→) | null&Number&null→— |
| `arr_slice` | 1 | value(→) | IntList&Number&Number→IntList |

## 编码转换

| 块 | 层 | 连接 | 输入→输出 | 标准 |
|----|----|------|----------|------|
| `base64_encode` | 3 | value(→) | Bytes→String | RFC 4648 |
| `base64_decode` | 3 | value(→) | String→Bytes | RFC 4648 |
| `hex_to_bytes` | 3 | value(→) | String→Bytes | 通用 |
| `bytes_to_hex` | 3 | value(→) | Bytes→String | 通用 |
| `endian_swap` | 3 | value(→) | IntList→IntList | 通用 |

`data_bit_length` / `data_byte_length` 对文本按 UTF-8 编码后计量；JS 的 `Uint8Array` / `ArrayBuffer` 与 Python 的 `bytes`，以及两端的普通数组/列表，按字节或元素计量。数值按项目约定计为 32 bit / 4 byte；布尔值和其他未支持类型返回 0。

## 数据转换约定

- `data_convert_to_int`：字节序列按无符号大端整数解释；字符串必须是十六进制，可带 `0x` 前缀和正负号；数值按向零截断。为保持 JavaScript 与 Python 结果一致，输出限制在 JavaScript 安全整数范围内，超出范围或输入格式非法时会报错。
- `base64_encode`：按 RFC 4648 标准字母表编码，并保留所需的 `=` 填充。长输入分块处理；实际可处理大小仍受运行时内存限制。
- `hex_to_bytes`：输入必须是偶数长度的 ASCII 十六进制字符串；接受大小写字母，不接受 `0x` 前缀或空白；空字符串转换为空字节序列。格式错误时两种生成语言都报错。
- `bytes_to_hex`：输出小写 ASCII 十六进制，每个字节固定为两位；空字节序列得到空字符串。
- `endian_swap`：返回输入序列的倒序副本，不原地修改输入序列。
- `data_convert_bits_to_bytes`：输入只允许 `0` 和 `1`。长度不是 8 的倍数时，最后一组在左侧补零后转成一个字节；空串得到空字节序列。
- `data_convert_bytes_to_bits`：输入为字节序列（`Uint8Array`、`ArrayBuffer` 或字节数组；Python 使用 `bytes`、`bytearray` 或列表），每项必须是值在 `0..255` 的整数值；每个字节输出 8 位二进制并保留前导零，非法字节会报错。
- 三个转换语句块中标记为目标的插槽必须连接可赋值变量名（如 `result` 或 `结果`），不能连接数字、常量、函数调用或语言保留/不可写名称（例如 JavaScript 的 `undefined`、`NaN`、`Infinity`）；输入表达式只应连接到来源插槽。
- `seed_bytes` / `seed_hex`：读取运行时注入的种子字节及其小写十六进制表示。
- `cipher_key_from_seed`：取种子前 16 字节，按大端序拆为 4 个无符号 32 位整数；它不是密钥派生函数（KDF），不能替代标准 KDF。
- `arr_partition_to_array`：必须显式选择“字节切片”或“32 位字”。字节切片模式把字节序列等分为指定数量的非空切片；32 位字模式要求每份恰为 4 字节，并按无符号大端序解码。两种模式都要求份数表达式求值为正整数数值（不接受字符串、布尔值或数组），且数据可均分；错误输入会报错而不会静默丢弃尾部数据。字节数组/列表元素须为 `[0,255]` 内的整数值；为保持 JS 与 Python 行为一致，Python 列表也接受 `1.0` 这类整数值浮点数，布尔值和字符串不接受。整数源在字节模式下按最短大端字节序列编码（0 编码为单字节 `00`）；在 32 位字模式下按 4 字节大端编码。目标插槽必须是变量名。
- `arr_slice`：按“起始索引 + 元素个数”切片。起始索引和长度必须是安全整数；负起点相对序列末尾计算并截到 0，长度不得为负，终点超过序列时截到末尾。两种生成语言都会先求值一次各输入，再返回新列表。
- 旧工作区迁移：没有模式字段时，目标变量名为 `B`、`Block`、`padded`、`data` 或 `state` 的块默认迁移为字节切片，其余默认迁移为 32 位字；这是一次性兼容默认值，迁移后可在块上显式更改，不再由代码生成器推断。
