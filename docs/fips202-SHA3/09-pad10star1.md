# Algorithm 9  pad10*1(x, m)

**章节**: §5.1  
**类别**: 多速率填充规则

### 规范

```
Input:  positive integer x;  non-negative integer m
Output: string P such that m + len(P) is a positive multiple of x

1: Let j = (−m − 2) mod x
2: Return P = 1 ‖ 0^j ‖ 1
```

### 备注

pad10*1 确保输出长度对齐 rate x。
上标 `*` 表示 `0^j` 长度可变 (j≥0)。

通俗理解: 消息后追加 `1`, 再追加 `0` 直到对齐前一组, 最后追加 `1`。

CipherCat 实现:
  q = rate_bytes - (m_len % rate_bytes)
  if q == 1: q += rate_bytes  # 没有空间放两个 '1' bit
  padded = msg + (suffix ^ first_byte) + zeros + (0x80 ^ last_byte)

### CipherCat

`sha3_pad` — 支持可配置 suffix (SHA-3: 0x06, SHAKE: 0x1F)
