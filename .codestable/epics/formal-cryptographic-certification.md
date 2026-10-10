---
status: proposed
created: 2026-09-29
work: ../work/epic-formal-cryptographic-certification.md
---
# CipherCat 正式密码验证与产品认证

## 起点

Owner 要求持续推进至取得适用的正式密码验证/认证结果。仓库已有的《全量密码标准符合性准备》Epic 继续负责当前 Blockly 块、procedure、Demo 与标准条款的内部证据链；该 Epic 的通过不等于正式认证。本 Epic 单独确定可以送入外部验证计划的产品边界，并持续到主管计划发布可核验的正式结果。

当前产品事实：

- CipherCat 是浏览器/Tauri 教学与研究前端；Blockly 工作区可生成 Python/JavaScript 源码，代码由用户复制、保存或在其运行环境执行。任意工作区可产生不同代码，不能将整个编辑器、每个积木、每个模板和每个 Demo 当作同一固定密码模块。
- Metacrypto 是随机性和密码分析评测平台：随机性链路在隔离后端执行用户提交的代码并生成待测样本，平台再对样本评估；配套 `randomness/` Go module 是统计检测库，`lcplt/` CUDA 组件只检测已有序列，MCL/SM4 代码在动态编译与性能基准路径，未发现固定接口的独立密码服务模块。这不使平台成为随机数发生器或熵源产品，也不构成选定的新固定模块。若目标是公开出具具有证明作用的商用密码检测/评估结果，机构资质与平台软件边界必须分开判断。（只读证据：`metacrypt_server/AGENTS.md`、`randomness/go.mod`、`lcplt/README.md`、`backend/owl_admin/mcl_cuda_compiler/`，2026-09-30。）
- 现有 NIST 路径至少区分固定算法实现验证（CAVP/ACVP）与密码模块验证（CMVP/FIPS 140-3）；算法验证不能替代模块验证。
- 中国商用密码产品认证按官方发布的产品目录和认证规则实施。第一批目录的“其他密码模块”明确包含软件密码模块；第二批另列软件随机数发生器。目录定义不等于主管机构已确认本项目可申报。密评、检测机构资质、产品认证及熵源验证不是同一结果。
- 上述适用性结论是基于当前仓库形态与公开官方资料的工程判断，不构成法律意见或认证机构的受理承诺。

## 可行性与产品边界方案（初稿，2026-09-29）

Owner 已确认可行性阶段覆盖“all”适用路线。此决定表示把中国商用密码产品认证、NIST 算法验证/CMVP、熵源/RBG，以及相关的密评/检测机构资质边界一并纳入路线比较；不表示同时申报、同时开发多个认证产品，亦未选择首个市场、产品或申请主体。

Owner 已选择新建一个独立、固定边界的密码软件模块作为首个产品候选，并要求模块能够接入随机性源。此选择确定了产品方向和一项必需能力，但不等于现有 CipherCat 代码已经是该模块，也未确定目标市场、申请主体、算法/平台、随机性源接口层级，或随机性源是否纳入模块认证边界。

