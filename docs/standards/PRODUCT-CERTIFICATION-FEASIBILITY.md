# 正式认证可行性与产品边界

> 调研基准日：2026-09-30。本文确定候选认证对象和准备路径，不构成认证申请、第三方结论或已获证声明。

## 结论

不应把当前 CipherCat 整体、每个 Blockly 块、Procedure 模板和 Demo 当成一个认证对象。它们是教学编程平台中的不同资产；正式验证针对的是明确的密码算法实现或边界固定的密码模块及其指定运行环境。

建议保留 CipherCat 作为教学、研究和实现预验证平台。若确有生产部署或采购认证要求，再选定一个独立、版本固定、接口明确的密码软件模块作为候选对象；用户工作区、任意块组合、生成代码编辑器、Procedure 模板和 Demo 不纳入该模块的安全边界。现在不先拆仓库或搭认证脚手架，先由目标市场和采购要求决定模块边界。

Owner 已选择“新建固定密码模块”作为首个产品候选，并明确要求模块能够接入随机性源。这是产品方向和必需能力的选择，不代表现有代码已构成产品，也尚未确定随机源接口层级、源是否纳入模块认证边界、目标市场或申请主体。

## 当前产品对象

当前清单登记 **210 个唯一块类型、29 个 Procedure 模板身份和 59 个 Demo 工作区**。逐项身份、关系和现有证据见[标准符合性对象清单](./CONFORMANCE-INVENTORY.md)。这些数量表示审查范围，不表示每项已由独立实验室验证。

产品边界判断也与仓库现状一致：[架构说明](../guides/ARCHITECTURE.md)和 [`package.json`](../../package.json) 将项目定位为 Vue/Blockly 应用；npm 包标为 `private`，没有对外模块导出入口。[代码生成入口](../../src/composables/generator.ts)从工作区生成 JavaScript/Python 用户代码，而不是发布一个接口、版本和运行环境固定的密码模块。Tauri 配置打包的是同一套前端 `dist`；Rust 侧目前是应用壳，依赖为 Tauri 插件与序列化库，没有密码模块实现或服务 API。故生成器中的密码算法代码属于教学平台资产，不等于已有独立交付的密码产品。生成代码可能依赖浏览器 Web Crypto、Python 标准库或项目内实现。因此，块 ID 或教学算法名称相同，不足以证明它们构成同一个可认证实现。

配套 Metacrypto 仓库也未发现可直接作为该候选的固定密码模块：其 `randomness/` Go module 是随机性统计检测库；`lcplt/` 的公开说明将 CUDA 组件限定为对已有序列执行线性复杂度检测，不生成样本；后端中的 DES 代码属于爆破工具，SM4 实现位于动态 MCL/CUDA 编译与性能基准路径。它们不能仅因内部包含算法代码就被当作独立、固定接口的密码服务产品。故“新建固定模块”在当前两仓状态下确实意味着另行定义和交付产品边界，而不是把现有测评平台改名送测。核对依据：`metacrypt_server/AGENTS.md`、`randomness/go.mod`、`lcplt/README.md`、`backend/owl_admin/utils/des_bruteforce.py`、`backend/owl_admin/mcl_cuda_compiler/`（2026-09-30 只读盘点）。

### 龙芯/LoongArch 平台准备状态

