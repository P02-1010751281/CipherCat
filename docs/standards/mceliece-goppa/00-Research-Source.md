# Classic McEliece 与 Goppa 码研究来源

本页是标准状态及研究文献索引，不是 ISO 标准原文或完整论文转录。页面中的教学公式应回到列出的原始文献核对。

## ISO 标准记录

- [ISO/IEC 18033-2:2006/Amd 2:2026 官方目录](https://www.iso.org/standard/86890.html)：状态为 Published，发布日期为 2026-06-05。
- [Classic McEliece 项目组 ISO 状态页](https://classic.mceliece.org/iso.html)：项目组说明该 KEM 已纳入修正案，并列出参数集；此页面是提案团队信息，不替代 ISO 官方出版记录。
- ISO 全文受版权及付费访问限制，本仓库未下载、OCR 或转录。**本地原文缺项仍存在。**

## NIST 流程状态

- [NIST IR 8545 PDF](./NIST.IR.8545.pdf)，2025 年 3 月。报告将 Classic McEliece 列为第四轮候选，并记录 NIST 仅选择 HQC 进入后续标准化；公告进一步说明未选择 Classic McEliece 的理由。
- [NIST IR 8545 官方出版记录](https://csrc.nist.gov/pubs/ir/8545/final)及 [NIST 2025-03-11 公告](https://csrc.nist.gov/news/2025/hqc-announced-as-a-4th-round-selection)可核对该轮流程的结论。
- [NIST 当前 PQC 项目页](https://csrc.nist.gov/Projects/post-quantum-cryptography)（更新于 2026-08-05）称 HQC 标准化正在进行；结合 IR 8545，可区分 NIST 的第四轮选择结果与后续 HQC 标准化工作。
- [NIST 额外数字签名项目页](https://csrc.nist.gov/Projects/pqc-dig-sig/standardization)虽标注 2026-09-22 更新，正文仍显示第四轮 KEM 候选“仍在考虑”，与 IR 8545 及已发布的第四轮结果不符。此处按陈旧页面文字记录，不视作 NIST 当前流程仍未决，也不将其解释为对 ISO 2026 修正案的决定。

## 原始论文和算法材料

- R. J. McEliece, “A Public-Key Cryptosystem Based on Algebraic Coding Theory,” DSN Progress Report 42-44, 1978, pp. 114–116。原件：[JPL PDF](https://ipnpr.jpl.nasa.gov/progress_report2/42-44/44N.PDF)；本地副本：[McEliece-1978.pdf](./McEliece-1978.pdf)。该 3 页扫描件没有可提取文本层，暂不提供未经核对的 OCR 转录。
- V. D. Goppa, “A New Class of Linear Correcting Codes,” *Problemy Peredachi Informatsii*, 6(3), 1970, pp. 24–30；英文译本 *Problems of Information Transmission*, 6(3), pp. 207–212。期刊档案及原文 PDF：[MathNet](https://www.mathnet.ru/eng/ppi1748)。本文未将该扫描 PDF 下载到仓库。
- E. R. Berlekamp, “Goppa Codes,” *IEEE Transactions on Information Theory*, 19(5), 1973, pp. 590–592. [DOI](https://doi.org/10.1109/TIT.1973.1055088).
- N. J. Patterson, “The Algebraic Decoding of Goppa Codes,” *IEEE Transactions on Information Theory*, 21(2), 1975, pp. 203–207. [DOI](https://doi.org/10.1109/TIT.1975.1055350).
- [Classic McEliece 官方算法规格](https://classic.mceliece.org/spec.html)及 [NIST IR 8545](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8545.pdf)中的候选算法综述。ISO Clause 13 与 NIST Round-4 规格参数并不等同于本项目的教学参数。

## 本地 PDF 校验

| 文件 | 用途 | SHA-256 |
|---|---|---|
| [NIST.IR.8545.pdf](./NIST.IR.8545.pdf) | NIST 流程状态报告 | `d802f4849a52d18001533cef86e0950f31350643cc06881ee62b2382e1ea0e9d` |
| [McEliece-1978.pdf](./McEliece-1978.pdf) | McEliece 原始论文扫描件 | `33a47430ca58a8374a19180cb90fcb186925dace20c03e73a19b85ae359603dc` |
