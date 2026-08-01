# GB/T 32907 — SM4 分组密码算法参考

来源: GB/T 32907-2016 — SM4分组密码算法
      PDF: [GBT-32907-2016-SM4.pdf](./GBT-32907-2016-SM4.pdf)

## 参数

| 参数 | 值 |
|------|-----|
| 分组长度 | 128 bit |
| 密钥长度 | 128 bit |
| 轮数 | 32 |

## 文件索引

| 序号 | 文件 | 名称 |
|:--:|------|------|
| 1 | [01-Overview.md](./01-Overview.md) | 算法概述 (§4–§5) |
| 2 | [02-RoundFunction.md](./02-RoundFunction.md) | 轮函数F (§6) |
| 3 | [03-Algorithm.md](./03-Algorithm.md) | 加密/解密/密钥扩展 (§7) |
| 4 | [04-Appendix.md](./04-Appendix.md) | 附录 运算示例 |

## CipherCat 块

| 块 | 说明 |
|----|------|
| `sm4_round_func` | 轮函数 F |
| `sm4_linear_transform` | 线性变换 L |
| `sm4_round` | 完整轮(含密钥异或) |
| `sm4_key_schedule` | 32轮密钥生成 |
