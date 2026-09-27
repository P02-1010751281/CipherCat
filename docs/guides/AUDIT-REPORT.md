# 密码原语与教学表面审计报告

> 核对日期：2026-09-24。本文区分本轮实际执行的检查与尚未完成的审查；算法是否“完整”不等于生产密码库安全认证。标准和论文调研见 [全网调研报告](../research/CRYPTO-RESEARCH-2026-09-12.md)。

## 当前快照

- **194 个自定义块类型**：递归展开 `src/blocks/index.ts` 的 `ALL_BLOCK_TYPES`，去重后为 194；没有重复类型。
- **29 个函数模板**：以 `src/blocks/procedure/blocks.ts` 的 `TEMPLATE_REGISTRY` 为准。
- **17 个工具箱类目**：包括自定义密码学类目、函数封装空间、Crypto Templates 和 Blockly 原生类目。
- **59 个 Demo 注册项**：`demos/tests.json` 与 59 个 Demo 工作区一一对应（不含注册表自身）。
- **函数模板**：29 个模板注册项中有 3 个基础 `crypto_*` 块已计入块类型总数；另有 26 个 `proc_*` 模板类型。Demo 回归覆盖登记的工作区，不等同于逐一执行全部块类型。

## 能力分组

| 能力家族 | 代表范围 |
|---|---|
| 控制流与数据处理 | 自定义循环、字节/位/编码/种子/长度处理及 Blockly 原生组合 |
| 位运算与 S-Box | 逻辑、移位、循环移位、字节替换及 AES/SM4/ZUC 预设 |
| 散列、XOF 与填充 | SHA-2、SHA-3、SHAKE、SM3、HMAC、KDF、DRBG |
| 对称密码与分组模式 | AES、SM4、CMAC、CCM、GCM、XTS、ASCON |
| 序列密码 | ZUC 状态变换、密钥流与 EEA3 构件 |
| 公钥与椭圆曲线 | RSA、ECDH、X25519、ECDSA、EdDSA、SM2、SM9 |
| 后量子密码 | ML-KEM/ML-DSA 格基构件、SLH-DSA 哈希基构件及纠错码教学原语 |
| 数学与数据编码 | NTT、GF(2^m)、多项式、矩阵、编码和密钥推导等共享构件 |

> 上表是能力分组，不与 17 个运行时工具箱类目一一对应，也不提供可相加的小计。总数以 `ALL_BLOCK_TYPES` 的去重展开为准；共享原语可服务于多个算法家族。

## 规范映射结论

- FIPS 180-4：SHA-224/256/384/512 已有块和 Demo；SHA-1、SHA-512/224、SHA-512/256 尚未实现。
- FIPS 202：Keccak、SHA-3、SHAKE 的原子链和封装 Demo 已覆盖。
- FIPS 203/204/205：ML-KEM、ML-DSA、SLH-DSA 的核心原语、结构块和相应性质 Demo 已覆盖；完整 FN-DSA/Falcon 仍未实现。
- RSA、ECDH、ECDSA、EdDSA、X25519、Argon2、DRBG、PBKDF2、HKDF、AES/SM4 模式和多个 AEAD/MAC 原语均有标准目录与实现记录。
- SM2 已覆盖点运算、签名/验签、加解密和 `sm2_key_exchange`；ZUC 已覆盖 EEA3 密钥流块和 Demo。
- 仍列入覆盖矩阵但不对应 Blockly 原子块的目录：GB/T 36624 AEAD、GM/T 0005 随机性检测（Go 后端）、中国抗量子密码公开进展追踪。这些是明确的边界，不应写成“标准缺口全部清零”。

## Demo 与生成器审计

`demos/tests.json` 的键集合与 Demo 文件集合已核对：59 个注册项、无遗漏、无陈旧键。每个 Demo 工作区都通过 Blockly headless 加载；带测试规格的 Demo 由 Python 和 JavaScript 生成器分别执行并比对期望值。可重复命令为 `npm run verify:all`，文档本地链接使用 `npm run docs:check-links` 检查。

函数模板的测试脚本覆盖模板注入、链结构、Python/JavaScript 生成和可执行性；多参数 ML-KEM Encaps 模板还检查 `ek/m` 签名、语句链和返回值引用。

## 已知边界

