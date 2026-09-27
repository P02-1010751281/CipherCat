---
doc_type: audit-finding
id: DOC-04
severity: P1
dimension: bug
status: resolved
---

# DOC-04 算法页的标题和伪代码被截断

## 证据

- [`docs/standards/fips204-ML-DSA/48-MatrixVectorNTT.md:1`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/fips204-ML-DSA/48-MatrixVectorNTT.md:1) 的标题在 `𝐌,` 处结束；第 9 行同样缺失向量参数，且第 17–22 行把一次 `MultiplyNTT` 调用拆成多行，无法直接执行或复核。
- [`docs/standards/sp800-38a-modes/04-OFB.md:14`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/sp800-38a-modes/04-OFB.md:14) 和 [`05-CTR.md:49`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/sp800-38a-modes/05-CTR.md:49) 保留了从图形阅读顺序反转的 `TPYRCNE/TPYRCED`，使页面看起来像可读正文但实际不是有效算法描述。
- [`docs/standards/sp800-232-ascon/01-Ascon.md:3`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/sp800-232-ascon/01-Ascon.md:3) 已正确声明这是 2024-11 IPD 历史稿，但该文件正文仍是大段草案转录；目录 README 却将同目录 PDF 作为 2025 Final。两者没有结构化的版本差异表。

## 影响

即便部分小型算法页已经人工修正，用户从标准目录逐页阅读时仍会遇到标题不完整、版本混杂和不可复核伪代码，无法可靠地区分标准原文、人工摘要和历史草案。

## 处理方向

对每个算法页增加“来源版本、提取方式、核对状态、适用范围”头部；把损坏的图形转录删除或改成文字公式；对 FIPS 204/模式/Ascon 等页面按官方最终版重新生成结构化摘要。

## 修复结果

已补全 ML-DSA Algorithm 48，并重写模式与 Ascon 主参考页；全文异常标记复扫为 0，历史证据保留在本 finding，当前入口以结构化页面为准。
