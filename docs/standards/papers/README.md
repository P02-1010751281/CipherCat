# 标准文献与研究材料

研究材料原文提取参考：[00-Research-Source.md](./00-Research-Source.md)。

`papers/` 是标准目录下的文献索引，不是一个可直接拖入 Blockly 的算法实现目录。它用于保存标准状态、版本变化、实现保证和教学研究的证据链。

当前实际下载的 PDF 分为两处：[`paper/references/README.md`](../../../paper/references/README.md) 记录通用研究材料；本目录的子目录 README 记录随标准文档一起维护的两份历史/背景材料。新增或替换文献时必须同时更新所属清单，并用 `pdfinfo` 确认文件可读。

## 本目录 PDF 校验值

| 文件 | SHA-256 |
|---|---|
| [ecc-sec2/sec2-v2.pdf](./ecc-sec2/sec2-v2.pdf) | `87b8f3703364ed5b21ba8582e411cc0cbf477bcaa3f4f45e0d6580d1c00d9952` |
| [rijndael-gf/rijndael-ammended.pdf](./rijndael-gf/rijndael-ammended.pdf) | `53e07be3640a824ffaddb34921a8300d935c7a394fb4e7f0629e8729e863a7ea` |

## 使用边界

- 标准原文优先于论文摘要、博客或二手实现；实现说明必须写明标准版本和来源。
- 通过 demo/KAT 只说明选定输入的功能一致性，不等于 CAVP/ACVTS、CMVP/FIPS 140-3 或形式化验证通过。
- FIPS 203、FIPS 204、SP 800-90B 等页面存在后续 errata/修订提示；引用时必须复查官方页面当前状态。
- 前端 CipherCat 只负责用户试运行生成代码；平台后端随机性测评由 `metacrypt_server` 执行，不能用浏览器结果替代。该测评不代表认证或熵源质量证明。

## 本次调研重点

- 后量子：FIPS 203/204/205、SP 800-227 以及 ML-KEM/ML-DSA/SLH-DSA 的标准化边界。
- 随机性：SP 800-90A/B/C、GM/T 0005 与后端测评的熵源、健康测试和 RBG 构造边界。
- 轻量密码：SP 800-232 最终版与 NIST IR 8454 的 Ascon 评估背景。
- 高保证实现：FIPS 140-3 IG、HACL*、机器检查标准和 constant-time 验证研究。

完整结论见 [`docs/research/CRYPTO-RESEARCH-2026-09-12.md`](../../research/CRYPTO-RESEARCH-2026-09-12.md)。
