# 位运算 + 逻辑块参考


## 位运算

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `bit_operation` | 1 | value(→) | Number&Number→Number |
| `bit_not32` | 1 | value(→) | Number→Number |
| `bit_expr_infix` | 1 | value(→) | Number&Number→Number / Boolean（选择 `=` 时） |
| `bit_rotate_left` | 1 | stmt(→→) | Number&变量槽→— |
| `bit_rotate_right` | 1 | stmt(→→) | Number&变量槽→— |
| `bit_rotate_left_op` | 1 | stmt(→→) | Number&变量槽→— |
| `bit_rotate_right_op` | 1 | stmt(→→) | Number&变量槽→— |
| `bit_byte_substitute` | 1 | stmt(→→) | 值槽&变量槽→— |

`bit_byte_substitute` 用预先定义的变量 `sbox` 做单字节查表：`INPUT` 必须是 `0–255` 的整数，表至少有 256 项，查得的结果也必须是 `0–255` 的整数；`OUTPUT` 是接收结果的变量。此块按一维表索引，二维表请先选用一维输出格式。自定义表只表示查表构件，不自动具备 AES、SM4 或 ZUC 标准 S 盒语义。

## 逻辑运算

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `lgc_operation` | 1 | stmt(→→) | null&null&null→— |
| `lgc_compound` | 1 | stmt(→→) | null&null&null→— |
| `lgc_not` | 1 | stmt(→→) | 值槽&变量槽→— |

选择 `=` 时，`bit_expr_infix` 输出布尔值；选择 XOR、AND 或 OR 时输出无符号 32 位数。`bit_operation` 的移位和旋转位数在两种生成语言中都按 JavaScript 32 位规则处理：先向零截断，再对 32 取模。非有限数值在位运算转换时按 0 处理。专用旋转语句块的位数固定为 0–31。
