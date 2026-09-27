# GB/T 32905 — SM3 密码杂凑算法参考

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

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
| 1 | [01-SM3.md](./01-SM3.md) | SM3 总览 |
| 2 | [02-Padding.md](./02-Padding.md) | 消息填充 |
| 3 | [03-Expansion-Compression.md](./03-Expansion-Compression.md) | 消息扩展与压缩 |
| 4 | [04-Hash-HMAC.md](./04-Hash-HMAC.md) | 完整哈希与 HMAC 复用 |

## 相关块

| 块 | 说明 |
|----|------|
| `hash_sm3_pad` | 消息填充 |
| `hash_sm3_compress` | 64轮压缩函数 |
| `sm3_hash` | 生成器内部 helper；模板 `proc_sm3_hash` |

> `01-SM3.md` 是从标准 PDF 的参数、公式和 `abc` 向量重新整理的结构化参考；
> 原 PDF 保留用于逐条核验。
