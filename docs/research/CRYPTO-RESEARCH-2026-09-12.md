# CipherCat 全网调研与标准审查报告

**调研日期**：2026-09-12；文档完整性复核补充：2026-09-13
**范围**：CipherCat 前端、生成器、模板、demo、标准文档和测试门禁；与 `metacrypt_server` 的后端测评边界；NIST、RFC、中国国家/行业标准、实现保证研究和密码学教学研究。
**本地文献包**：[paper/references/README.md](../../paper/references/README.md)

## 1. 结论摘要

CipherCat 当前定位应明确为“密码算法结构与代码生成的教学/研究前端”，而不是密码模块认证产品。前端可以让用户试运行自己生成的 JavaScript/Python 代码；平台后端随机性测评、检测和判定由 `metacrypt_server` 后端完成。浏览器输出不能作为后端测评、CAVP/ACVTS、CMVP/FIPS 140-3 或形式化验证的替代品；平台测评本身也不构成认证或熵源质量证明。

本报告的项目基线记录于 2026-09-12：140 个去重后的自定义块、29 个函数模板、57 个注册 demo、37 个算法标准目录。该数字是当时的审查快照，不作为当前计数；截至 2026-09-25，`ALL_BLOCK_TYPES` 静态展开为 194 个唯一自定义块，自动化验收覆盖 59 个注册 Demo（见 [当前 Demo 指南](../guides/DEMO.md)）。本地验证证明工程回归与选定向量上的功能一致性，不是完整安全性证明。

本次调研补充并下载了 SP 800-227、SP 800-90B、SP 800-90C 和 NIST IR 8454。FIPS 140-3 IG 已存在本地最新副本（页面标注 2026-08-19），因此没有重复保存；所有 PDF 均在清单中记录 SHA-256。

2026-09-13 文档复核发现，若干标准 Markdown 是 PDF 文本层的直接转录，虽然原 PDF 可读，但转录中的标题、表格和公式不可靠。已将主要算法入口页改为结构化摘要，并将原件/原始文本层与面向用户的参考页分开；剩余缺项和证据等级见 [标准文档完整性与缺项清单](../standards/DOCUMENT-STATUS.md)。

## 2. 证据与方法

优先使用标准发布机构、RFC 编辑部和中国标准/密码管理机构的页面；论文只用于解释背景和实现方法，不覆盖标准正文。本报告的原始调研基线为 2026-09-12；标准现行状态以 2026-09-25 的补充核验为准，详见[随机性测评与标准状态补充](./CRYPTO-RESEARCH-2026-09-25.md)。后续仍需在发布新 errata 时重新核验。

关键官方来源：