| 路线 | 可申请/验证的对象 | 当前可行性判断 | 不能据此声称 |
|---|---|---|---|
| NIST CAVP/ACVP | 冻结的单个 Approved 算法实现及其能力、版本和运行环境 | **算法级正式验证候选，不是本目标的产品/模块终点**：SHA3-256 有独立 Blockly 算法块与 JS/Python 生成实现；NIST 当前提供 SHA3 测试且无前置算法要求。若后续选 FIPS 模块路线，CAVP 可作为模块内算法的正式验证前置；若 owner 明确只要算法验证记录，才可将其作为独立结果。Python 与 JavaScript 是不同实现边界，不能用一方验证覆盖另一方。正式生产环境经具备相应资格的实验室运行。 | 不认证 Blockly、任意用户工作区或其他算法；CAVP 算法验证本身不等于 FIPS 140-3 模块验证，也不等于中国商用密码产品认证。Demo ACVTS 和本地向量测试都不是正式验证。 |
| 中国商用密码产品认证：其他密码模块 | 目录定义的软件/硬件/固件密码模块及其认证单元 | **国内多算法软件模块的优先候选，尚待受理确认**：第一批目录将“其他密码模块”定义为实现密码运算、密钥管理等安全功能的软件、硬件、固件及组合，包含软件密码模块；依据为 GM/T 0028。现行版为 GM/T 0028-2024（2025-07-01 实施，替代 2014 版），GM/T 0039-2024 是检测要求，GM/T 0134-2024 是设计指南。目录注释把算法范围限定为符合国家密码管理要求的商用密码算法，因此不能据此把 AES、SHA3 或 PQC 自动纳入国内证书范围。当前仓库有 SM2、SM3、SM4、ZUC、SM9 等教学生成器，但没有已冻结的独立模块包、密钥/角色/服务边界、产品安全策略或可申报版本；“其他密码模块”是否适用于拟建产品、可测安全等级及确切算法范围须由认证/检测机构确认。 | 不认证整套 CipherCat、任意 Blockly workspace、所有语言实现或所有算法；目录条目存在、检测机构名录含该类，不代表本产品已获受理或可获证。 |
| 中国商用密码产品认证：软件随机数发生器 | 目录定义的软件 RNG 产品 | **独立候选，范围比通用密码模块更窄**：第二批目录明列软件随机数发生器，依据 GM/T 0103、GM/T 0105、GM/T 0028。当前 `gm_rng` 接收调用者提供的 entropy、nonce、personalization 并确定性地产生字节；它是教学构件，没有集成/声明熵源、熵收集边界、完整健康测试和固定产品运行边界。若选择此类别，应另行设计具备明确定义熵输入与生命周期的产品；随机统计报告不能替代熵源或模块认证。GM/T 0105-2021 官方全文已从国家标准信息公共服务平台公开入口取得并保存；其条款对拟建固定密码模块的适用性仍须核定。 | 不能因为存在 GM/T 0103 页面、某个 DRBG 块或固定 Demo 就称软件 RNG 产品认证；不能用伪随机输出通过统计测试证明熵源质量。 |
| 中国密评/检测机构资质（Metacrypto 方向） | 实际网络与信息系统；或向社会出具证明性评估结果的检测机构 | **不是 CipherCat 的产品算法认证路线**。密评评估的是系统中密码技术、产品和服务的合规性、正确性、有效性；向社会出具具有证明作用的密评数据/结果，机构需取得商用密码检测机构资质。Metacrypto 作为工具不等于检测机构。 | 不能仅凭平台测试通过声称系统已密评、机构已获资质，或被测熵源通过认证。 |
| NIST CMVP/FIPS 140-3 | 有明确密码边界、接口、角色/服务、平台和安全策略的完整密码模块 | **NIST 路线的产品/模块级终点**。除算法验证前置外，还需要模块级安全设计与保障证据、指定实验室测试和 NIST 审核；动态教学 IDE 与任意生成代码不构成单一模块边界。应另行定义固定软件密码模块，将正式范围内的算法、接口和运行环境纳入同一产品证据。 | 收齐若干 CAVP 算法验证也不等于模块验证。 |
| 熵源验证 | 明确的熵源、采集与调理链路、设计说明及原始噪声样本 | **需单独立项**。项目当前是算法教学/后端测评，不拥有统一硬件噪声源；对伪随机输出做统计测试不能替代熵源验证。 | GM/T 0005 测试或统计通过不是熵源认证。 |

NIST 的当前算法测试并非只有 SHA3：CAVP/ACVP 已列出 ML-KEM、ML-DSA 和 SLH-DSA 的操作/前置算法要求，FIPS 140-3 实施指南也纳入 PQC 模块自检要求。因此若产品目标包含 PQC，应以实际模块能力为范围完整评估这些端点和依赖，不能把 SHA3-256 试点当成完成。当前仓库 ML-DSA 仅覆盖 ML-DSA-44 的受限接口与单组 deterministic 样例；ML-KEM KeyGen 仍有教学内部步骤模板，不能代表完整 KeyGen/EncapDecap 产品接口。这一差距已记录为当前的实现事实，而非路线裁剪依据。

### 其他市场相关认证路径

Owner 的“all”是把适用路线纳入可行性比较，不表示全球所有国家同时申报。目标市场仍待确认；当前有官方资料支撑的补充短名单如下：