1. Demo 向量通过只说明当前输入下与标准/性质断言一致，不代表实现已经通过第三方认证或适合直接保护生产密钥。
2. SHA-1、MD5、SHA-512/224、SHA-512/256 和 Falcon/FN-DSA 不应在 README 或覆盖矩阵中被表述为已实现。
3. CMAC、Base64、PKCS#7 等已有块但没有独立 Procedure Demo 的项目，应保持“有块、无 Demo”的事实表述，不能用“全量 Demo 已覆盖”概括。
4. 前端生成代码的试运行不是平台后端随机性测评；样本、统计检验、隔离执行和判定由 `metacrypt_server` 后端链路负责，且不代表认证或熵源质量证明。

## 验收状态与边界（2026-09-24）

- 通过：`npm run test:unit`（49/49，8 个测试文件）；`npm run type-check`；`npm run cycles:check`（357 个文件，无循环依赖）；`npm run build`；`npm run verify:all`（标准元数据/拆分/公式/清单检查、29/29 模板、59/59 Demo、388 个 Markdown 文件的本地链接检查，0 个失效链接）。
- 过程生成器：Python/JavaScript 不再把首个参数伪装成缺失返回值或据此猜返回类型；连接的返回块按自身 Blockly 输出类型生成注解；无返回过程不输出 `return`；调用表达式与调用语句按各自形态生成。定向回归测试 4/4 通过。
- AES：原子 MixColumns 已按列优先状态布局处理连续四字节；普通轮嵌套执行 SubBytes → ShiftRows → MixColumns → AddRoundKey，末轮省略 MixColumns。显式 Demo 的 Python/JavaScript 回归值通过，但它们是项目固定输入值，不是 FIPS 附录 C.1 完整加密向量。AES-Atomic-Round 是按工作区顺序原地修改共享状态的单轮演示，不是完整 AES-128 接口。顺序依据 [NIST FIPS 197](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf)。
- 后端边界回归：`metacrypt_server` 后端单元测试为 534 passed、1 skipped（103 warnings）；随机性 Go 模块 `go test ./...` 通过。sandbox 单槽锁最多等待 5 秒；worker 请求通过原子认领避免重复执行；用户代码不能列举共享队列或创建工作目录子目录，清理失败会返回明确错误。这不限制尚未派发的 Celery 队列积压。pytest 退出后曾观察到 Python `multiprocessing.resource_tracker` 的 `KeyError` 输出，虽 pytest 退出码为 0，来源仍待定位。
- Podman 运行态：使用独立 rootless VFS 存储构建并启动单个 `randomness-sandbox` 容器；后端客户端请求/结果往返、runner UID 1002、队列目录 EACCES、嵌套 `mkdir` 拒绝、运行中单次请求认领及 `/tmp` 无任务残留均已实测。仅验证 sandbox 单服务，不代表完整 Compose、GPU、后端/Nginx 401 或生产部署验收。宿主默认存储仍有一个旧的 `mc-randomness-sandbox` 实例，缺少当前配置要求的 `CAP_KILL`/`CAP_SETUID`，本轮未重启或替换它。
- 全量 `npm run lint:check` 本轮退出码为 0，未输出错误或警告诊断；本仓库 `npm run type-check` 也通过。此前发现的 384 项 TypeScript 诊断来自 `metacrypt_server/frontend`，不应归到本仓库。不能把一个仓库的静态检查结果转记到另一个仓库。
- 审查轮次：2026-09-22 基线报告记录三轮主审与独立批驳，但结论是未通过，仍留有代码、后端测评架构和交付问题。本轮增量复核了 AES/过程生成器/sandbox 切片，以及密码分类导航、双语分类表和块类型统计；两位审查者独立确认 194 个唯一块类型及 220 个块/模板并集，另一位审查者复核本轮文档差异未发现问题。`npm run test:unit`、类型检查、lint、循环依赖检查、`npm run verify:all` 和生产构建通过。旧基线仍不能视为当前工作树通过三轮全仓审查；UI 手工逐步点验、截图与运行环境一致性、其他算法和架构区域也未因这些回归而自动验收。
- 这些检查证明工程回归和选定输入下的行为，不构成 CAVP/ACVTS、CMVP/FIPS 140-3、constant-time、侧信道安全或形式化验证证据。
