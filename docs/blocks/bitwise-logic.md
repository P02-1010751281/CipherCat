# 位运算 + 逻辑块参考


## 位运算

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `bit_operation` | 1 | value(→) | Number&Number→Number |
| `bit_not32` | 1 | value(→) | Number→Number |
| `bit_expr_infix` | 1 | value(→) | Number&Number→Number |
| `bit_rotate_left` | 1 | stmt(→→) | Number→— |
| `bit_rotate_right` | 1 | stmt(→→) | Number→— |
| `bit_rotate_left_op` | 1 | stmt(→→) | Number→— |
| `bit_rotate_right_op` | 1 | stmt(→→) | Number→— |
| `bit_byte_substitute` | 1 | stmt(→→) | null→— |

## 逻辑运算

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `lgc_operation` | 1 | stmt(→→) | null&null&null→— |
| `lgc_compound` | 1 | stmt(→→) | null&null&null→— |
| `lgc_not` | 1 | stmt(→→) | null→— |
