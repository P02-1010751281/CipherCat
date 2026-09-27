## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # NIST FIPS 186-5 — ECDSA 参考 |
| 原文证据 | [source：fips186-5-ecdsa](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §6.1–§6.4，行 1174–1384](./00-Standard-Source.md#L1174-L1384)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“# NIST FIPS 186-5 — ECDSA 参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

> 本页只整理项目实际使用的 ECDSA 路径；FIPS 186-5 还包含 RSA、EdDSA 等数字签名内容，不能用本页代替整份标准。

## 来源

[NIST FIPS 186-5 PDF](./NIST.FIPS.186-5.pdf) · [FIPS 186-5 官方页面](https://csrc.nist.gov/pubs/fips/186-5/final)。

项目实现固定使用 P-256、SHA-256 和 RFC 6979 确定性 `k`。这与“覆盖 FIPS 186-5 全部签名机制”不是同一件事。

## 标准定义

本页是 ECDSA 路径导航；签名和验签的完整规范单元分别拆在独立条目中。项目实现范围不代表 FIPS 186-5 全部签名机制。

## 公式或伪代码

> 本条目是 ECDSA 路径概览，没有独立归属的公式或伪代码规范单元；上文项目边界说明仅作导航，不能当作完整标准摘录。
> 完整规范单元见 [签名](./03-Sign.md)、[验签](./04-Verify.md) 和本页所列原件 [source](./00-Standard-Source.md)。

## 项目编码与边界

| 项目 | 当前实现 |
|---|---|
| 私钥 | 32 字节大端 P-256 标量 |
| 公钥 | 64 字节 `Qx || Qy`，非 SEC1 压缩/未压缩标记格式 |
| 签名 | 64 字节 `r || s`，不是 DER 编码 |
| 哈希 | SHA-256，取 32 字节摘要 |
| 曲线 | P-256；没有开放式曲线选择 |
| 密钥生成、证书、EdDSA、RSA | 不属于此块路径 |

Demo：`demos/procedures/ECDSA.json`，向量来源为 RFC 6979 Appendix A.2.5；该向量是互操作测试依据，不是 FIPS 认证。
## 原文摘录

> 本页正文是按 source 的“# NIST FIPS 186-5 — ECDSA 参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。
