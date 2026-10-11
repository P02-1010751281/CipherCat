# 随机源与密码模块验证：官方资料

本目录保存 2026-09-30 从 NIST 官方站点及国家标准信息公共服务平台取得的标准/指南原文，供[正式认证可行性方案](../PRODUCT-CERTIFICATION-FEASIBILITY.md)核对。文件未经内容改写；提交认证前仍须核实届时现行版、机构解释和实验室范围。这里的标准/指南不是 CipherCat 或拟建模块已获认证的证据。

| 本地文件 | 官方文件与核验重点 | 官方来源 | SHA-256 |
|---|---|---|---|
| [GM-T-0028-2024.pdf](./GM-T-0028-2024.pdf) | GM/T 0028-2024《密码模块安全要求》；§7.9.2（印刷页 25）：RNG/RNG 链、核准随机数和外部熵要求 | [全文下载](https://hbba.sacinfo.org.cn/portal/download/6cfea21bf63c59d33b8da2e979fa9193acf28d61e10593f816dad9feeefed5f2) · [标准记录](https://hbba.sacinfo.org.cn/stdDetail/6cfea21bf63c59d33b8da2e979fa9193acf28d61e10593f816dad9feeefed5f2) | `7d6059d6a700969638ac8b06581d1673d5bc1229b9011ea284cab31d0e8805cc` |
| [GM-T-0039-2024.pdf](./GM-T-0039-2024.pdf) | GM/T 0039-2024《密码模块安全检测要求》；§6.2（印刷页 79–80）：随机数生成器送检材料和检测程序 | [全文下载](https://hbba.sacinfo.org.cn/portal/download/6cfea21bf63c59d33b8da2e979fa9193f9dd232e0b77f9bb3858e34bbf01fa9f) · [标准记录](https://hbba.sacinfo.org.cn/stdDetail/6cfea21bf63c59d33b8da2e979fa9193f9dd232e0b77f9bb3858e34bbf01fa9f) | `a65921ac02b3d3e40b96d2427e8419b61cfcaee63e1822fe48a6db669e788348` |
| [GM-T-0134-2024.pdf](./GM-T-0134-2024.pdf) | GM/T 0134-2024《密码模块安全设计指南》；§14.4（印刷页 22）：RNG 状态信息保护与定义 | [全文下载](https://hbba.sacinfo.org.cn/portal/download/ced53568b96d1627754cc46714dfa5ae122a3b1ce38db5971ece2eaee8aa06a7) · [标准记录](https://hbba.sacinfo.org.cn/stdDetail/ced53568b96d1627754cc46714dfa5ae122a3b1ce38db5971ece2eaee8aa06a7) | `610b9c96fdbae105048881b795acc19932fdc54c04dc51318be3ce6a393ce54d` |
| [GM-T-0105-2021.pdf](./GM-T-0105-2021.pdf) | GM/T 0105-2021《软件随机数发生器设计指南》；官方门户公开下载，现行版 | [标准全文下载](https://hbba.sacinfo.org.cn/portal/download/a302cf337eb6259967e0acc1878ece87b6a32ebe36c3878792a738e7e5c7a5e0) · [标准信息记录](https://std.samr.gov.cn/hb/search/stdHBDetailed?id=E66CC4F6F8DB8B7FE05397BE0A0A6C55) | `1bee5add5884883bc25244e891141b0d0b6b689d9e77d71f0f02d7dad1f01bfa` |
| [NIST.SP.800-90B.pdf](./NIST.SP.800-90B.pdf) | SP 800-90B，熵源设计、验证和健康测试 | [NIST PDF](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/nist.sp.800-90b.pdf) | `9b0dd77131ade3617a91cd8457fa09e0dc354c273bb2220a6afeaca16e5defe7` |
| [NIST.SP.800-90C.pdf](./NIST.SP.800-90C.pdf) | SP 800-90C RBG1/RBG2/RBG3/RBGC 构造；最终版发布于 2025-09-25 | [NIST PDF](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90C.pdf) · [NIST 发布记录](https://csrc.nist.gov/pubs/sp/800/90/c/final) | `22dc2de903b2fe602fa0729c38b9512927ad96ef5669a3da8a0ffb4d22c8e6d8` |
| [FIPS-140-3-Implementation-Guidance.pdf](./FIPS-140-3-Implementation-Guidance.pdf) | FIPS 140-3 / CMVP 实施指南；封面标记最后更新 2026-08-19 | [NIST PDF](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS%20140-3%20IG.pdf) | `15ebdd396a31129f9d75137ace99be56b1085feb25a95c990f8b6558440aeb02` |
| [FIPS-140-3-CMVP-Management-Manual.pdf](./FIPS-140-3-CMVP-Management-Manual.pdf) | CMVP 管理手册，版本 2.7，封面日期 2026-04-09；§4.8 熵源/RBG 验证流程 | [NIST PDF](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS-140-3-CMVP%20Management%20Manual.pdf) | `e2efe42a638efd3b96446aa502079925ef875d4794ae530aa4f8b74983dc4584` |
| [NIST SP 800-90A Rev.1（仓库既有副本）](../sp800-90a-drbg/NIST.SP.800-90A.pdf) | §8.6.5 批准的随机性源；§8.6.6 熵输入和 seed 的敏感性 | [NIST 出版页](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final) | 本次未另行重下；使用仓库既有副本 |

## 核验结论

- FIPS 140-3 IG §9.3.A Additional Comment 10 允许用回调取得熵，但回调路径仍须在模块与 `GetEntropy()` 之间保持直接连接，且密码边界外不得有实体或代码操纵熵数据；“用了 callback”本身不证明满足直接访问要求。

- SP 800-90A Rev.1 §8.6.5 要求 DRBG 在实例化和重新播种时使用 approved randomness source；该来源须是符合 SP 800-90B 的熵源，或符合 SP 800-90C 的 RBG。因此，调用 OS 随机 API 这一事实本身不能证明符合该定义。§8.6.6 进一步规定，DRBG 熵输入和 seed 须按其保护的数据所需安全强度保护；在模块验证中，熵输入作为 CSP，须来自包含该 DRBG 功能的模块内部，或由另一密码模块经安全信道传入。该规定是 DRBG 熵输入的特定要求，不是所有外部随机字节接口的通用规则。
- NIST 当前 [FIPS 140-3 实施指南](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS%20140-3%20IG.pdf)（2026-08-19）§9.3.A 对用于 SSP 生成的 DRBG 熵来源再作场景区分：模块通过已定义来源的 `GetEntropy()` 主动取熵，与调用者被动灌入外部熵/seed 不是同一证据路径。被动接收 TOEPP 外的熵属于指南所述的少见情形，若允许适用，安全策略需说明输入量/熵假设并带“不能保证生成 SSP 的最低强度”等证书 caveat；已知少于 112 bit 时不得验证。若熵源位于 TOEPP 内，模块却没有直接调用其 `GetEntropy()` 接口，则指南明确该模块不能验证。上述规则只针对 DRBG 熵输入，不能外推为所有随机字节 API 的规则；调用独立 RBG 服务输出也不能与原始熵/seed 灌入混为一谈，需另按 RBG/模块证书、运行环境与边界核定。故 NIST 方案冻结前，必须将实际接入形态映射到当期 §9.3.A 情形和适用证书 caveat，并由目标实验室确认。
- 最终版 SP 800-90C 的 RBG1 是受约束构造，不等于任意“外部随机字节 provider”：它一次实例化、无 reseed 能力，外部随机性源须满足规定的 RBG2(P)/RBG3/RBGC 条件，且通过物理安全通道播种；耗尽 seedlife 或 DRBG 健康测试失败须终止使用。需持续供数的产品不能未经构造分析就称为 RBG1。
- CMVP 管理手册 §4.8（2026-04-09）规定：新模块若需要熵源或 RBG 验证，模块提交需引用既有熵源验证证书或 RBG 构造证书；不再把熵源作为模块证书中的 ENT 项目提交。RBG Full Submission 需要论证符合 SP 800-90C 的 RBG Report。证书及其运行环境范围须与拟认证模块实际依赖相符。
- NIST 的[ESV 公告页](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/announcements-1)显示，CMVP 自 2026-05-07 起接受论证符合 SP 800-90C 的 RBG 提交；2026-06-26 发布了 RBG Report Template v1.2 更新。此为计划受理状态，不保证特定实验室有档期，也不构成拟建产品已符合或获验证的证据。
- NIST 的[Entropy Source Validation Search](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/search)是熵源证书检索入口，字段包括证书号、供应商、实现名称、描述、噪声源分类、复用状态和验证日期；页面标记 2026-08-21 更新。2026-09-30 无过滤查询显示 356 条记录、15 页（默认每页 25 条）。定向核对了几个证书：E8 [Red Hat Kernel CPU Time Jitter RNG](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/certificate/8)标注“仅限供应商复用”，运行范围列为 RHEL 8 / Intel Xeon Silver 4216；E30、E127、E300 也标注供应商限定复用。E24 [JEnt-MemOnly](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/certificate/24)虽标注“开放复用”，其[Public Use Document](https://csrc.nist.gov/CSRC/media/projects/cryptographic-module-validation-program/documents/entropy/E24_PublicUse.pdf)只列出特定 Ubuntu 18.04 / Intel Xeon 6252 平台与配置，并指出纳入 FIPS 140-3 模块提交需联系实现方；因此“开放复用”不能单独证明任意平台可用或已满足模块提交条件。本次没有把任何证书选为拟建模块来源；目标 CPU/OS 尚未确定，须逐项匹配证书范围、PUD 和集成条件。该目录不是通用 RBG/DRBG 来源清单；RBG 提交通过 ESV Server 按 SP 800-90C 另行提供构造证据。
- 国家密码管理局当前公开的[商用密码检测机构名录](https://www.oscca.gov.cn/app-zxfw/xzspsx/symmjcjiancha.jsp?channel_code=c100248)列检测机构、资质范围和有效期，包含 RNG 与其他密码模块检测范围；它不是具体产品或随机源证书目录。本次在所查官方公开页面未核实到可检索的具体 RNG 产品证书入口；这是有界检索结果，不能据此断言不存在，路线确定后仍须在官方认证业务门户核实。
- 本地 FIPS 140-3 实施指南副本与 NIST 当前目录一致，封面版本为 2026-08-19（SHA-256 已核对）。D.K「Resolution 23」（印刷页 207–208）解释 SP 800-90B §3.2.1：物理噪声源须说明其正确工作的运行条件范围，并支持该范围内熵率相近；指南建议比较在温度、电压、系统活动等有影响条件下采集数据的统计测试结果，或论证数据来自最不利条件。多运行条件评估截至 2026-12-31 为强烈建议，此后为要求；指南允许实验室逐案接受替代论证。它针对 NIST 熵源评估中的物理噪声源，不是对所有外部随机字节接口的统一要求；具体测试计划仍由适用指南和实验室审查确定。[FIPS 140-3 实施指南与修订历史](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-ig-announcements)
- FIPS 140-3 实施指南中关于 SP 800-208 HBS 密钥生成的“熵源须在模块物理边界内”是该特定方案的要求，不能推广成所有软件密码模块/所有 DRBG 的通用边界规则。
- GM/T 0028-2024 §7.9.2 明确允许密码模块包含随机数生成器、随机数生成器链，或自身就是随机数生成器；核准安全功能或敏感安全参数生成/建立需要随机值时，必须由核准随机数生成器提供。若熵从密码边界外采集，将熵作为输入所生成的数据流按关键安全参数保护；每个关键安全参数的采集最小熵不少于 256 bit 且不少于该参数的比特长度。安全策略还要说明随机数生成器、用途及熵源。
- GM/T 0039-2024 §6.2 将这些要求落到送检材料与检测程序：列出核准随机数生成器及用途，说明核准操作所用随机数由核准生成器产生，并由检测人员核对。GM/T 0134-2024 §14.4 要求按 GM/T 0028 保护 RNG 状态信息，并按 GM/T 0103 界定状态信息。故“模块能接入随机源”须落实为通过固定接口连接可审查的 RNG/RNG 链路，并提供符合目标方案的来源与依赖证据；熵输入及 RNG 状态保护责任应按最终认证边界明确。仅有返回字节的接口不足以证明符合性。
- GM/T 0105-2021 §5.1–5.2 将系统熵源以及系统/硬件随机数发生器作为软件 RNG 可采用的输入；§5.4–5.5 涉及熵评估与启动/连续健康测试，§7.3 要求随机源互斥使用。该指南说明“能接入系统或硬件随机源”是可行设计路径，但不能据此推断任意 OS API、任意外部 RNG 或拟建固定密码模块已满足认证要求；须按产品边界、其他适用标准和机构解释核定。
- 已取得的 GM/T 0028/0039/0134/0105 全文来自标准信息公共服务平台公开下载入口。它们解决标准原文的可得性，不等于机构已确认具体 OS CSPRNG/外部 RBG 的受理边界；目标产品的来源、证书/依赖、运行环境和认证范围仍须由具备相应资质的机构确认。

<!-- standard-body:start -->

## 标准内容

本目录对应 **随机源与密码模块验证：官方资料**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。

## 实现与验证映射

本目录当前没有直接映射的积木块：它作为标准依据或索引存在，实现映射见覆盖矩阵。

暂无示例工作区、模板或搭建指南。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
