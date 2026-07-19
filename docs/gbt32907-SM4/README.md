# GB/T 32907 — SM4 分组密码算法参考

来源: GB/T 32907-2016 — 信息安全技术 SM4分组密码算法
      PDF: [GBT-32907-2016-SM4.pdf](./GBT-32907-2016-SM4.pdf)

## 参数

| 参数 | 值 |
|------|-----|
| 分组长度 | 128 bit |
| 密钥长度 | 128 bit |
| 轮数 | 32 |
| S-box | 16×16 固定置换 |

## 文件索引

| 序号 | 文件 | 名称 |
|:--:|------|------|
| 1 | [01-AlgorithmDescription.md](./01-AlgorithmDescription.md) | 算法描述 (§4-§7) |
| 2 | [02-RoundFunction-KeyExpansion.md](./02-RoundFunction-KeyExpansion.md) | 轮函数F + 密钥扩展 (§5-§6) |
| 3 | [03-Appendix-Examples.md](./03-Appendix-Examples.md) | 附录A 运算示例 |

## CipherCat 块

| 块 | 说明 |
|----|------|
| `sm4_round_func` | 轮函数 F |
| `sm4_linear_transform` | 线性变换 L |
| `sm4_round` | 完整轮(含密钥异或) |
| `sm4_key_schedule` | 32轮密钥生成 |
