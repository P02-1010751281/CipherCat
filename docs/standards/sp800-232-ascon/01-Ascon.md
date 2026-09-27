# NIST SP 800-232 — Ascon 轻量级密码参考

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | NIST SP 800-232 — Ascon 轻量级密码参考 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §3–§5，行 584–1564](./00-Standard-Source.md#L584-L1564)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现选定单次调用路径（完整 KAT/流式 API 仍有缺项） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-232 — Ascon 轻量级密码参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“NIST SP 800-232 — Ascon 轻量级密码参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

> 本页按 2025-08-13 发布的最终版 PDF 重新整理。仓库曾经的 2024-11 Initial Public Draft 只作为历史来源，不得当作现行标准；现行内容以 [NIST.SP.800-232.pdf](./NIST.SP.800-232.pdf) 和 [NIST 最终版页面](https://csrc.nist.gov/pubs/sp/800/232/final) 为准。

## 公式或伪代码

> 本条目是 Ascon 算法族总览，不定义独立公式或伪代码；完整的置换、填充、AEAD、Hash 和 XOF 规范单元见本目录对应条目。

## 标准范围

SP 800-232 为受约束设备定义 Ascon 系列认证加密、哈希和可扩展输出函数。最终版的四个算法及初始值如下：

| 算法 | 用途 | `IV` |
|---|---|---|
| Ascon-AEAD128 | 认证加密 | `00001000808c0001` |
| Ascon-Hash256 | 哈希 | `0000080100cc0002` |
| Ascon-XOF128 | 可扩展输出 | `0000080000cc0003` |
| Ascon-CXOF128 | 带定制字符串的可扩展输出 | `0000080000cc0004` |

四个算法都使用 Ascon 置换；认证加密使用 `p[12]` 初始化/终结和 `p[8]` 的中间处理，速率为 16 字节，认证标签为 16 字节。

## Ascon-AEAD128 流程

设密钥 `K` 和 nonce `N` 均为 16 字节：

1. 用 `IV || K || N` 初始化状态，执行 `p[12]`，再注入密钥。
2. 吸收关联数据 `A`；完整块和带 `0x01` 分隔填充的末块之间执行 `p[8]`，最后切换域分离标志。
3. 吸收明文 `M` 并逐块输出密文 `C`；末块使用同一分隔填充规则。
4. 再次注入密钥，执行 `p[12]`，输出 16 字节认证标签 `T`。

输出编码为 `C || T`。解密必须验证 `T` 后才释放明文；项目现已提供解密块，并在标签篡改时拒绝输出，
但仍需补齐更广泛的官方解密 KAT 和流式接口才能称为完整实现。

## 项目覆盖与缺项

| 能力 | 状态 |
|---|---|
| Ascon-AEAD128 加密 | `ascon_encrypt` 已实现，输入为 key/nonce/AD/message，输出 `C || T` |
| Ascon-Hash256 | `ascon_hash256` 已实现；空消息摘要与 Botan 独立结果一致 |
| Ascon-XOF128 / CXOF128 | `ascon_xof128` / `ascon_cxof128` 已实现；扩展 Demo 双语言一致，覆盖 32 字节输出 |
| AEAD 解密与标签拒绝路径 | `ascon_decrypt` 已实现；空消息解密和错误标签拒绝已核验 |
| 标准最终版 PDF | 已保存，SHA-256 见 `standards-manifest.json` |

Demo：`demos/procedures/ASCON.json` 与 `demos/procedures/ASCON-Extended.json`。已有向量测试只能证明选定输入的功能结果，不能替代认证或侧信道评估。
