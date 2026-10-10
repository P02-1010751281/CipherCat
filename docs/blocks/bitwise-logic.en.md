# Bit Operations + Logic Block Reference


## Bit Operations

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `bit_operation` | 1 | value(→) | Number&Number→Number |
| `bit_not32` | 1 | value(→) | Number→Number |
| `bit_expr_infix` | 1 | value(→) | Number&Number→Number / Boolean (when `=` is selected) |
| `bit_rotate_left` | 1 | stmt(→→) | Number&variable slot→— |
| `bit_rotate_right` | 1 | stmt(→→) | Number&variable slot→— |
| `bit_rotate_left_op` | 1 | stmt(→→) | Number&variable slot→— |
| `bit_rotate_right_op` | 1 | stmt(→→) | Number&variable slot→— |
| `bit_byte_substitute` | 1 | stmt(→→) | value slot&variable slot→— |

`bit_byte_substitute` performs a single-byte lookup in a pre-defined variable named `sbox`. `INPUT` must be an integer from 0 through 255; the table must contain at least 256 entries, and the selected output must also be a byte. `OUTPUT` names the destination variable. This block indexes a one-dimensional table; choose the one-dimensional output format when using the S-box definition block. A custom table is only a lookup primitive and does not automatically have the standardized AES, SM4, or ZUC S-box semantics.

## Logic Operations

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `lgc_operation` | 1 | stmt(→→) | null&null&null→— |
| `lgc_compound` | 1 | stmt(→→) | null&null&null→— |
| `lgc_not` | 1 | stmt(→→) | value slot&variable slot→— |

`bit_expr_infix` returns a Boolean when `=` is selected and an unsigned 32-bit number for XOR, AND, or OR. In `bit_operation`, shift and rotate counts follow JavaScript's 32-bit rule in both generated languages: truncate toward zero, then reduce modulo 32. Non-finite values are treated as 0 during bitwise conversion. The dedicated rotate statement blocks use a fixed field constrained to 0–31.
