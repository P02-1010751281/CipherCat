# ShannonProver 与 AI 在密码学工具链中的接入调研

**核验日期：** 2026-10-16
**范围：** 公开的 ShannonProver（论文 + 仓库 + 官方页面）与相邻的 AI/形式化验证生态；评估它们与本项目（CipherCat / metacrypt_server：教学 + 测评 + 密码分析）的融合方式。
**边界：** 本文是调研与方案，不是符合性结论，也不是对任何工具能力的背书。所有引用的数字都注明来源口径。

## 结论

1. **ShannonProver 是 EasyCrypt 之上的 LLM agent 框架，不是密码学算法工具。** 它由语言模型 agent 在 EasyCrypt 里构造机器可检查的证明：用户负责第一阶段（用 EasyCrypt 写出方案、假设、安全博弈与最终定理），agent 负责第二阶段（提出中间博弈与辅助引理、分解论证）与第三阶段（写出并让 EasyCrypt 检查证明脚本）；一个外层 agent 统筹论证，可并行派生内层 agent 处理辅助引理，失败信息回灌后重新分解；结束时整份 EasyCrypt 开发会被完整重新检查。仓库为 MIT（并 vendored EasyCrypt，同样 MIT），锁定 EasyCrypt `r2026.06`。

2. **它的代价与产出规模（论文口径）：** 案例研究中 MEE-CBC 约 2 小时、ChaCha20-Poly1305 约 5 小时完成以往专家需数周到数月的工作；消融实验里加入引理求解后解出率从 67% 提升到 90%，82% 的 run 在 15 分钟内结束（长尾更久）；ChaCha20 案例的 LLM API 成本量级为「专家分解一次 $233.65、逐引理合计 $40.98」。默认配置用 Codex CLI + 高推理模型，也可换 Claude CLI。这些是论文在其 benchmark 上的数字，不是本项目环境下的实测。

3. **它证明的边界要说清：** 它产出的是「在给定 EasyCrypt 模型下」的协议级安全定理的机器检查证明。它**不**证明实现代码的正确性（不覆盖本项目生成的 JavaScript/Python），**不**替代算法 KAT（我们用的是官方 ACVP/CAVP 向量），也**不**构成任何认证。要证明「生成代码与规格一致」，对应生态是 Cryptol + SAW（规格与实现等价检查）、Jasmin（带已验证编译器的高保证实现语言）以及 EasyCrypt + Jasmin 的组合（Cloudflare 的后量子案例即属此类）；本项目当前的等价物是官方向量 + 交叉实现比对，属**测试**而非证明。

4. **融合判断：不进测评流水线，进方法学与实验轨道。**
   - 不能进流水线：它需要 opam/EasyCrypt 源码构建、Z3/CVC5/Alt-Ergo 外部求解器、已登录的 LLM CLI 与**外网**，单次任务时限在配置里就是以小时计（示例为内层 120 分钟、整体 12 小时）。这与我方测评容器的「无网络、无凭据、只跑待测样本」设计方向相反。
   - 值得马上吸收的是**闭环形式**：它 = 「LLM 产出候选 → 形式化检查器判定 → 失败反馈再来」。本项目已经有同构的确定性检查器（官方 ACVP/CAVP 向量、`verify:all` 门禁、CPU/GPU 逐字节比对、模板与 Demo 回归）。据此可以把 AI 相关产出的验收规则写死：**AI 只能产出候选，验收必须过确定性门禁；AI 输出不得进入证据链**。
   - 可作为**隔离实验轨道**（可选）：在独立容器里对**一个最小 EasyCrypt 目标**跑一次可行性实测（记录构建时长、依赖、证明时长、成本与失败模式），通过后再讨论是否做小范围教学模块。在此之前不引入任何依赖、不写进产品能力。

