# Bit Operations + Logic Block Reference


## Bit Operations

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `bit_operation` | 1 | value(→) | Number&Number→Number |
| `bit_not32` | 1 | value(→) | Number→Number |
| `bit_expr_infix` | 1 | value(→) | Number&Number→Number |
| `bit_rotate_left` | 1 | stmt(→→) | Number→— |
| `bit_rotate_right` | 1 | stmt(→→) | Number→— |
| `bit_rotate_left_op` | 1 | stmt(→→) | Number→— |
| `bit_rotate_right_op` | 1 | stmt(→→) | Number→— |
| `bit_byte_substitute` | 1 | stmt(→→) | null→— |

## Logic Operations

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `lgc_operation` | 1 | stmt(→→) | null&null&null→— |
| `lgc_compound` | 1 | stmt(→→) | null&null&null→— |
| `lgc_not` | 1 | stmt(→→) | null→— |
