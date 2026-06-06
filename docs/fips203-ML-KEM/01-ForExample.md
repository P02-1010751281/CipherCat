# Algorithm 1  ForExample()

**章节**: §2.4 伪代码符号约定  
**类别**: 示例（非规范性）

### 规范

```
Input:  (none)
Output: (none)

 1: for (i ← 0; i < 10; i++)
 2:    A[i] ← i
 3: end for
 4: j ← 0
 5: for (k ← 256; k > 1; k ← k/2)
 6:    j ← j + 1
 7:    B[j] ← B[j] + k
 8: end for
```

### 备注

非规范性示例，演示 FIPS 203 伪代码中的 for 循环语法。

