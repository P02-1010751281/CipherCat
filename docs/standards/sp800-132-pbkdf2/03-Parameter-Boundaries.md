# PBKDF2 — 参数与使用边界

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | PBKDF2 — 参数与使用边界 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §5.1–§5.4，行 331–407](./00-Standard-Source.md#L331-L407)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（未映射为块实现） |

## 原文定位与引用

> 本页按 source 中的“PBKDF2 — 参数与使用边界”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“PBKDF2 — 参数与使用边界”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

原件：[NIST SP 800-132 PDF](./NIST.SP.800-132.pdf)。

## 公式或伪代码

> 本条目只定义 PBKDF2 的参数边界，不新增独立公式或伪代码；完整的 `U_j`/`T_i` 派生公式见 [02-PRF-and-Block.md](./02-PRF-and-Block.md)。

## 必查参数

| 参数 | 约束 |
|---|---|
| 口令 `P` | 按明确字符/字节编码处理 |
| 盐 `S` | 应独立、不可预测并与口令分离 |
| 迭代次数 `c` | RFC 8018 §5.2 要求正整数；SP 800-132 §5.2 建议至少 1,000，并应按目标环境性能选择和升级 |
| 派生长度 `dkLen` | RFC 8018 §5.2 要求正整数，且不超过 `(2^32−1) × hLen` 字节；当前 SHA-256 与 SM3-HMAC 的 `hLen` 均为 32 字节，对应理论上限 137,438,953,440 字节 |

生成器还要求 `c` 是 JavaScript 可精确表示的安全整数，以保持 JS/Python 参数语义一致。理论标准上限不是建议的实际密钥长度；项目当前未设置更低的资源上限，超大输出可能受运行环境内存限制。

PBKDF2 只提供派生构造；口令存储格式、参数升级、验证式解码和账户策略不在当前块内。Demo 成功不能单独证明口令安全。

[`kdf-parameter-contract.test.ts`](../../../tests/unit/kdf-parameter-contract.test.ts) 检查参数拒绝与 JS/Python `Bytes` 输出，并以 [RFC 7914 §11](https://www.rfc-editor.org/rfc/rfc7914.html#section-11) 的 PBKDF2-HMAC-SHA-256 向量验证 SHA-256 路径。该向量不覆盖 SM3-HMAC 路径或完整 ACVP/CAVP 测试集。