- **日本 JCMVP**：IPA 官方页面显示，密码模块认证新申请自 2024-04-01 起暂停，期间只继续受理密码算法确认申请。其 2026-04-03 更新的标准页列出 ISO/IEC 19790:2025、24759:2025，但新标准下模块申请须等认证受理恢复后另行通知；暂不能作为当前可执行的新模块申报路径。[受理状态](https://www.ipa.go.jp/security/jcmvp/index.html) · [标准与移行](https://www.ipa.go.jp/security/jcmvp/kikaku.html)
- **韩国 KCMVP**：KISA 当前公开的制度面向韩国国家/公共网络密码模块，列出申请、试验机构、国家情报院和验证委员会的流程；公开概览当前仍列 KS X ISO/IEC 19790:2015、24759:2015。仅当韩国市场/采购相关时纳入优先路线，并在申报前核实当期算法、随机性证据、等级与主体条件。[制度概览](https://seed.kisa.or.kr/kisa/kcmvp/EgovSummary.do) · [试验与验证流程](https://seed.kisa.or.kr/kisa/kcmvp/EgovProcedure.do)
- **马来西亚 MyCV**：由 CyberSecurity Malaysia 的 ISCB 管理，覆盖 CMV 与 CAV；官方“验证中项目”清单列有预计于 2026 年第四季度完成的评估，说明存在在途验证，但不证明正在开放新申请。CAV 是 CMV 前置条件，申请页面要求联系方案方；外国申请资格与新申请受理仍须确认。算法须在 MySEAL 批准清单内，方案采用 ISO/IEC 19790:2012、24759:2017 并已公布向 2025 版标准移行时点。SM4/ZUC 未在当前 AKSA MySEAL 2.1 批准清单检索到，不据此推定排除。对马来西亚 CNII 的 PKTN 产品选择流程是另一道程序，并非 MyCV 证书。[MyCV](https://mykripto.cybersecurity.my/index.php/services/mycv) · [How to Apply](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/how-to-apply) · [验证中项目](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/list-of-algorithm-and-module-under-validation) · [方案概览](https://www.cybersecurity.my/portal-main/services/mycv-overview) · [标准移行通知](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/licensed-cvf) · [MySEAL 算法表](https://mykripto.cybersecurity.my/index.php/services/myseal/myseal-category/aksa-myseal/aksa-myseal-approved) · [PKTN](https://www.cybersecurity.my/portal-main/services/pktn-overview)
- **Common Criteria / EUCC**：可按 Security Target 与适用 Protection Profile 评估指定 IT/ICT 产品或部件；CC 官方资料库包含密码模块保护配置文件。EUCC 是欧盟 Common Criteria 产品网络安全认证方案，欧委会当前说明为自愿认证。可在合同/采购要求触发时作为产品安全评估路线，但证书仅覆盖其 TOE/声明范围，不替代中国商密认证、NIST 算法/模块验证或 KCMVP。[CC Portal](https://www.commoncriteriaportal.org/index.cfm) · [密码模块保护配置文件目录](https://www.commoncriteriaportal.org/pps/index.cfm) · [欧盟网络安全认证框架](https://digital-strategy.ec.europa.eu/en/policies/cybersecurity-certification-framework) · [EUCC 法规](https://eur-lex.europa.eu/eli/reg_impl/2024/482/oj)
- **BSI Group 密码模块安全方案**：其公开 2024 概要称方案按 ISO/IEC 19790 并采用 ISO/IEC 24759 测试，属于 ISO/IEC 17067 Type 1a 发布方方案、证书最长三年，且软件模块最高 Level 2。它不是国家政府认证项目；当前受理、认可范围与具体采购接受度仍须确认，不能与德国联邦信息安全局（BSI）混淆。[方案概要](https://www.bsigroup.com/siteassets/pdf/en/products-and-services/bsi-certification-scheme-for-cryptographic-module-security-fv1.pdf) · [方案页面](https://page.bsigroup.com/bsi-certification-scheme)

该清单是依现有候选市场确定前的有界路线比较，不声称穷尽所有国家制度。马来西亚 MyCV 与 PKTN 需分别判断；BSI Group 是发布方方案，不列作国家计划。目标市场明确后再判断是否纳入其他本地方案；不得由路线数量推导并行申报或互认范围。

### 国内优先候选的产品边界草案

若 owner 选择国内商用密码产品认证，建议先以**独立、固定版本的软件密码模块**作为产品候选，向认证/检测机构确认是否归入第一批目录“其他密码模块”。这比直接把整个 Blockly IDE 当成模块、或在尚无熵源的条件下先选软件 RNG，更贴近当前已有的多算法实现；这只是工程上的优先调查方向，不是受理结论。

| 边界 | 纳入或排除 |
|---|---|
| 候选被测产品 | 单独发布、版本固定的软件密码模块（具体选择可链接库或服务包，须由产品设计和认证机构确认）；限定受支持的 CPU/OS/编译器/运行时、构建产物、API、角色/服务、算法参数、密钥生命周期与安全策略。若要求 LoongArch/龙芯或其他信创平台，需把具体软硬件组合列入支持矩阵并单独验证。 |
| 可能纳入的算法 | 先按当前可复核实现清单选择 SM2、SM3、SM4、ZUC、SM9 中确有完整实现与测试证据的子集；以认证目录允许范围和机构确认为准。不得把仓库中“有块/有 Demo”视为实现完整或符合认证条件。 |
| 不纳入该模块边界 | CipherCat Blockly 编辑器、动态生成器、任意用户代码/workspace、教学 procedure 和 Demo、Metacrypto 统计/分析平台。它们保留为开发、教学或独立测评工具，不随模块证书获得认证。 |
| 随机性源接入要求 | 模块必须通过明确、固定的接口接入 RNG/RNG 链路；GM/T 0028-2024 §7.9.2 允许模块包含 RNG、RNG 链或自身为 RNG，并要求核准功能/敏感参数生成所需随机值来自核准 RNG；边界外采集熵及其生成数据流按关键安全参数保护，最小熵不少于 256 bit 且不少于参数长度。GM/T 0039-2024 §6.2 要求提交 RNG 清单、用途及来源证据并由检测人员核验。具体选外部 RBG/DRBG 输出还是熵输入、来源证书/依赖及认证边界仍待决定；普通 OS 随机 API 不自动视为获认可。工程验收须证明相关服务确实经声明接口取数、来源不可用或按策略报告故障时正确失败且无未声明回退；测试替身/固定值不得形成生产旁路。现有教学生成器没有统一产品接口；SM2/SM9 还允许显式 nonce/scalar，ML-DSA 默认 `rnd=0^32`。应逐算法冻结随机用途和确定性/随机化策略。 |
| 需要另外作产品决定的事项 | 模块是否还提供内置 DRBG/RBG、熵源采集/评估/健康测试；如纳入，须按目标路线定义责任、检测要求和适用等级。物理熵源不是本项目已有事实。 |

模块边界应落实为可复现的产品包、固定发布版本、依赖和目标平台清单、公开/内部接口、服务与错误行为、密钥导入/生成/存储/销毁策略、自检与故障状态、构建来源和变更控制。不能仅从生成器导出某段 Python/JavaScript 就声称得到密码模块；先需形成独立产品，再按受理机构意见确认具体安全等级及适用要求。当前名录可查询到“其他密码模块”检测范围，但具体实验室是否承接该软件类型、拟申报等级与算法组合仍需核实。

商用密码产品证书仅覆盖证书载明的产品和范围，不自动等于“信创适配/入围”或龙芯、国产操作系统的兼容性结论；如这些也是交付目标，应作为独立验收项和平台证据，不扩大密码模块证书的声明范围。

### 对“所有 block、procedure、demo 都要认证”的范围解释

项目级目标应保留为：每个 block、procedure、demo 都有唯一的标准/原语映射、实现边界、适用向量、正负例和测试状态；适用处逐项达到其标准测试要求，缺口公开登记。这里的“全部”是项目内部符合性证据覆盖，不是要求认证机构给每个 Blockly 原子块分别发证。外部证书只覆盖认证计划定义且申请材料明确列出的冻结算法/产品、版本、参数和平台；其余条目映射到父算法/产品或明确标为教学、组成构件、不适用。不得用一项算法证书扩张为全仓库认证。

### 产品级终点与组织前置条件

- 国内商用密码产品认证规则规定的认证模式是“型式试验 + 初始工厂检查 + 获证后监督”；认证单元原则上按产品型号划分，版本变化需提供差异说明，软件若无实体包装/载体需在许可协议显著位置标明认证。它不是只运行一组算法向量的实验室测试。申请主体/研制或生产企业、产品一致性控制、质量/安全保障资料及持续监督能力是实质前置条件；目前仓库没有证据证明已有合适的申请主体或生产保障体系，此项待 owner 确认。
- 国家密码管理局 2025-04-30 公告确认原检测中心自 2025-05-01 停止商用密码检测认证业务，未完成事项由商用密码检测认证中心（商用密码标准研究院）承接，并允许有效期内的旧证书申请换发为该中心颁发的证书；该中心不能仅按普通检测实验室理解。国家密码管理局当前在线行政审批结果页列出该中心的“随机数发生器”及“其他密码模块”产品检测范围，资质有效期至 2028-12-02；另有检测机构列出相应产品类别，部分范围限定为 GM/T 0028 安全等级二级及以下。此证据表明存在可查的认证/检测通道，但不等于拟建模块已获受理，也不确认其安全等级、算法范围、费用或排期；申报前须分别确认现行认证主体与检测范围。[业务调整公告](https://oscca.gov.cn/sca/xwdt/2025-04/30/content_1061250.shtml) · [行政审批结果查询](https://www.oscca.gov.cn/app-zxfw/xzspsx/symmjcjiancha.jsp?channel_code=c100248)
- 在当前实现基线上，未找到独立、固定的软件密码模块产品，也未找到具备熵源与完整生命周期边界的软件 RNG 产品。GM/T 0105-2021 官方全文已取得并核对随机源输入、熵评估、健康测试和互斥使用等条款；仓库尚无该标准的结构化拆分。若后续产品确实包含软件 RNG，还需把适用条款映射到产品设计和测试。正式启动前还需确认申请主体/产品组织和产品持续一致性能力，而不是只从现有 Blockly 代码抽一个函数。
- 一个模块/产品证书不会自动覆盖全仓库所有算法、实验性数学块、教学模板与 Demo。全项目仍按《全量密码标准符合性准备》逐项做符合性证据；若 owner 要求多种算法产品级证书，需按可受理产品及各计划范围拆成多个冻结送测单元，并维持版本与证书对应关系。

### 建议的决策顺序

1. **若主要目标是国内市场/信创落地**：首选调查“其他密码模块”类别的书面受理条件，目标产品暂定为单独发布的商用密码软件模块；先确定算法子集、平台、安全等级、申请主体和持续质量/生产保证能力。由于目录算法注释有限，PQC、AES/SHA3 等不能默认包含。若模块分类或主体条件不满足，再评估软件 RNG 类别，但它要求独立熵源边界，当前离产品化更远。
2. **若主要目标是国际/FIPS**：正式终点为 CMVP/FIPS 140-3 固定软件模块；SHA3-256 CAVP 仅是候选模块的算法级前置/子结果。需先确定模块边界、算法服务、平台与等级，再和合格实验室核实计划与成本/时间。
3. **若只要求算法级正式记录**：可单独考虑 NIST CAVP/ACVP 的固定算法实现，但这不能满足“产品/模块认证完成”的目标。
4. CipherCat 继续作为教学/研究前端，维护全量标准符合性矩阵；从中抽取固定产品而非任意代码。Metacrypto 的机构资质/密评报告及熵源验证如成为目标，另立独立边界和认证/资质路径。

本建议是可行性方案，不是 owner 对目标市场的最终选择，也不是主管机构受理结论。尚未联系实验室或认证机构。

## 目标

围绕 owner 选择的新建固定密码软件模块，确认首要目标市场、申请主体、主管计划及随机性源责任边界；在 owner 批准具体路线后完成产品边界冻结、缺口修复、适用标准与正式测试、独立审查、与具备资质的实验室协作及申报闭环。只有主管认证/验证计划发布的证书或正式验证记录覆盖所选产品版本、实现、参数和运行环境，才算达到本 Epic 终点。

全量积木、procedure 和 Demo 继续按现有符合性准备 Epic 建立标准条款和测试证据。正式验证计划不独立受理的原语/教学构件，须映射到被测父算法或模块边界并说明覆盖关系；不能将其描述为各自取得证书，也不能未经 owner 决定就从全量覆盖目标中删除。

## 范围

- 以新建固定密码软件模块为首个产品候选，比较其适用的国内商用密码产品认证与 NIST 路线；CipherCat 前端/桌面应用、Metacrypto 测评软件/服务、现有算法实现及实际部署系统仅作为相关产品边界或评估适用性证据，不与该模块认证对象混为一谈。
- 将接入随机性源作为模块必需能力，确定固定接口、来源类别、依赖/信任假设、失效行为及该源与模块的认证边界；具体来源和技术层级待 owner 决定。
- 按目标市场核对适用计划、目录类别、版本/参数/运行环境、前置验证、实验室资格、申请主体、必要的生产/质量保障条件与外部证据要求。
- 路线获 owner 批准后，完成产品化边界、实现、测试、资料与实验室验证工作；持续跟踪不符合项，直到正式结果可在主管计划或认证机构处核验。
- 在整个过程中继续并引用《全量密码标准符合性准备》Epic，保持内部算法/原语/模板/Demo 证据与外部证书范围分开呈现。

## 非目标

- 不承诺 Blockly 原子块、所有可组合 workspace 或全部 Demo 分别取得官方证书；如正式计划有不同的产品划分，以主管计划确认的对象为准。
- 不将仓库测试、ACVTS 演示环境、统计检测、覆盖率、Demo 通过或实验室预评估称作正式证书/验证。
- 不把一般信息系统密评、商用密码检测机构资质、产品认证、算法验证、模块验证或熵源验证混称为“平台认证”。
- 不把初步工程判断当作法律意见或机构受理决定。
- 未经 owner 对应的单独授权，不联系或代表申请主体承诺实验室费用、不签约、不付款、不申请账户、不提交软件/商业材料。

## 验收标准（草案）

1. owner 明确批准被测产品/模块、目标市场、主管计划、申请主体和可接受的正式结果类型；路线适用性由主管计划/具备相应资质的机构书面确认或提供可核验依据。
2. 被测产品有冻结的边界、名称/版本、源码与构建标识、算法/服务接口、RNG/RNG 链路接口及其输入类型、参数集、运行环境、依赖、威胁与安全假设；每个核准功能和敏感参数生成/建立路径使用的 RNG、用途、来源与认可依据均有映射；边界外采集熵时有关键安全参数保护和标准要求的最小熵证据；明确源的健康/可用状态、失败行为及是否属于被测边界。若走 NIST 路线，须按提交时有效的 FIPS 140-3 IG §9.3.A 将实际路径映射到主动 `GetEntropy()`、被动外部熵/seed 接收或其它适用情形，记录相应证书 caveat；将独立 RBG 服务输出与原始熵/seed 输入分开评估。熵源位于 TOEPP 内却无直接 `GetEntropy()` 访问时不得作为符合路径。工程测试须证明随机相关服务确实调用声明的 RNG 接口，来源不可用或规定的故障状态下按策略失败且没有未声明回退；测试替身或固定测试值不能形成生产调用方可启用的旁路。范围外的前端编辑器、教学工作区和测评工具明确区分。
   - NIST 熵源若经回调访问，回调路径仍须保持模块到 `GetEntropy()` 的直接连接，且密码边界外的实体或代码不得操纵熵数据。
3. 适用标准、前置算法、测试数据/ACVP 配置、实验室资质、申请材料和运维/生产保证要求逐项映射到证据与责任人；不适用项有可复核理由。
4. 本地测试与独立审查覆盖所选产品范围；缺陷、边界、错误路径和版本信息可复现；本地通过仍不得表述为正式认证通过。
5. 主管认证/验证计划对同一冻结产品版本、参数和运行环境签发正式证书或验证记录，并可由第三方核验；未覆盖的算法、参数、平台、版本与用途不得扩张声明。
6. 对外说明与产品文档准确区分内部符合性证据、实验室测试中、正式申请中、已签发正式结果和证书状态。

## 共享语言与概念边界

- **标准符合性证据**：规范条款、实现范围、适用向量/条件、执行结果与版本之间可复核的映射；不是主管计划签发的证书。
- **算法验证（CAVP/ACVP）**：对特定算法实现、操作及参数范围进行的正式测试/验证；不自动验证承载它的整个平台或密码模块。
- **密码模块验证（CMVP/FIPS 140-3）**：针对边界和运行环境明确的密码模块，按模块安全要求由计划认可的实验室测试并由计划审核；不是算法向量测试的同义词。
- **中国商用密码产品认证**：对官方目录所定义产品类别和认证单元按其规则实施的产品认证；不因软件内部使用了商用密码算法就自动适用。
- **商用密码应用安全性评估（密评）**：对实际网络与信息系统中商用密码技术、产品和服务的合规性、正确性、有效性开展的评估；不是被测软件产品的密码算法证书。
- **检测机构资质**：机构出具特定范围证明性检测/评估结果所需的资格；与其使用的评测平台软件是否取得产品证书分别判断。
- **熵源验证**：针对可识别的熵源、采集链路、原始噪声样本与设计材料；随机性统计平台自身或用户提交的任意序列不能替代。
- **随机性源（randomness source）**：本 Epic 按 NIST SP 800-90A Rev.1 使用该术语，指可为确定性生成机制提供随机性输入的熵源、非确定性随机比特生成器（NRBG）或 DRBG；因此不把“随机性源”默认为物理噪声源。
- **随机性源接入接口**：拟建模块中消费随机性输入的固定产品 API；随机性源可由模块内部组件或受控外部依赖提供，具体位置按所选产品与验证计划确定。接口本身不认证源实现、熵质量或来源。

端到端边界场景：模块收到密钥生成请求时，通过冻结的随机性源接口获取所需输入；若来源不可用或其可提供的健康状态报告故障，不得静默切换到未声明的弱来源。原始熵输入与外部 RBG/DRBG 输出属于不同接入契约，源是否计入模块验证边界由目标计划和已选产品设计决定。用户在 CipherCat 编辑 ML-DSA 工作区并导出 Python 代码时，变化的仍是用户源码，不是自动产生一个已认证产品。若拟将 Metacrypto 生成的测评报告用于正式评估或证明用途，须另行确认适用制度及出具机构资质；平台报告本身不等于正式认证、密评结论或熵源验证。

## 待决策

- **DEC-1 · 首要市场与认证优先级** `[HITL]`
  - question: 固定密码模块首先要满足哪个市场、采购或法规要求，并据此优先核验哪条认证路线？可选中国、美国/加拿大 CMVP、其他明确市场，或暂不指定首要市场；无论选哪项，所有已识别且适用的路径仍纳入比较，不自动并行申报。
  - depends_on: none
  - method: owner-dialogue
  - evidence: 已比较中国商用密码产品认证、算法验证、美国/加拿大 CMVP 与有条件适用的其他路径；Owner 已要求比较所有适用路线，并已选择新建固定边界的软件密码模块，但尚未指定首要市场/采购要求。
- **DEC-2 · 目标运行环境** `[HITL]`
  - question: 首个候选模块要声明并验证哪一种 CPU/架构、操作系统版本、编译器/运行时及交付形态？请给出具体目标；如尚未选定，可明确答“未定”。
  - depends_on: DEC-1
  - method: owner-dialogue
  - evidence: 随机性源证书与模块运行环境可能受平台、配置和复用条件限制；已核实的 NIST 熵源证书示例并非任意平台通用，龙芯/LoongArch 当前构建与运行支持也尚未在目标机验证。参见《产品认证可行性方案》的目标平台与熵源证书范围。
- **DEC-3 · 申请主体与生产责任** `[HITL]`
  - question: 哪个法律实体拟作为申请/认证委托主体，哪个实体承担研发、生产/发布以及持续质量与安全保障？若尚未设立或指定，请明确答“未定”。
  - depends_on: DEC-1
  - method: owner-dialogue
  - evidence: 中国产品认证涉及生产一致性及质量、安全保障责任；美国/加拿大 CMVP 流程涉及 vendor 与认可实验室的职责。具体主体和组织关系不能从仓库或开发者所在地推定。
- **DEC-4 · 随机性源接入形态与边界** `[HITL]`
  - question: 首版通过已声明且具有目标计划所需证据的外部 RNG/RBG 接口消费随机比特，还是在固定模块内接收原始熵并构造 RBG？请据此确定 RNG/RBG 是否属于模块内部组件或受控外部依赖；硬性要求仍是模块必须能够接入可审查的随机性源。
  - depends_on: DEC-1, DEC-2
  - method: owner-dialogue
  - evidence: Owner 已明确要求模块能够接入随机性源。本地 NIST SP 800-90A Rev.1 原文区分熵源、NRBG 与 DRBG；§8.6.6 的熵输入保护条件仅适用于 DRBG 熵输入，不泛化到所有外部随机比特接口。SP 800-90C RBG1 有专属来源、生命周期和供数约束。定向核查的 NIST 熵源证书存在供应商复用限制；即便标注开放复用，其 PUD 仍可能限定平台/配置和模块集成条件。当前教学生成器没有共享的产品级随机性注入接口。细节与官方依据见 `docs/standards/randomness-certification-sources/README.md`；具体 API、来源和验证边界须结合已选市场及平台确定。

## 关键决策

- owner 已确认本 Epic 的可行性比较覆盖所有适用路径，并选择新建固定密码软件模块作为首个产品候选，且要求模块可接入随机性源。目标市场/正式申报路线、申请主体、目标平台以及随机性源的输出类型和认证边界仍待决定。当前产品级主要比较路线为中国商用密码产品认证与美国/加拿大共同管理的 CMVP/FIPS 140-3（由 NIST 与加拿大网络安全中心共同管理）；该联合治理范围不代表其他国家或所有采购部门自动接受验证结果。日本 JCMVP 的新模块申请仍暂停，韩国 KCMVP 仅在韩国公共网络/采购范围相关时优先，马来西亚 MyCV（CAV 为 CMV 前置；MySEAL 算法范围、申请资格与标准移行须核实）按目标市场评估；其 CNII 采购可能另涉及 PKTN，不等同于 MyCV 证书。Common Criteria/EUCC 按产品安全目标与采购要求评估；BSI Group 有 ISO/IEC 19790 发布方方案，但不是国家计划，当前受理与采购接受度待核。CAVP/ACVP 是算法级验证，不能替代模块验证；各国家/发布方路线不自动互认。Metacrypto 报告若拟作正式评估或证明用途，仍须另核适用制度与出具机构资质；平台报告本身不等同于正式认证或密评结论。

## 官方依据（核验日期：2026-10-01）

- [NIST CAVP 项目与算法验证](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program)
- [NIST 算法前置测试要求](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program/prerequisites)
- [NIST SHA-3 验证测试范围与向量说明](https://csrc.nist.gov/Projects/Cryptographic-Algorithm-Validation-Program/Secure-Hashing)
- [NIST CAVP/ACVP 算法前置测试（含 ML-KEM、ML-DSA、SLH-DSA）](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program/prerequisites)
- [NIST FIPS 140-3 PQC 实施指南与更新](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-ig-announcements)
- [NIST ACVTS Demo/Prod 入口权限](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program/how-to-access-acvts)
- [NIST 与加拿大网络安全中心共同管理的 CMVP / FIPS 140-3](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-standards)
- [NIST 熵源验证](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations)
- [NIST SP 800-90A Rev. 1（随机性源术语与 DRBG）](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final)
- [NIST SP 800-90B（熵源）](https://csrc.nist.gov/pubs/sp/800/90/b/final)
- [NIST SP 800-90C（RBG 构造）](https://csrc.nist.gov/pubs/sp/800/90/c/final)
- [本地保存的 NIST/GM/T 随机性与模块认证标准原文、来源和校验值](../../docs/standards/randomness-certification-sources/README.md)
- [日本 IPA JCMVP 受理状态](https://www.ipa.go.jp/security/jcmvp/index.html)
- [日本 IPA JCMVP 相关 ISO/IEC 标准与移行说明](https://www.ipa.go.jp/security/jcmvp/kikaku.html)
- [韩国 KISA KCMVP 制度概览](https://seed.kisa.or.kr/kisa/kcmvp/EgovSummary.do)
- [韩国 KISA KCMVP 试验与验证流程](https://seed.kisa.or.kr/kisa/kcmvp/EgovProcedure.do)
- [马来西亚 MyCV 介绍](https://mykripto.cybersecurity.my/index.php/services/mycv)
- [马来西亚 MyCV 方案概览](https://www.cybersecurity.my/portal-main/services/mycv-overview)
- [马来西亚 MyCV 申请说明](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/how-to-apply)
- [马来西亚 MyCV 验证中项目清单](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/list-of-algorithm-and-module-under-validation)
- [马来西亚 MyCV 版本移行通知](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/licensed-cvf)
- [马来西亚 MySEAL AKSA 批准算法](https://mykripto.cybersecurity.my/index.php/services/myseal/myseal-category/aksa-myseal/aksa-myseal-approved)
- [马来西亚 PKTN 概览](https://www.cybersecurity.my/portal-main/services/pktn-overview)
- [BSI Group 密码模块方案概要](https://www.bsigroup.com/siteassets/pdf/en/products-and-services/bsi-certification-scheme-for-cryptographic-module-security-fv1.pdf)
- [BSI Group 密码模块方案页面](https://page.bsigroup.com/bsi-certification-scheme)
- [Common Criteria Portal](https://www.commoncriteriaportal.org/index.cfm)
- [Common Criteria 密码模块 Protection Profile 目录](https://www.commoncriteriaportal.org/pps/index.cfm)
- [欧盟网络安全认证框架/EUCC](https://digital-strategy.ec.europa.eu/en/policies/cybersecurity-certification-framework)
- [EUCC 法规 (EU) 2024/482](https://eur-lex.europa.eu/eli/reg_impl/2024/482/oj)
- [商用密码产品认证目录（第三批）](https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/rzjgs/art/2025/art_2d6ced073d784f4fa74b4fe5e5d60b4b.html)
- [商用密码产品认证目录（第二批，市场监管总局）](https://www.samr.gov.cn/rzjgs/tzgg/art/2022/art_61aa87e3e13149ab83a4f3c79b9c8a29.html)
- [商用密码产品认证目录（第二批）](https://www.nca.gov.cn/sca/xwdt/2022-07/14/content_1060931.shtml)
- [商用密码产品认证目录（第一批，含“其他密码模块”定义）](https://www.nca.gov.cn/sca/xwdt/2020-05/11/1060749/files/2dafffd5b75d4e25aab610f357bb5ec9.pdf)
- [GM/T 0028-2024 密码模块安全要求（现行，替代 2014 版）](https://std.samr.gov.cn/hb/search/stdHBDetailedCNF?id=397D60066A540FA6E06397BE0A0AD887)
- [GM/T 0039-2024 密码模块安全检测要求（现行）](https://std.samr.gov.cn/hb/search/stdHBDetailedCNF?id=397D60066A550FA6E06397BE0A0AD887)
- [GM/T 0134-2024 密码模块安全设计指南（现行）](https://std.samr.gov.cn/hb/search/stdHBDetailedCNF?id=397D60066A5C0FA6E06397BE0A0AD887)
- [GM/T 0105-2021 软件随机数发生器设计指南（官方元数据，现行）](https://std.samr.gov.cn/hb/search/stdHBDetailed?id=E66CC4F6F8DB8B7FE05397BE0A0A6C55)
- [商用密码产品认证规则](https://www.samr.gov.cn/cms_files/filemanager/samr/www/samrnew/samrgkml/nsjg/rzjgs/202005/W020200511565602110136.pdf)
- [商用密码管理条例（检测/认证资质与强制范围）](https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2023/art_10e1c1e13f6d49bda70487902a92112d.html)
- [商用密码检测认证业务实施意见（认证机构/检测机构分工）](https://www.cnca.gov.cn/zwxx/tz/2020/art/2022/art_229ce73c7f0c49e8860aa8b7574f7ee9.html)
- [商用密码应用安全性评估管理办法](https://oscca.gov.cn/sca/xxgk/2023-10/07/content_1061109.shtml)
- [商用密码检测机构名录及业务范围](https://www.nca.gov.cn/app-zxfw/xzspsx/symmjcjiancha.jsp?channel_code=c100248)
- [关于调整商用密码检测认证业务实施的公告](https://www.nca.gov.cn/sca/xwdt/2025-04/30/content_1061250.shtml)
- [国家密码管理局商用密码认证能力与产品实施细则说明（2023）](https://www.nca.gov.cn/sca/xxgk/2023-05/29/content_1061038.shtml)
- [NVLAP/CST 实验室新申请暂停公告（2026）](https://www.nist.gov/nvlap/nvlap-lab-bulletin-lb-163-2026)