- [NIST FIPS 203](https://csrc.nist.gov/pubs/fips/203/final)、[FIPS 204](https://csrc.nist.gov/pubs/fips/204/final)、[FIPS 205](https://csrc.nist.gov/pubs/fips/205/final)：ML-KEM、ML-DSA、SLH-DSA。
- [NIST SP 800-232](https://csrc.nist.gov/pubs/sp/800/232/final)：Ascon 标准最终版。
- [NIST SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final)：KEM 定义、属性、安全实现和使用建议。
- [NIST SP 800-90B](https://csrc.nist.gov/pubs/sp/800/90/b/final)、[SP 800-90C](https://csrc.nist.gov/pubs/sp/800/90/c/final)：熵源和 RBG 构造；[SP 800-90 更新页](https://csrc.nist.gov/projects/random-bit-generation/sp-800-90-updates)用于核对后续状态。
- [NIST CAVP 前置条件](https://csrc.nist.gov/Projects/cryptographic-algorithm-validation-program/prerequisites)和 [CMVP](https://csrc.nist.gov/Projects/cryptographic-module-validation-program)：区分算法验证与密码模块验证。
- [FIPS 140-3 IG 更新公告](https://csrc.nist.gov/Projects/cryptographic-module-validation-program/fips-140-3-ig-announcements)：核对当前实施指南版本。
- [RFC 7748](https://datatracker.ietf.org/doc/rfc7748/)：X25519/X448 的协议和实现注意事项。
- [全国标准信息公共服务平台 GB/T 33133.1-2016](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=8C41A3AEECCA52B5C0011C8010CF0715)：ZUC 标准状态。
- [国家密码管理局 GM/T 0005-2021 公告](https://www.sca.gov.cn/sca/xwdt/2021-10/19/content_1060880.shtml)：随机性检测行业标准版本关系。

## 3. 标准状态与项目映射

| 领域 | 现行依据/状态 | CipherCat 映射 | 需要保持的边界 |
|---|---|---|---|
| AES/SHA-2/SHA-3 | FIPS 197 于 2023 年更新为编辑性修订；FIPS 180-4、FIPS 202 仍是项目引用基础 | 原子块、模板和 demo | 说明标准版本；不得把编辑性更新写成算法改变 |
| ML-KEM | FIPS 203 最终版，包含 512/768/1024 参数集；官方页面带后续修订/errata 提示 | `fips203-ML-KEM/`、PQC 原语和 Encaps 模板 | 参数集、编码、随机性、失败处理必须与标准向量绑定；不能因 demo 通过宣称合规 |
| ML-DSA | FIPS 204 最终版；官方页面带 errata/后续修订提示 | `fips204-ML-DSA/`、签名/验签块 | 区分签名算法功能测试和模块级自测试/验证 |
| SLH-DSA | FIPS 205 最终版，源于 SPHINCS+ 标准化路线 | `fips205-SLH-DSA/`、哈希树/FORS 结构块 | 不把原始 SPHINCS+ 论文参数直接当作 FIPS 参数定义 |
| Ascon | SP 800-232 最终版覆盖 Ascon-AEAD128、Ascon-Hash256、Ascon-XOF128、Ascon-CXOF128 | `sp800-232-ascon/` 与 ASCON demo | 明确最终版与历史草案；需要补充官方向量和失败路径 |
| KEM 实施 | SP 800-227 给出 KEM 的术语、属性、实现和使用建议 | 研究文档；服务端可作为后续 KEM 评估依据 | KEM 建议不等于项目已完成认证；评估必须记录 API、密钥生命周期和失败语义 |
| 熵源/RBG | SP 800-90B 关注熵源、最小熵、健康测试；SP 800-90C 组合熵源与 DRBG 构造 | `gmt0005-randomness/` 对应后端测评，前端只展示/试运行 | 采样生成、熵评估、健康测试、RBG 构造和报告判定必须在后端完成 |
| ZUC | GB/T 33133.1-2016 为现行国家标准登记；ZUC 是序列密码/流密码 | `gbt33133-ZUC/`、ZUC 原子块、EEA3 demo、`proc_zuc_keystream` | 不能把 ZUC 误归入 PQC；应补充 EEA3/EIA3 完整向量与模式边界 |
| 随机性检测 | GM/T 0005-2021 替代旧版 GM/T 0005-2012；与 SP 800-90B 的熵源评估不是同一套标准 | 后端 Go 测评项目 | 报告必须标明标准版本、测试参数、样本量、失败项和判定规则 |
| X25519 | RFC 7748 描述 X25519/X448，设计上便于常量时间和异常无分支实现 | `rfc7748-x25519/` | 教学 JS/Python 实现不能因此声称自身 constant-time 或抗侧信道 |

## 4. 可信度分层

项目文档和 UI 应把下面四层分开显示：

1. **结构层**：Blockly 连接约束、模板链和代码生成成功。
2. **功能层**：官方/论文向量、性质断言、负例和拒绝路径通过。
3. **算法验证层**：使用 CAVP/ACVTS 或等价的独立验证流程；CAVP 的算法前置条件页面明确说明底层算法/依赖需要分别满足要求。
4. **模块/高保证层**：CMVP/FIPS 140-3、形式化验证、constant-time 和侧信道评估；需要独立的密码模块、工具链、证明和实验记录。

当前 CipherCat 已有第 1 层和部分第 2 层的工程验证；没有宣称第 3/4 层。`metacrypt_server` 的后端随机性测评属于独立的测评执行面，也不应仅凭前端生成代码获得认证结论。

FIPS 140-3 Implementation Guidance 会涉及已知答案测试、条件测试、模块边界和验证解释。现有 `verify:all` 是开发回归门禁，不是 CMVP 提交材料。HACL*、机器检查密码标准和 constant-time 验证研究也都表明，高保证需要规范、实现、证明/分析工具和可信计算基的完整链路，不能由普通 lint 或 demo 通过自动推出。

## 5. 对 CipherCat 的审查结论

### 已确认并修正

- ESLint 现在排除验证构建产物，并把验证脚本中的跨平台子进程、`unknown` 错误处理、类型约束和生产代码冗余成功日志整理完毕；`npm run lint:check` 为 0 errors、0 warnings。
- 生产构建通过 Terser 移除 `console.log`、`console.debug` 和 `debugger`，保留 `console.warn/error`。
- Tauri 产品名/窗口标题已统一为 CipherCat，避免桌面包出现旧项目名。
- ZUC 模板已归入 ZUC 类目，不再误归类为 PQC；程序类目异常不再静默吞掉。
- 增加 `verify:all`、`verify:demos`、`verify:templates` 和 `docs:check-links`，把已有的人工检查变成可重复门禁。
- 文献 PDF 已通过 `pdfinfo` 检查可读取，并记录 SHA-256；重复的 FIPS 140-3 IG 文件已去重。

### 仍需跟踪

- Vite 构建仍有多个大于 500 kB 的动态 chunk，主要集中在 Blockly、DocsView、Mermaid/Cytoscape；首屏入口已降至约 31.6 kB，并由 `npm run build:check-bundle` 以 64 KiB 阈值保护。这不是功能失败，但仍会影响进入编辑器/文档图表功能时的加载成本。
- 当前已有 Vitest 单元测试，覆盖文档元数据、工作区迁移、错误处理和类型兼容；后续如果稳定公开 `utils/`、`composables/` 或生成器 API，应继续补充针对边界值、异常和类型转换的用例。
- 标准目录仍应逐步补齐“精确版本/发布日期、官方来源、向量来源、已知 errata、实现状态和安全边界”五项元数据。
- 核心算法 demo 需要补充负例：错误 tag、错误长度、非法编码、失败解封装、无效点和随机性健康测试失败；只测成功路径不足以覆盖 API 语义。
- 不应在 UI、README、demo 或论文中使用“安全”“认证”“恒定时间”等无条件表述；应写成“教学/参考实现”“已在选定向量上通过”。

## 6. 推荐验收门禁

在 Linux/macOS 上：

```bash
npm ci
npm run test:unit
npm run lint:check
npm run type-check
npm run standards:check
npm run cycles:check
npm run build
npm run verify:all
npm run docs:check-links
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml --all-targets
```

在 Windows 上，demo Python 子进程默认使用 `python`；如果环境中 Python 命令不同，可设置 `CIPHER_CAT_PYTHON`。JavaScript 验证使用当前 Node 可执行文件，不依赖 Unix-only 的 `node` 路径假设。后端 `metacrypt_server` 的 Go 测评必须在其自身仓库和隔离容器中执行，并把标准版本、样本参数、原始结果和判定报告作为独立证据保存。

## 7. 下载文献与后续研究

本次新增本地文献：

- `NIST.SP.800-227.pdf`：KEM 实现与使用建议，64 页。
- `NIST.SP.800-90B.pdf`：熵源、最小熵和健康测试，84 页。
- `NIST.SP.800-90C.pdf`：RBG 构造，160 页。
- `NIST.IR.8454.pdf`：Ascon 轻量密码标准化最终轮报告，135 页。

已有文献还包括 FIPS 203/204/205、SP 800-232、FIPS 140-3 IG、Kyber/Dilithium/SPHINCS+ 原始论文、HACL*、机器检查标准、constant-time 验证和 CryptoScratch。文件、来源与哈希统一见 [`paper/references/README.md`](../../paper/references/README.md)。

下一轮优先顺序：

1. 给 ML-KEM、ML-DSA、SLH-DSA、Ascon、ZUC、SM2/SM4 和随机性测评补齐标准元数据与官方向量索引。
2. 在后端建立固定种子、样本量、超时、资源限制、失败分类和可复核报告格式。
3. 用独立参考库做差分测试，参考库只作为 oracle，不复制进教学实现。
4. 对少量稳定原语建立 constant-time/形式化验证试点，并把“证明覆盖范围”与“未覆盖范围”写进文档。
5. 继续观察进入编辑器、文档渲染和图表功能时的动态 chunk；首屏体积回归阈值已由 CI 固化。
