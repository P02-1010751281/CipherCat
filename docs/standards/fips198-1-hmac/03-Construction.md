## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # HMAC — 内外层构造原语 |
| 原文证据 | [source：fips198-1-hmac](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §4，行 328–395](./00-Standard-Source.md#L328-L395)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“# HMAC — 内外层构造原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

原件：[FIPS 198-1 PDF](./NIST.FIPS.198-1.pdf)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 计算

```text
HMAC(K,M) = H((K0 xor opad) || H((K0 xor ipad) || M))
```

`ipad` 是重复 `0x36`，`opad` 是重复 `0x5c`，重复长度等于底层哈希分组长度 `B`。

## CipherCat 映射

| 块 | 路径 |
|---|---|
| `hash_hmac` | HASH 下拉选择 SHA-256 或 SM3 |
| `hmac_sha256` / `sm3_hmac` | 生成器内部 helper |
| `proc_hmac_sha256` / `proc_sm3_hmac` | 复用 `hash_hmac` 的模板 |

HMAC 输出的是 MAC，不是普通哈希；是否截断以及标签比较策略由上层协议负责。
## 原文摘录

> 本页正文是按 source 的“# HMAC — 内外层构造原语”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。
