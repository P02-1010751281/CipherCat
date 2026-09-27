## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # NIST FIPS 198-1 — HMAC 参考 |
| 原文证据 | [source：fips198-1-hmac](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §4，行 328–395](./00-Standard-Source.md#L328-L395)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“# NIST FIPS 198-1 — HMAC 参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

原件：[NIST.FIPS.198-1.pdf](./NIST.FIPS.198-1.pdf) · [NIST 页面](https://csrc.nist.gov/pubs/fips/198-1/final)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 算法

对底层哈希函数 `H`，分组长度为 `B` 字节、输出长度为 `L` 字节。先把密钥规范化为 `K0`：密钥长于 `B` 时先哈希，短于 `B` 时右侧补零。定义：

```text
HMAC(K, M) = H((K0 xor opad) || H((K0 xor ipad) || M))
```

其中 `ipad = 0x36` 重复 `B` 次，`opad = 0x5c` 重复 `B` 次。标签可以按协议需要截断，但截断长度必须明确。

## 项目边界

`hash_hmac` 的 HASH 下拉支持 SHA-256 和 SM3；`hmac_sha256`、`sm3_hmac` 是对应快捷路径。Demo：`demos/procedures/HMAC-SHA256.json`。本项目只展示功能和中间结构，不宣称密钥擦除、常量时间或认证模块验证。
## 原文摘录

> 本页正文是按 source 的“# NIST FIPS 198-1 — HMAC 参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。