5. **AI 接入本项目的三条现实路径（按可验收性排序）：**
   | 路径 | 形态 | 验收方式 | 风险 |
   |---|---|---|---|
   | ① AI 辅助密码分析 | 让模型提出参数/假设候选（如自动挑选差分特征、候选掩码、弱参数构造） | 由现有引擎执行，结论由引擎与 CPU/GPU 比对判定；AI 建议不写进报告 | 低（AI 只提候选） |
   | ② AI 辅助块 / 模板 / 文档草稿 | 让模型起草 Blockly 块、双语条目、教程段落 | 必须过 `verify:all`、官方向量、文档门禁与人工复核；不通过即弃 | 中（文档体裁与术语易漂） |
   | ③ AI 助教（文档问答） | 对文档与攻击引擎的问答 | 需要单独策略：数据出境、内容边界、引用要求、是否默认关闭 | 较高（合规与内容） |

6. **双用途风险必须写明：** 2026 年已有公开记录显示 LLM agent 可自主完成从漏洞到后渗透的攻击链（EACL 2026《Teams of LLM Agents can Exploit Zero-Day Vulnerabilities》、CSA 2026-04 白皮书《Automated Exploit Generation: LLMs Cross the Threshold》、Sysdig 2026-05 的自主后渗透事件）。本平台已具备 DES/2DES 密钥搜索、口令散列爆破、RSA/离散对数弱参数攻击与差分/线性分析，这些能力与 AI 叠加会显著放大。既有边界必须延续到任何 AI 功能：只处理调用方自有的散列/密钥/样本、不抓取目标、不联机拉取、不提供面向第三方的攻击编排，并保留操作与产出的审计留痕。

## 项目影响与保留事项

- **不引入运行时依赖**：ShannonProver 不作为平台依赖；测评报告、门禁与认证材料中不出现「AI 生成证明」一类表述。
- **不夸大实现级保证**：本项目对生成代码的证据仍是官方向量与交叉实现比对（测试）；若未来要做实现级证明，方向是 Cryptol/SAW 类等价检查或 Jasmin 类高保证实现，而不是 EasyCrypt 协议证明。
- **实验轨道的准入条件**（若启动）：独立容器、无宿主凭据、明确预算上限、以「最小 EasyCrypt 目标」为范围；产出含构建与证明耗时、成本、失败模式与可复现脚本；未达通过标准即终止并不写进文档能力表。
- **AI 功能的通用门禁**（建议写入开发规范）：AI 产出一律标注为候选；验收由确定性检查器完成；AI 输出不得作为证据来源；涉及外网与数据出境的功能默认关闭并单独评审。
- **与既有路线的衔接**：本结论与平台侧测评路线图（阶段 B–E 未完成、GPU DES 已完成，见平台仓库的 `docs/ASSESSMENT-ROADMAP.md`）以及 [产品认证可行性](../../standards/PRODUCT-CERTIFICATION-FEASIBILITY.md) 的边界一致：任何「证明/验证」表述都必须对应可复现的本地证据。

## 已下载原文与出处

- [ShannonProver 论文 PDF](./sources/ShannonProver-arXiv-2607.02847v4.pdf)：arXiv 2607.02847v4《ShannonProver: Towards Automating Formal Cryptographic Proofs》（cs.CR / cs.PL），410 KB。SHA-256：`01a4aff0385d49db71228eb395e45457842a8106955981c08444bf50d1b63169`。
- 仓库：[SkyShannonProver/shannon-prover](https://github.com/SkyShannonProver/shannon-prover)，检索时 HEAD = `60701dbe37ee72075e60e655a076e282efe7485e`；MIT 许可（vendored EasyCrypt 亦为 MIT）；安装要求：Git、opam、Python ≥ 3.12、uv、Z3 与 CVC5（CI 用 Z3 4.15.4 / CVC5 1.2.1），并在托管 opam switch 中安装 Alt-Ergo 2.4.3。
- 项目页：[项目概览与 proof browser](https://skyshannonprover.github.io/shannon-prover/)。
- 相邻生态（仅作方向参照，未下载原文）：Jasmin（高保证高速度密码实现与已验证编译器）、Cryptol + SAW（AWS 的规格/实现等价验证实践）、EasyCrypt + Jasmin（Cloudflare 后量子验证案例）、IACR ePrint 2025/980（密码实现的形式化安全与功能验证）。
- AI 风险参照（仅引用结论，未下载原文）：EACL 2026《Teams of LLM Agents can Exploit Zero-Day Vulnerabilities》、CSA 2026-04 白皮书、Sysdig 2026-05 事件记录。
