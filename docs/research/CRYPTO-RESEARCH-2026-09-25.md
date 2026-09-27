# 随机性测评与标准状态补充

**核验日期：** 2026-09-25
**范围：** metacrypt_server 随机性测评流程、Go randomness 检测库与关联部署/评测文档。本文补充 NIST 当前标准状态，不把文献综述当作符合性结论。

## 结论

1. NIST SP 800-22 Rev. 1a 页面仍列为 2010 年最终版，但 NIST 已决定修订。该文件说明统计测试不能取代密码分析，也不能单独认证生成器。NIST §4.2.2 要求至少 55 条序列，才能对 P-value 分布均匀性得到有统计意义的结果。NIST 的软件页另建议 Spectral/DFT Test 仅用于 1,000,000-bit 序列。
2. Go randomness 当前上电/周期检测使用 20 组，出厂检测使用 50 组；二级分布阶段对 Q 值分箱，而不是按 SP 800-22 的 P-value 均匀性流程。它应表述为项目自己的诊断逻辑，不是 NIST STS 实现。不得仅因出厂有 50 组，就将其描述为满足“至少 55 条”的 NIST 建议。
3. Go 检测工具的 100,000,000-bit 档需要 Bluestein 变换构造 2^28 点 FFT，而底层 FFT 实现上限为 2^27 点。该档对不支持的 DFT 显式输出 `NaN` 并在 CSV 列名及日志标明“未执行”；这不是 DFT 失败，也不影响其他已执行检测项。机器接口的 `TestResult` 为保持 JSON 数值字段有效，会用 `Skipped=true` 和零值承载这一状态；消费端必须先检查 `Skipped`，不能将这些零值当作检测结果。
4. NIST IR 8446 于 2026 年 1 月发布，比较 SP 800-90 系列与 BSI AIS 20/31 的术语、假设和要求，并讨论熵估计、健康测试与 RBG 构造。它是比较报告，不是认证标准，也不能替代两套规范的逐项评估。
5. 项目部署文档曾引用不存在于代码配置中的 `CORS_ALLOWED_ORIGINS`，数据库示例也与 Compose 默认库名不一致；登录 curl 示例遗漏默认验证码字段。文档现已对齐 `CORS_ORIGINS`、`ruoyi2owl` 和验证码前提，并去掉可被误当成生产凭据的固定密码示例。

## 项目影响与保留事项

- 不把 NIST 的 55 条建议直接套到 GM/T 0062 或 GM/T 0005 的检测阶段；先核对适用条文和项目当前批次判定语义，再决定是否变更。当前评估路线明确：20,000-bit × 1000 批次可进入项目的 GM/T 0005 参考判定流程，1,000,000-bit 与 100,000,000-bit 档只作诊断；仍需逐条标准符合性独立核验。
- `NaN` 是这里用于机器可读的“未执行”标志。查看报告时须结合列名；任何把 `NaN` 转为 0 或 pass/fail 的消费者都应视为缺陷。
- DES/口令散列暴力测试仍按既有路线区分。Hashcat 的候选生成/口令散列工作负载可作未来实验设计参考，但不能代表当前 DES 已知明文搜索，也不构成标准符合性。
- 本次代码验收覆盖定向 Python 后端测试、Go `rddetector` 包测试、Go randomness 全量测试及此前的全量后端/前端测试；CUDA 编译/真实 GPU、真实 MySQL/Redis/Celery 容器集成仍不在本机已验证范围内。

## 已下载原文

- [补充 NIST 文献索引](./sources/README.md)：记录三份官方 PDF 的出版页和 SHA-256。
- [NIST IR 8427](./sources/NIST.IR.8427.pdf)：官方 PDF，19 页。SHA-256：`3fc0bf9351dc0560a66ae7e6170d86a9bc1dc0a1c9167b7e6dfa2ad9c74de52f`。
- [NIST SP 800-22 Rev. 1a](./sources/NIST.SP.800-22r1a.pdf)：官方 PDF，131 页。SHA-256：`38aba1b34a7fa52c440790d6e0cabf498e4b525177b3b6cebb399ab8ccf031d2`。
- [NIST IR 8446](./sources/NIST.IR.8446.pdf)：官方 PDF，81 页。SHA-256：`39919f9c7313c47371d7b996e97ee03ef1c4116a9dca4f3cd8af46129a7dba56`。

来源：[SP 800-22 官方页面](https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final)、[NIST STS 软件页](https://csrc.nist.gov/projects/random-bit-generation/documentation-and-software)、[IR 8446 官方页面](https://csrc.nist.gov/pubs/ir/8446/final)。后端评测路线见 `metacrypt_server/docs/ASSESSMENT-ROADMAP.md`。