- 当前工作区和 CI 均未声明 LoongArch 构建/测试目标；本次本机证据为 x86_64，未在龙芯硬件或系统上运行。
- Rust 官方支持 `loongarch64-unknown-linux-gnu`，级别为 Tier 2（with host tools）；目标要求 Linux kernel 5.19+、glibc 2.36+，并要求 LSX。它说明 Rust 工具链有目标支持，不等于本项目 Tauri 桌面端已构建或可认证。[Rust LoongArch target](https://doc.rust-lang.org/stable/rustc/platform-support/loongarch-linux.html)
- 本项目构建环境要求 Node.js `>=24`。Node.js v26.10.0 的上游平台表将 GNU/Linux `loong64` 列为 Experimental；上游说明 Experimental 平台可能无法编译或通过测试，且不提供该类官方发行二进制。[Node.js v26.10.0 platform support](https://github.com/nodejs/node/blob/v26.10.0/BUILDING.md#supported-platforms)
- 当前锁文件中的 Rolldown 1.2.8 与 Tauri CLI 2.11.2 均未声明 LoongArch Linux 可选原生包；预期的 Rolldown/Tauri CLI LoongArch 包在 2026-09-30 对 npm 官方 registry 查询返回 404。这说明当前锁定依赖没有验证该平台的原生绑定路径，但不排除源码构建或其它分发方式。`npm ci` 可能完成，但这不足以确认 LoongArch 原生绑定可用；原生 Vite 构建和 Tauri 打包路径仍未验证。若改为从源码构建工具、采用 WASI/其它构建路径或在 x86_64 预构建前端再交叉编译，仍须单独做可复现性和产物验证；本仓库尚无这些路径的实测。
- 浏览器部署与原生 Tauri 桌面包是不同交付方式：静态 `dist` 可在其他架构构建后部署，但必须在目标 LoongArch 浏览器/系统上实测密码 API、文件访问和完整交互；这只是基于前端架构的可行性推断，不是当前支持声明。若 LoongArch 是认证/采购目标，冻结范围时须指定具体 CPU、指令集、发行版、内核、libc 和浏览器/运行时，并由目标计划/实验室确认覆盖方式。

| 对象 | 合适的工程证据 | 能否单独作为密码算法/模块认证对象 |
|---|---|---|
| Blockly 编辑器、工作区、类型系统和代码生成器 | UI、类型约束、生成结果、错误路径和双语言回归 | 否；这是可组合的教学工具，不是一个固定密码实现 |
| 完整且固定接口的算法实现 | 标准条款映射、参数范围、官方测试向量、负例与独立差分测试 | 可作为算法验证候选；是否能纳入特定认证取决于方案、参数和实验室范围 |
| 内部原语块 | 数学/字节级契约、边界与性质测试，并追溯到父算法 | 通常不是独立认证对象；不可由子原语通过推断父算法通过 |
| Procedure 模板和 Demo | 模板结构、注入与生成测试；工作区端到端回归 | 否；它们是构造/示例/集成证据，不是独立密码产品 |
| 随机性测评后端 | 样本隔离、统计检测、结果复现和服务安全测试 | 不因执行测评而成为随机数发生器或经认证的密码模块 |
| 独立、固定版本的密码软件模块 | 固定源代码/构建、接口、服务、密钥与随机数处理（必须接入随机性源）、运行环境及安全策略 | 是当前选定的产品候选方向；是否适用目录/方案须由主管认证体系或认可实验室确认 |

### 固定模块的随机性源接口

模块必须以固定、可测试的接口接入随机性源；第一版先定义一个明确契约，不预设通用插件框架。当前还需确定接口边界：

- **消费外部 RBG 输出**：模块通过固定接口向明确声明的外部随机比特生成器取数。只有当该来源及其证书、构造、运行环境和连接方式满足目标验证方案时，才能作为合格依赖；普通 `getrandom`、`/dev/urandom`、`os.urandom` 等 API 可作为工程供数接口，但 API 名称本身不证明底层来源符合认证要求。接口不自动把源纳入模块边界，也不自动排除其依赖证据。
- **接收原始熵/噪声**：模块还要定义采集、熵估计、调理、健康测试及后续 RBG 构造；实现和证据责任明显扩大，可能触及独立熵源/RBG 验证要求。

**首版技术建议（待 owner 确认，不是认证结论）**：优先让固定密码模块消费一个外部、可核验且满足目标方案要求的 RNG/RBG 输出；首版不同时承担原始噪声采集和内部 RBG 构造。这样能缩小模块内实现责任，但不能省略对来源证书/构造、准确运行环境、连接方式和模块边界的证明。只有目标路线或实验室明确要求由模块内部接收原始熵/构造 RBG，或产品本身要作为软件随机数发生器交付时，才扩大到该路径。NIST CMVP 的公开资料分别列熵源验证与 SP 800-90C RBG 验证，并要求对模块证书列出的版本及运行环境逐项核对；因此具体外部依赖仍须按目标平台和计划确认。[NIST 熵源与 RBG 验证说明](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations) · [CMVP 已验证模块及证书范围](https://csrc.nist.gov/projects/cryptographic-module-validation-program/validated-modules)。

国内模块路线对“接入”有更具体的约束：GM/T 0028-2024 §7.9.2 允许模块包含随机数生成器、随机数生成器链，或模块自身就是随机数生成器；核准安全功能及敏感安全参数生成/建立需要随机值时，必须由核准随机数生成器提供。如果熵从密码边界外采集，用该熵生成的数据流按关键安全参数保护；每个关键安全参数所采集的最小熵不少于 256 bit，且不少于该参数的比特长度。GM/T 0039-2024 §6.2 进一步要求送检方列出 RNG 及用途、说明核准操作所用随机数的来源，并由检测人员核对；GM/T 0134-2024 §14.4 指向 RNG 状态保护和 GM/T 0103 的状态定义。[三项官方标准全文和校验值](./randomness-certification-sources/README.md)。因此，固定模块的随机源要求不是“有个能返回字节的 API”就满足，而是必须接入可申报、可说明、可核验的 RNG/RNG 链路。

NIST SP 800-90A Rev.1 的 randomness source 可指熵源、NRBG 或 DRBG，并非“物理噪声源”的同义词；但在 NIST 路径中，初始化/重播种所用来源及其批准构造仍须满足适用的 SP 800-90A/90C 与 CMVP 要求。另据 §8.6.6，DRBG 熵输入和生成的 seed 须按其保护的数据所需安全强度保护；在密码模块验证中，熵输入属于 CSP，须由包含该 DRBG 功能的模块内部取得，或从另一密码模块经安全信道传入。此项针对需要熵输入的 DRBG 功能，不应泛化为所有外部随机字节、签名随机数或 nonce 接口的通用连接要求。本地 GM/T 0103 结构化条目也分别处理熵源、熵评估、后处理和检测。[NIST SP 800-90A Rev.1](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final) · [GM/T 0103 熵与健康测试条目](./gmt0103-rng/02-Entropy-and-Health.md)。国内 GM/T 0105-2021 的软件 RNG 模型明确把操作系统熵源及系统/硬件 RNG 输出列为可考虑的输入来源；若产品包含该标准所述软件 RNG，还涉及熵估计、上电与连续健康测试、熵源独占访问等要求。它说明 OS/RNG 接入在设计模型中被考虑，但不是对任意 OS API 或任意固定密码模块的认证认可；具体来源、可核验的熵与健康证据、边界及条款适用性仍须确认。[GM/T 0105-2021 官方全文与来源说明](./randomness-certification-sources/README.md)。无论采用哪种接口，来源不可用或规定的健康检查失败时均须按冻结的安全策略报错/拒绝服务，不得无提示切换到未声明来源。工程验收还要用测试替身和故障注入证明随机相关服务经声明接口取数、故障行为符合策略；固定测试值或替代源不得形成生产调用方可启用的旁路。这只是接口/故障路径的工程证据，不证明真实来源的熵质量或认证状态。接口层级与源是否属于被测边界仍待确认。

对 NIST 路线，当前 FIPS 140-3 实施指南 §9.3.A 还按 DRBG 的熵获取方式区分验证证据：通过已定义来源的 `GetEntropy()` 主动取熵、从 TOEPP 外被动灌入熵/seed、以及熵源在 TOEPP 内但模块没有直接 `GetEntropy()` 接口，适用结果不同。某些被动外部输入情形可能允许验证但需在证书中加入最低 SSP 强度保证 caveat；若熵源在 TOEPP 内却没有直接调用接口，则该情形不能验证。此条款针对 DRBG 熵输入，不是所有外部随机数输出 API 的统一规则；独立 RBG 模块的输出还须按其自身证书、运行环境和密码模块边界另行处理。因此，接口冻结时必须把真实调用路径映射到当期 §9.3.A，并由送测实验室确认；生产接口不得把调用者任意提供的原始 seed 当作与经验证 RBG 输出等价的来源。[FIPS 140-3 实施指南及修订记录](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-ig-announcements) · [本地官方 PDF 与来源记录](./randomness-certification-sources/README.md)。

**现有实现差距：** Blockly 教学生成器没有统一的随机源适配接口，也不构成拟建产品 API。

**NIST 回调边界：** 若通过回调接入熵源，回调路径仍须在模块与 `GetEntropy()` 之间保持直接连接，且密码边界外的实体或代码不得操纵熵数据；回调不是对直接接口要求的豁免。

- **当前生成器的随机性责任**（仅描述源码现状，不表示这些算法都已选入产品）：

| 路径 | 当前生成行为 | 若纳入固定模块 |
|---|---|---|
| RSA | 密钥生成使用随机素数候选和 Miller–Rabin 随机基底；PKCS#1 v1.5 加密填充生成随机非零字节。JavaScript 使用 Web Crypto，Python 使用 `os.urandom`/`secrets`。[JS](../../src/generators/javascript/rsa/blocks.ts) · [Python](../../src/generators/python/rsa/blocks.ts) | 当前实现明确为教学代码，不是已验证实现。只有目标范围实际包含 RSA 时，才为对应生产端点定义随机数用途、算法规范和已认可来源。 |
| SM2 / SM9 随机签名 | 随机签名分别生成 `k` / `r`；JS 使用 Web Crypto，Python 使用 `secrets`。现有接口也允许调用者提供 nonce/scalar。[SM2 JS](../../src/generators/javascript/sm2sig/blocks.ts) · [SM2 Python](../../src/generators/python/sm2sig/blocks.ts) · [SM9 JS](../../src/generators/javascript/sm9/blocks.ts) · [SM9 Python](../../src/generators/python/sm9/blocks.ts) | 纳入的随机签名服务必须走声明的 RNG 接口。调用者提供的 `k` / `r` 只能按冻结的测试/产品契约处理，不得成为未审查的生产旁路。 |
| ML-DSA 签名 | 生成器接受 `rnd`，缺省为 `0^32`；当前路径不会自行取随机数。[JS](../../src/generators/javascript/mldsa/blocks.ts) · [Python](../../src/generators/python/mldsa/blocks.ts) | 若纳入 NIST 产品范围，按所选规范接口冻结确定性或随机化模式；选用随机化模式时，`rnd` 必须来自已声明的随机源，不能把零值默认当作随机输入。 |
| ML-KEM 教学 Procedure / 模板 | `proc_mlkem_keygen` 接收调用者提供的 `seed`；Encaps Procedure 使用显式 `ek` / `m`，当前演示为固定向量输入，不会调用随机源。[模板定义](../../src/blocks/procedure/blocks.ts) · [Encaps Demo](../../demos/procedures/ML-KEM-Encaps.json) | 若纳入 FIPS 203 产品范围，外部 KeyGen 每次须从获批 RBG 取得新鲜的 32-byte `d` 和 `z`，Encaps 取得新鲜的 32-byte `m`；RBG 强度下限依 ML-KEM 参数集分别至少为 128/192/256 bit。供数失败须按算法返回失败，不得回退；当前模板和固定向量不是产品随机源接入。[FIPS 203 §3.3](https://csrc.nist.gov/pubs/fips/203/final) |
| SLH-DSA 教学结构件 | `hash_chain`、Merkle/FORS 与 `slh_addr` 等是教学组件，不构成完整 FIPS 205 KeyGen/Sign API；需要的种子由工作区显式提供，不会调用随机源。[块定义](../../src/blocks/hash/hashbased.ts) · [Demo](../../demos/procedures/Hash-Based-Structures.json) | 若纳入 FIPS 205 产品范围，KeyGen 须为 `PK.seed`、`SK.seed`、`SK.prf` 取得新鲜随机值，RBG 强度至少为 `8n` bit；hedged 签名须提供 `n` 字节 `addrnd`（标准称宜由获批 RBG 生成），也可按标准选择 deterministic 变体。KeyGen 或 hedged 签名取数失败须返回错误，不得运行时悄然降级为 deterministic；须冻结实际模式和来源。当前结构件不代表完整算法或随机源实现。[FIPS 205 §§3.1, 9.2](https://csrc.nist.gov/pubs/fips/205/final) |
| HMAC-DRBG / GM/T DRBG | 积木由调用者提供 entropy、nonce、personalization，再确定性地产生输出；自身不连接系统/硬件熵源。[HMAC-DRBG JS](../../src/generators/javascript/drbg/blocks.ts) · [HMAC-DRBG Python](../../src/generators/python/drbg/blocks.ts) · [GM/T DRBG JS](../../src/generators/javascript/gmdrbg/blocks.ts) · [GM/T DRBG Python](../../src/generators/python/gmdrbg/blocks.ts) | 若产品包含 DRBG，必须明确其实例化/重播种材料的来源、状态保护和生命周期；不能把调用者任意传入的字节视作已验证熵。 |
| AES 模式 / CCM / Ascon | 当前接口消费调用者提供的 nonce/IV，不负责生成随机源输入。[AES](../../src/generators/javascript/symmetric/aes/blocks.ts) · [CCM](../../src/generators/javascript/ccm/blocks.ts) · [Ascon](../../src/generators/javascript/ascon/blocks.ts) | 若产品接口负责生成 nonce/IV，须单独定义相应生成与唯一性策略并使用适用的来源；若由调用者提供，须明确调用者责任。不能把所有 nonce 一概当作需要随机生成。 |

源码检索到 RSA、SM2、SM9 存在直接运行时取数路径；ML-KEM 教学 Procedure 使用显式输入，SLH-DSA 目前只是未完成的教学结构件。上表同时区分了标准要求、项目现状、显式供种、确定性签名和调用者供 nonce/IV 的情形；是否将任一算法纳入产品仍待决定。若相关路径进入固定模块范围，须逐端点规定 RNG 依赖、随机值用途、错误/故障行为及随机化策略；上述现状盘点不能替代所选产品实现的完整审计。测试接口的显式 nonce 不得自动成为生产接口的绕过路径。

## 可行的正式路径

### NIST 路径：算法实现与密码模块分层

- **CAVP/ACVP**：CAVP 对获批或 NIST 推荐算法及其实现进行验证；算法验证是密码模块验证的前置环节。ACVTS Demo 用于准备和熟悉测试，不能签发正式算法验证；Prod 用于 CAVP 正式算法验证，仅向已认可的 Cryptographic Security Testing（CST）实验室和 17ACVT 实验室开放。[CAVP 计划说明](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program) · [ACVTS 环境与访问条件](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program/how-to-access-acvts)
- **CMVP / FIPS 140-3**：验证对象是定义清楚的密码模块，不是标准文档库或教学平台的全部代码。范围涉及模块规格、接口、服务/角色、软件安全、运行环境、敏感安全参数管理、自测试、生命周期保证及攻击缓解等。[FIPS 140-3](https://csrc.nist.gov/pubs/fips/140-3/final) · [CMVP 标准与治理文档](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-standards)
- 截至本文件日期，NIST 页面列明当前接受 FIPS 140-3 验证。FIPS 140-2 新验证证书的提交早在 2021-09-22 停止；对于美国和加拿大联邦机构，FIPS 140-2 模块可用于新系统至 2026-09-21，自 2026-09-22 起转入 Historical 列表，之后仅可继续用于既有系统。新目标应按 FIPS 140-3 和提交时有效的 CMVP 指引评估。[CMVP 当前状态](https://csrc.nist.gov/projects/cryptographic-module-validation-program)
- **实验室入口现状**：NIST 发布的 NVLAP/CMVP 公告 LB-163-2026（2026-03-09）暂停接受新的 NVLAP CST 实验室认可申请；公告适用于 2025-01-01 当日及之后收到的申请，暂停决定自公告发布日起生效。这只说明新实验室认可申请暂停；CMVP 页面仍列明接受 FIPS 140-3 模块验证，并未公告停止现有认可实验室提交。CAVP/ACVTS Prod 与 CMVP 路线都应核对现有实验室的具体资格范围、接单状态和排期；不能把“计划仍开放”误解为“当前一定有实验室档期”。[NVLAP 公告 LB-163-2026](https://www.nist.gov/nvlap/nvlap-lab-bulletin-lb-163-2026) · [CMVP 当前状态](https://csrc.nist.gov/projects/cryptographic-module-validation-program) · [CST 实验室计划](https://www.nist.gov/nvlap/cryptographic-and-security-testing-lap)

因此，若选择 NIST 路径，需先冻结具体算法实现、支持参数、构建产物和运行环境；不能把 ACVTS Demo、项目自建 KAT、Blockly 块测试或互操作测试写成 CAVP/CMVP 认证。只有适用方案确实支持的算法，才列入正式验证范围。

### NIST 熵源与随机比特生成器：不是统计测评平台认证

NIST 提供公开的[熵源验证查询](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/search)。2026-09-30 无过滤查询显示 356 条记录、15 页（默认每页 25 条）。定向核对发现：E8 限供应商复用，登记运行环境为 RHEL 8 / Intel Xeon Silver 4216；E30、E127、E300 也限供应商复用。E24 JEnt-MemOnly 标注开放复用，但其公开使用文档只列特定 Ubuntu 18.04 / Intel Xeon 6252 配置，并说明纳入 FIPS 140-3 模块提交需联系实现方。因此，证书存在或标注开放复用都不等于可在任意平台复用，也不自动满足模块提交条件。固定模块必须保留接入随机源的能力；具体来源须在目标 CPU/OS、接口层级和认证边界冻结后，逐项核对证书范围、PUD 与集成条件。本次没有选定或联系任何供应商。该查询页不是通用 RBG/DRBG 来源目录；SP 800-90C RBG 走 ESV Server 的独立提交与构造证据流程。详情见[随机性认证资料索引](./randomness-certification-sources/README.md)。

NIST 还需要把三个层次分开：SP 800-90B 面向熵源；SP 800-90C 面向由熵源、确定性随机比特生成器（DRBG）等组件构成的 RBG；FIPS 140-3/CMVP 面向包含密码服务的密码模块。当前 CMVP 管理手册将熵源和 RBG 的相关提交流程都称为 ESV，但明确说明这不是一个独立命名的“Entropy Source Validation Program”；因此“ESV”一词不能简化成单一的 90B 熵源证书。2026 年手册说明，新的 FIPS 140-3 模块提交若需要熵源或 RBG 验证，必须引用已有的相应验证证书；不再把熵源验证作为模块提交中的 ENT 项目处理。[CMVP ESV 流程](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/esv) · [FIPS 140-3 管理手册 §4.8](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS-140-3-CMVP%20Management%20Manual.pdf)

- **熵源（SP 800-90B）**：对象是具体噪声源及其采样、熵估计、健康测试、重启行为和指定运行环境。提交材料包括熵评估报告、公开使用文档、数据采集证明（视采集方式而定）和原始数据等；实验室使用生产 ESVTS 提交，Demo ESVTS 不能产生正式验证。验证不是“样本通过几项统计检验”。当前 FIPS 140-3 实施指南 D.K「Resolution 23」（2026-08-19 版，印刷页 207–208）进一步解释：物理噪声源要界定正常工作的运行条件范围，并支持范围内熵率相近；指南建议比较温度、电压、系统活动等有影响条件下采集数据的统计测试结果，或论证数据覆盖最不利情况。多运行条件评估截至 2026-12-31 为强烈建议，此后为要求；指南允许实验室逐案接受替代论证。此项针对物理噪声源的 NIST 熵源评估，不是对任何外部 RBG/随机字节接口的通用要求；目标源和运行环境确定后，须由适用指南及实验室确定采样计划。[NIST 熵源验证与文档要求](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations) · [熵源验证提交资料](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/documents) · [FIPS 140-3 实施指南修订记录](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-ig-announcements)
- **RBG 构造（SP 800-90C）**：验证对象是随机比特生成器的完整构造及其对熵源的依赖，需提交 RBG 报告；可以与熵源一起提交，也可以引用已经验证的熵源或 RBG 证书。CMVP 已于 2026-05-07 开始接受论证符合 SP 800-90C 的 RBG 提交，2026-06-26 又发布了 RBG Report Template v1.2 更新；这只说明计划开放受理，不保证实验室档期或产品符合性。[NIST ESV 公告](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations/announcements-1)。RBG 证书和熵源证书的声明不同，不能互相代替。特别是 RBG1 对其内部 DRBG 有严格生命周期与来源约束：只实例化一次、不可重播种，且输出受 DRBG seedlife 限制；其外部随机性源须符合指定的 RBG2(P)、RBG3 或 RBGC 构造要求，并通过物理安全通道提供实例化材料。RBG1 不适合作为可随意反复调用的通用外部字节接口。产品若采用该构造，须按 [SP 800-90C 最终版 §4](https://csrc.nist.gov/pubs/sp/800/90/c/final)逐项设计，seedlife 耗尽或规定的健康测试失败时终止使用，并由目标 CST 实验室确认配置、来源证书、运行环境和边界；不能把操作系统随机 API 直接等同于符合要求的来源。
- **CipherCat 当前随机性测评能力**：后端在隔离执行环境中运行待测实现并收集序列，统计结果属于对该次样本/实现的测评证据。它没有因此成为噪声源、软件随机数发生器或 NIST 验证的 RBG；用户实现通过统计测试也不能推出其熵、不可预测性或 90B/90C 符合性。若未来开发实际随机数产品，必须另定产品边界和熵来源，再准备原始噪声数据、采集环境、熵模型、健康测试及完整构造证据。

本项目随文保留的[NIST 随机源与模块认证原始资料](./randomness-certification-sources/README.md)含 SP 800-90B、SP 800-90C、FIPS 140-3 实施指南及 CMVP 管理手册的官方 PDF 和校验摘要；适用结论应以目标申报时的现行版本及实验室书面确认复核。

## 各路线对当前项目的适配度

“all”在此处按“把所有相关路线都纳入可行性准备”执行，并不代表同时启动多条正式申请。Owner 已选择新建固定密码模块作为首个候选，但目前尚无证据表明项目已交付该产品；目标市场、申请主体和随机性源边界仍待确认。

| 路线 | 正式对象 | 与当前项目的关系 | 可行性判断与先决条件 |
|---|---|---|---|
| 中国商用密码产品认证：软件密码模块 | 具有固定边界并承担密码运算、密钥管理等安全功能的软件/模块；第一批目录第 22 类“其他密码模块”明确包含软件密码模块，依据 GM/T 0028 | Blockly 编辑器、任意工作区、用户代码生成器不是一个固定密码模块；个别 Demo 也不构成产品 | **有条件候选，当前不具备申报对象。** 需另行定义生产模块、固定接口/版本/算法/运行环境、密钥与随机数责任，并向现行认证机构确认类别、实施细则、检测范围和组织保障要求。官方认证规则包含型式试验、初始工厂检查和获证后监督，不能只准备算法单测。[第一批目录](https://www.oscca.gov.cn/sca/xwdt/2020-05/11/1060749/files/2dafffd5b75d4e25aab610f357bb5ec9.pdf) · [商用密码产品认证规则](https://www.oscca.gov.cn/sca/xwdt/2020-05/11/1060749/files/9b1da93fabbb4037b8d065fcd0a7be79.pdf) |
| 中国商用密码产品认证：软件随机数发生器 | 产生随机二元序列的程序；第二批目录列出 GM/T 0103、GM/T 0105、GM/T 0028 | 当前随机性评测后端执行并评估用户提供的实现/样本；测评服务不是随机数发生器 | **类别匹配清晰，但项目当前并非该产品。** 只有决定单独研发和发布生产 RNG 后才适用；须定义熵来源、种子/状态管理、输出接口、健康测试、目标运行环境和交付版本，并按申报时适用的规则确认检测项目。第三批目录中的 GM/T 0005、GM/T 0062 注记仅覆盖第三批目录列明的产品，不能擅自当作第二批软件 RNG 的完整认证依据。[第二批目录](https://oscca.gov.cn/sca/xwdt/2022-07/14/content_1060931.shtml) · [第三批目录及其随机数检测注记](https://www.oscca.gov.cn/sca/xwdt/2025-03/27/content_1061246.shtml) |
| NIST CAVP/ACVP | 每个适用算法及具体实现/参数集合 | 可作为将来固定密码模块算法实现的前置验证证据；不是 Blockly 平台/全部积木的整体认证 | **技术准备可进行，正式范围待产品化。** 先选适用 NIST 算法、实现、参数和实验室；SM/ZUC 等非 NIST 批准算法不能因为项目实现了就列为 CAVP 算法验证项。ACVTS Demo 仅用于准备，正式验证需要合资格实验室提交生产环境测试。 |
| NIST CMVP / FIPS 140-3 | 固定边界、服务、版本和运行环境的密码模块 | 当前平台边界开放、依赖浏览器/用户代码及多种运行时，不是合适的单一模块边界 | **当前不具备提交对象，工程和组织改造较大。** 需先形成独立生产模块及安全策略，再按 FIPS 140-3、ISO/IEC 19790/24759 对接口、角色/服务、敏感安全参数、自测试、软件安全、生命周期和运行环境建立证据；适用算法验证及熵源/RBG 证书也须按手册要求关联。 |
| NIST ESV：SP 800-90B 熵源 | 指定运行环境中的具体熵源（噪声源及采集/健康测试实现） | 用户代码生成的测试序列不是平台自有噪声源；统计测评结果不能证明熵源验证 | **当前没有可提交对象。** 除非项目开发或集成并以产品形式交付具体熵源，否则此路线不适用；届时要准备真实运行环境采集的原始数据、熵评估和审核材料，由有相应认可范围的实验室走 Prod ESVTS。 |
| NIST ESV：SP 800-90C RBG 构造 | 明确的 RBG 组装/构造及其熵源依赖 | 评测后端不是向自身密码服务供数的 RBG；它只是执行外部待测代码并统计输出 | **随未来 RNG/密码模块产品评估。** 若产品包含 RBG，需按现行指南准备 RBG 报告并证明整个构造；可以引用已有证书，但不可用随机性统计报告代替。[SP 800-90B](https://csrc.nist.gov/pubs/sp/800/90/b/final) · [CMVP ESV/RBG 提交流程](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS-140-3-CMVP%20Management%20Manual.pdf) |

中国认证业务在 2025 年发生调整：自 2025-05-01 起原国家密码管理局商用密码检测中心不再开展商用密码检测认证业务，尚未完成事项由商用密码检测认证中心（商用密码标准研究院）承接；公告还明确允许有效期内的旧证书申请换发为该中心颁发的证书。因此，该中心不能仅按普通检测实验室理解。国家密码管理局当前在线行政审批结果页同时列出检测资质：该中心的商用密码产品检测范围包括“随机数发生器”和“其他密码模块”，有效期列至 2028-12-02；另有具备相应产品范围的检测机构，部分范围明确限定为 GM/T 0028 安全等级二级及以下。该名单证明的是列明的检测资质与范围，不代表拟建模块已获受理，也不公开确认本产品的安全等级、算法组合、报价或排期。正式申报前仍须按届时规则向认证/检测机构核实具体受理与检测范围。[业务调整公告](https://oscca.gov.cn/sca/xwdt/2025-04/30/content_1061250.shtml) · [国家密码管理局行政审批结果查询](https://www.oscca.gov.cn/app-zxfw/xzspsx/symmjcjiancha.jsp?channel_code=c100248)

### 其他市场相关认证路线（以目标采购/部署地域为准）

“所有适用路线”必须结合销售地域和采购要求判定。以下是截至 2026-10-01 对日本、韩国、马来西亚、Common Criteria/EUCC 及公开的 BSI Group 密码模块方案的官方资料补充核查；由于目标市场尚未确定，本清单是当前高相关路线比较，不声称穷尽全球所有国家/地区制度，也不表示需要并行申报。

| 路线 | 适用对象和市场 | 当前状态与边界 |
|---|---|---|
| 日本 JCMVP / ISO/IEC 19790、24759 | 日本采用 JCMVP 的政府采购或相关市场中的固定密码模块 | **暂不可作为新模块申报路径。** IPA 明确自 2024-04-01 起暂停新密码模块认证申请，目前只继续受理密码算法确认申请。IPA 于 2026-04-03 更新的标准页已列出 ISO/IEC 19790:2025、24759:2025，但写明以新标准提出的模块申请须等恢复受理后另行通知；标准更新不代表申请已重开。[JCMVP 受理状态](https://www.ipa.go.jp/security/jcmvp/index.html) · [JCMVP 相关 ISO/IEC 标准与移行说明](https://www.ipa.go.jp/security/jcmvp/kikaku.html) |
| 韩国 KCMVP | 韩国国家/公共网络中使用的密码模块；部分产品类型和采购要求须采用验证模块 | **存在运行中的模块试验/验证制度，但适用范围依韩国规则。** KISA 官方说明其目标是验证用于国家/公共网络的密码模块，并列出申请、试验机构测试、国家情报院审查和验证委员会程序；当前公开概览仍列 KS X ISO/IEC 19790:2015、24759:2015。算法集合、熵评估材料、模块等级和申请资格须按当前 KCMVP 文件核实，不能假定 ISO/IEC 19790:2025 已自动纳入。[KCMVP 概览](https://seed.kisa.or.kr/kisa/kcmvp/EgovSummary.do) · [KCMVP 试验与验证流程](https://seed.kisa.or.kr/kisa/kcmvp/EgovProcedure.do) |
| 马来西亚 MyCV | 马来西亚密码模块验证（CMV）和密码算法验证（CAV） | **国家方案仍有验证活动。** 官方“验证中项目”清单列出预计在 2026 年第四季度完成的评估；这证明有在途项目，不等于公开确认正在接受新申请。MyCV 由 CyberSecurity Malaysia 的 ISCB 管理，基于 ISO/IEC 19790:2012 与 ISO/IEC 24759:2017；CAV 是 CMV 的前置条件，申请流程要求联系方案方；外国申请主体资格和当前新申请受理情况仍需确认。算法须符合 MySEAL 批准清单。当前公开 AKSA MySEAL 2.1 批准清单可见 SM2/SM3、ML-KEM、ML-DSA、SLH-DSA、SHA-3 和若干 DRBG；未在该清单检索到 SM4、ZUC，但这不等于已确认其不受理，须向方案方书面核实。方案公布向 ISO/IEC 19790:2025/24759:2025 移行安排：新评估最迟于 2028-02-29 切换，旧版 Security Policy/证据接受至 2027-12-31。模块需明确随机源接口、来源证据与运行环境，并由方案方确认对应证据及边界。[MyCV 介绍](https://mykripto.cybersecurity.my/index.php/services/mycv) · [How to Apply](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/how-to-apply) · [验证中项目清单](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/list-of-algorithm-and-module-under-validation) · [MyCV 概览与申请信息](https://www.cybersecurity.my/portal-main/services/mycv-overview) · [获许可 CVF 与版本移行通知](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/licensed-cvf) · [AKSA MySEAL 批准算法](https://mykripto.cybersecurity.my/index.php/services/myseal/myseal-category/aksa-myseal/aksa-myseal-approved) |
| Common Criteria / EUCC | 对指定 IT/ICT 产品或部件按 Security Target 和适用 Protection Profile 作安全属性评估；EUCC 是欧盟 Common Criteria 网络安全认证方案 | **按客户/法规采购要求作为补充路线评估。** Common Criteria 允许认证方案基于独立实验室评估特定产品安全属性，官方保护配置文件目录包含密码模块相关配置文件。欧盟委员会说明 EUCC 当前为自愿方案，适用于 ICT 产品安全认证。CC/EUCC 证书只覆盖其明确的产品边界和评估目标，不自动替代中国商用密码产品认证、NIST CAVP/CMVP 或韩国 KCMVP，也不等同于算法验证。[Common Criteria Portal](https://www.commoncriteriaportal.org/index.cfm) · [密码模块保护配置文件目录](https://www.commoncriteriaportal.org/pps/index.cfm) · [欧盟网络安全认证框架/EUCC](https://digital-strategy.ec.europa.eu/en/policies/cybersecurity-certification-framework) · [EUCC 法规](https://eur-lex.europa.eu/eli/reg_impl/2024/482/oj) |
| BSI Group Cryptographic Module Security Scheme | 按 ISO/IEC 19790 对密码模块作独立评估，采用 ISO/IEC 24759 测试方法 | **发布方认证方案，不是国家政府认证项目。** BSI 的 2024 方案概要称其为 ISO/IEC 17067 Type 1a 方案，证书最长三年；概要称软件模块最高为 Level 2。公开概要不足以确认当前受理、认可范围、特定采购方接受度或本项目适用性，须按目标合同向 BSI/采购方核实；不可与德国联邦信息安全局（同样简称 BSI）混为一谈。[BSI 方案概要 PDF](https://www.bsigroup.com/siteassets/pdf/en/products-and-services/bsi-certification-scheme-for-cryptographic-module-security-fv1.pdf) · [BSI 方案页面](https://page.bsigroup.com/bsi-certification-scheme) |

MyCV 之外，马来西亚关键国家信息基础设施（CNII）的产品选型/批准还可能涉及 PKTN；它是额外的产品选择流程，不等同于 MyCV 模块证书，是否适用取决于部署对象和采购要求。[PKTN 概览](https://www.cybersecurity.my/portal-main/services/pktn-overview) · [PKTN 流程](https://mykripto.cybersecurity.my/index.php/services/pktn/pktn-process)

因此，现阶段的路线短名单包括中国商用密码产品认证、NIST CAVP/CMVP 与熵源/RBG 验证、日本 JCMVP（暂停新模块申请）、韩国 KCMVP、马来西亚 MyCV、采购要求触发时的 Common Criteria/EUCC，以及另行核实采购接受度的 BSI Group 方案。其它国家/地区的本地方案须在目标市场或合同要求明确后补充；不得把“all”解释成同时申报或一个证书全球通用。

### 中国商用密码路径：先做产品分类，再选认证规则

商用密码产品认证按适用目录、产品规则及具备相应资质的机构实施，不是对“用了某个算法”的源码盖章。第一批目录第 22 类“其他密码模块”的软件模块范围及 GM/T 0028 依据应以[目录附件 PDF](https://www.nca.gov.cn/sca/xwdt/2020-05/11/1060749/files/2dafffd5b75d4e25aab610f357bb5ec9.pdf)为准，公告页提供[发布信息和规则入口](https://www.nca.gov.cn/sca/xwdt/2020-05/11/content_1060749.shtml)。第二批目录列出软件随机数发生器的 GM/T 0103、GM/T 0105、GM/T 0028 依据，以及硬件随机数发生器的 GM/T 0078、GM/T 0103、GM/T 0028 依据；第三批目录的注释规定，该批目录所列产品的随机数检测应遵循 GM/T 0005 和 GM/T 0062。两批目录的范围和要求不同，不能把第三批注释推广为所有随机数产品或所有密码模块的统一依据。[第二批目录](https://www.nca.gov.cn/sca/xwdt/2022-07/14/content_1060931.shtml) · [第三批目录](https://www.nca.gov.cn/sca/xwdt/2025-03/27/content_1061246.shtml)

全国标准信息公共服务平台的[GM/T 0105-2021 记录](https://std.samr.gov.cn/hb/search/stdHBDetailed?id=E66CC4F6F8DB8B7FE05397BE0A0A6C55)确认其名称为《软件随机数发生器设计指南》，状态为现行，实施日期为 2022-05-01；国家密码管理局[第 43 号公告](https://www.oscca.gov.cn/sca/xxgk/2021-10/19/content_1060880.shtml)列出同一标准。国家标准信息公共服务平台的行业标准门户进一步提供了“在线预览/下载标准”入口；本项目已从其公开下载入口取得全文 PDF，来源、摘要和 SHA-256 见[随机源官方资料索引](./randomness-certification-sources/README.md)。该指南适用于软件 RNG 的设计、开发、检测和评估；若拟建模块仅调用外部源、并不包含该指南定义的软件 RNG 部件，具体适用条款仍需按产品目录和机构意见确认。

第三批目录还在算法要求中单独引用 GM/T 0002、GM/T 0004。仓库当前收录的 SM4、SM3 标准原文分别是 GB/T 32907-2016、GB/T 32905-2016；标准信息公共服务平台把对应 GB/T/GM/T 条目列作“相近标准”，但它们仍是不同标准号和记录，不能据此宣称原文等同、互相替代或满足同一认证要求。SM4 Demo 的向量出处因此按仓库实际核对的 GB/T 32907-2016 标注。若选中国认证路径且适用规则要求 GM/T，应另行取得并核验该 GM/T 版本及实验室认可的检测范围。[GB/T 32907 记录](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=7803DE42D3BC5E80B0C3E5D8E873D56A) · [GM/T 0002 记录](https://std.samr.gov.cn/hb/search/stdHBDetailed?id=8B1827F22B99BB19E05397BE0A0AB44A) · [GB/T 32905 记录](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=45B1A67F20F3BF339211C391E9278F5E) · [GM/T 0004 记录](https://std.samr.gov.cn/hb/search/stdHBDetailed?id=8B1827F20133BB19E05397BE0A0AB44A)

认证适用范围必须按产品目录和规则判断；不能仅因软件包含密码算法就推定它必须或能够按某一产品类别认证。《商用密码管理条例》总体上鼓励自愿接受商用密码检测认证，但对条例及其他法律法规明确规定的情形另有要求；其中列入网络关键设备和网络安全专用产品目录的相关产品须依法检测认证后方可销售或提供。条例还区分检测机构与认证机构的资质职责。官方[检测机构名录](https://www.nca.gov.cn/app-zxfw/xzspsx/symmjcjiancha.jsp?channel_code=c100248)只用于核对检测机构及获准检测范围，不能单独证明某机构具有认证决定/发证资格；提交前还须核对适用认证机构资质及当时有效的目录和规则。[《商用密码管理条例》](https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2023/art_10e1c1e13f6d49bda70487902a92112d.html)

商用密码应用安全性评估（通常称“密评”）是对网络与信息系统中商用密码应用的合规性、正确性和有效性进行评估，评估对象是系统的实际密码应用，不等同于密码产品认证，也不等同于 NIST 的 CAVP/CMVP 验证；适用范围和义务按相关规定及系统类别判断。[《商用密码应用安全性评估管理办法》](https://www.nca.gov.cn/sca/xxgk/2023-10/07/content_1061109.shtml)

2025 年检测认证业务衔接安排见官方[业务公告](https://oscca.gov.cn/sca/xwdt/2025-04/30/content_1061250.shtml)。申报前须按当时有效的目录和规则分别核对检测机构的产品类别/等级检测范围与认证机构资质；业务承接公告或检测机构名录均不能替代对认证资格的核实。现有官方材料确认了目录和业务调整信息，但不代替申报时对全部规则修订、替代文件及机构资质有效期的复核。

对当前教学平台，不能仅因包含密码算法积木就认定适用“其他密码模块”。若未来独立发布可供生产使用、承担密码运算/密钥管理等安全职责的软件模块，再向有相应资质的机构做产品分类预评估。若目标是随机数发生器产品，则需把发生器本身的实现、种子/熵处理、输出接口和运行边界作为对象；平台后端对用户样本做统计检测并不能替代这些证据。

## 费用与周期：公开信息和报价边界

- **中国商用密码认证**：国家密码管理局 2025-07-28 发布的涉企收费目录，将商用密码检测认证中心的认证费、检测费和技术服务费列为市场调节价、由双方协商确定；认证费涵盖认证委托、工厂检查、评价与决定、获证后监督等事项。市场监管总局与国家密码管理局的实施意见另要求认证机构公开认证收费标准。因此，这份目录不是本产品报价，也不能据此推断检测费已包含在认证费内；应按目标产品类别分别核对认证机构公示费率和检测机构的项目报价。商用密码产品认证规则第 4.6 节要求认证机构明确各环节时限，但没有规定统一的总天数；具体流程和预计周期须根据适用实施细则、检测范围、整改和工厂检查安排确认。[涉企收费目录（2025-07-28）](https://oscca.gov.cn/sca/xxgk/2025-07/28/content_1061275.shtml) · [检测认证实施意见](https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/rzjgs/art/2023/art_4ac35e8afb8549febe8f3f6d2dbd7c38.html) · [产品认证规则 §4.6](https://www.oscca.gov.cn/sca/xwdt/2020-05/11/1060749/files/9b1da93fabbb4037b8d065fcd0a7be79.pdf)
- **NIST CMVP / FIPS 140-3**：NIST 费用表自 2026-01-01 生效，Full Submission 的 CMVP 审查基础费按安全等级为 Level 1 $16,000、Level 2 $17,000、Level 3 $17,500、Level 4 $19,000；表中另列可适用的 Extended Cost Recovery（分别 $3,000 / $4,000），NIST 说明费用可能依实际成本调整。它们是 NIST 报告审查费用，不是实验室测试合同总价；实验室测试、整改和工程投入须另行询价。若产品还需要单独的随机性证据，SP 800-90B 熵源 Full Submission 的 NIST 费用为 $5,500，SP 800-90C RBG Full Submission 为 $1,500，各自可能另有 $1,500 / $500 的扩展审查费。这些是条件性、独立提交项目，只有目标产品确实需要相应证书时才纳入预算；仅接入已有、适用的外部 RNG/RBG 不应自动把新熵源/RBG申报费用计入模块预算。[NIST 2026 费用表](https://csrc.nist.gov/projects/cryptographic-module-validation-program/nist-cost-recovery-fees)
- **周期口径**：当前 NIST 资料未给出适用于本项目的确定总周期；FIPS 140-3 管理手册规定，模块进入 `REVIEW` 后如两年内未完成验证，CMVP 可以将其移出队列；接近期限时，CSTL 可向 CMVP 申请重新考虑。这是审核阶段的队列规则，不是从实验室受理开始计算的端到端周期或完成承诺。实验室受理、测试准备、缺陷整改和 CMVP 审查会分别影响时间。首要路线、模块安全等级、算法范围、随机源类型和运行环境仍未定，现阶段不应给出总价或完成日期。路线确定且获授权后，再向有相应范围的实验室取得书面费用和排期；此处不构成委托或付款授权。[CMVP 当前费用与队列资料](https://csrc.nist.gov/projects/cryptographic-module-validation-program/nist-cost-recovery-fees) · [FIPS 140-3 管理手册 §4.3.7](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS-140-3-CMVP%20Management%20Manual.pdf)

## 申报主体与生产责任

| 路线 | 官方流程明确的责任 | 本项目需要落实 |
|---|---|---|
| 中国商用密码产品认证 | 现行公开《商用密码产品认证规则》要求型式试验样品与实际生产产品一致；初始工厂检查针对生产企业，检查生产能力、质量保障、安全保障和产品一致性控制。规则以“认证委托人”描述委托方，但不能仅凭通用 CCC 规定推定本类别的委托资格。 | 明确谁作为认证委托人、固定模块由哪个组织生产/发布，以及二者对源码、构建、版本和一致性材料的控制关系；按拟申报类别向认证/检测机构确认资格与最新材料清单。仅有项目代码或个人开发环境不足以证明生产一致性。来源：[商用密码产品认证规则](https://www.oscca.gov.cn/sca/xwdt/2020-05/11/1060749/files/9b1da93fabbb4037b8d065fcd0a7be79.pdf)。 |
| NIST CMVP / FIPS 140-3 | CMVP 的 IUT 流程说明：vendor 将模块交由具备认可资格的 CST 实验室测试，双方须有可执行合同；模块及要求文档须在实验室，实验室按 DTR 测试后向 CMVP 提交报告。该流程是 vendor、实验室与 CMVP 的协作，不是用户自行向 CMVP 上传源码。 | 明确产品 vendor 及其对模块、源码、构建、security policy 和提交资料的控制权；实验室资格/范围/档期须单独确认。未获单独授权不签约、不付款、不建立外部提交或账户。来源：[CMVP Modules in Process 与 IUT 流程](https://csrc.nist.gov/projects/cryptographic-module-validation-program/modules-in-process)。 |

因此，申请主体不是可留到代码完成后再补的行政字段，而是产品边界和持续一致性责任的一部分。当前尚未指定该主体，也没有证据表明已建立对应的生产/发布组织；此项仍由 owner 决定并按最终路线核验。

## 推荐实施顺序

| 阶段 | 工作 | 退出条件 |
|---|---|---|
| 0. 目标确认 | 候选已确定为新建固定密码软件模块；补充目标市场/采购条款、申请主体和必须支持的算法 | 有明确的“为什么要认证”和验收方 |
| 1. 冻结边界 | 选一个固定模块/API、版本、构建方式、服务、密钥/随机性源责任和运行环境；明确接口接收外部随机字节还是原始熵/噪声，以及源是否纳入模块边界；排除编辑器与用户代码 | 边界图、功能清单、版本与运行环境清单齐备，可作为后续范围预评估材料 |
| 2. 建立证据基线 | 复用对象清单与标准覆盖矩阵；逐端点列标准版本、参数、实现、官方向量、负例、差分测试和未覆盖项 | 每项声明都能回到具体代码、规范条款和可重复测试 |
| 3. 修复实现差距 | 按目标方案处理批准模式、密钥/敏感参数管理、随机数、错误/自测试、构建供应链、操作环境和安全性问题 | 目标实验室的预评估问题关闭，且构建/部署可复现 |
| 4. 机构范围预评估 | 按选定路线核对产品类别、算法支持、测试等级、交付物、费用和排期；NIST 路径确认具相应资格的实验室及 CAVP/CMVP 流程，国内路径分别确认检测机构范围、认证机构资质与适用规则 | 记录各机构职责、受理范围和未决缺口；正式申报或付费前取得 owner 授权 |
| 5. 正式验证与维护 | 按适用计划由具备相应资质的检测实验室/检测机构执行测试；NIST 路径由 CAVP/CMVP 验证主管方作出验证结论，中国路径由认证机构作出认证决定 | 只对相应验证/认证记录列明的对象和环境作声明；变更时做影响分析并按要求重测/再认证 |

## 当前缺口与决策门

现阶段没有从这次审查中证明 CipherCat 已有独立、冻结的生产密码模块，也没有提交实验室、ACVP 生产环境或获得证书的证据。现有测试门禁和 Demo 只能建立工程基线。对象清单还标出 70 个块没有出现在 Demo 工作区中；需逐项查明是否已有单元/模板测试或父算法测试，不能简单把“未用于 Demo”当成已覆盖或未覆盖结论。

用户选择将中国商用密码产品认证和 NIST 路线都纳入调研准备。因此后续并行建立四类候选档案（中国软件密码模块、中国软件随机数发生器、NIST 算法验证/CMVP、NIST 熵源/RBG），但每一档案都必须先回答“是否真的要发布该类生产产品”。这不是同时立项、同时申请或同时付费的授权。

**下一决策门**：首个候选已选为新建固定密码模块，并要求接入随机性源；产品/业务负责人仍需确定目标市场、采购/法规触发条件、申请主体，以及接口接收外部随机字节还是原始熵/噪声、源是否纳入被测边界。决定这些事项后，才冻结版本/接口/算法/运行环境并向当前有资质机构核实范围。若没有真实生产需求，则维持 CipherCat 教学与科研定位，不为“拿证”而拆分平台或虚构 RNG/熵源产品。

## 认证计划状态快照（核对日期：2026-09-30）

国家密码管理局通知公告索引的本次检索可见第 56 号公告（2026-06-30）；核对正文后，该公告涉及《电子认证服务使用密码管理办法》的实施，不是商用密码产品目录或密码模块认证规则。索引仍可查到第三批商用密码产品认证目录（2025-03-27）；对国家密码管理局、市场监管总局等官方域名的定向检索未发现第四批目录公告。此结论仅表示本次检索未发现，不能证明其他栏目或未被索引的正式文件不存在；产品预评估和申报前仍须复核最新目录与规则。[通知公告索引](https://www.nca.gov.cn/sca/xwdt/tzgg.shtml) · [第 56 号公告](https://www.nca.gov.cn/sca/xwdt/2026-06/30/content_1061344.shtml) · [第三批目录](https://www.oscca.gov.cn/sca/xwdt/2025-03/27/content_1061246.shtml)

NIST CMVP 当前项目页说明其接受 FIPS 140-3 提交；“Modules in Process”页面列有 2026-09-24 等近期状态记录，说明验证流程仍有在途项目，但不证明具体实验室有档期、目标模块会被受理或能够通过。[CMVP 项目状态](https://csrc.nist.gov/projects/cryptographic-module-validation-program) · [Modules in Process](https://csrc.nist.gov/projects/cryptographic-module-validation-program/modules-in-process/modules-in-process-list)

## 来源与口径

官方来源于 2026-09-30 核对。商用密码产品分类、强制适用情形及认证机构资格最终以申报时有效的法律法规、目录、规则和主管机构确认为准；密评、商用密码产品认证、NIST 算法验证与 FIPS 140-3 模块验证的对象和结论不同，互不替代。
