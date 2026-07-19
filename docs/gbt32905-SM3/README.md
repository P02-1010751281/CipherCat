# GB/T 32905 — SM3 密码杂凑算法参考

来源: GB/T 32905-2016 — 信息安全技术 SM3密码杂凑算法
      PDF: [GBT-32905-2016-SM3.pdf](./GBT-32905-2016-SM3.pdf)

## 参数

| 参数 | 值 |
|------|-----|
| 输出长度 | 256 bit |
| 分组长度 | 512 bit |
| 轮数 | 64 |

## 文件索引

| 序号 | 文件 | 名称 |
|:--:|------|------|
| 1 | [01-Constants-Functions.md](./01-Constants-Functions.md) | 常数与函数 (§4) |
| 2 | [02-Padding.md](./02-Padding.md) | 消息填充 (§5.1) |
| 3 | [03-MessageExpansion-Compression.md](./03-MessageExpansion-Compression.md) | 消息扩展 + 压缩函数 (§5.2-§5.3) |
| 4 | [04-Iteration-Appendix.md](./04-Iteration-Appendix.md) | 迭代过程 + 附录 |

## CipherCat 块

| 块 | 说明 |
|----|------|
| `hash_sm3_pad` | 消息填充 |
| `hash_sm3_compress` | 64轮压缩函数 |
| `sm3_hash` | 一键完整哈希 |
