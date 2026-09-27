# 密码学积木、实现正确性与教学工具调研

**调研日期**：2026-09-07
> 历史快照：请优先阅读 [2026-09-12 全网调研与标准审查报告](./CRYPTO-RESEARCH-2026-09-12.md)。本文保留 2026-09-07 的原始基线和研究记录，不代表最新标准状态。

**范围**：CipherCat / metacrypt_server 的文档、积木块、JavaScript/Python 生成器、模板与 demo；同时覆盖标准、后量子密码、实现保证和密码学教学研究。
**文献包**：[paper/references/README.md](../../paper/references/README.md)

## 1. 项目现状基线

本次核对以代码注册表和可执行验证为准，而不是沿用历史文档数字：

| 对象 | 2026-09-07 快照数量 / 状态 | 核对方法 |
|---|---:|---|
| 自定义 Blockly 块 | 140 个唯一块 | 递归展开 `ALL_BLOCK_TYPES` 后去重 |
| 函数模板 | 29 个 | `TEMPLATE_PREFILL`、模板验证器与 procedure 定义交叉核对 |
| Demo | 57 个注册测试项 | `demos/tests.json` 与实际 JSON 文件双向核对 |
| JS / Python 生成器 | 原子块双语言覆盖 | 静态映射检查；3 个动态 crypto wrapper 由模板展开，不作为原子生成器缺失 |
| 文档 | 中英双语、37 个标准目录 | 相对链接扫描、同步脚本检查 |

这些数字描述的是教学/参考实现的覆盖面，不等同于 FIPS 认证、生产密码库认证或侧信道安全保证。

## 2. 标准与算法结论

### 2.1 后量子密码

- NIST FIPS 203 标准化 ML-KEM，包含 ML-KEM-512、ML-KEM-768 和 ML-KEM-1024 三个参数集；其安全性基于 Module-LWE 相关困难问题。[NIST FIPS 203](https://csrc.nist.gov/pubs/fips/203/final)
- NIST FIPS 204 标准化 ML-DSA，用于数字签名与验签。[NIST FIPS 204](https://csrc.nist.gov/pubs/fips/204/final)
- NIST FIPS 205 标准化 SLH-DSA，并明确其源自 SPHINCS+。[NIST FIPS 205](https://csrc.nist.gov/pubs/fips/205/final)
- 项目已有 ML-KEM、ML-DSA、SLH-DSA 和 McEliece 相关文档/积木，但教学实现仍应把参数集、随机性、编码边界和失败路径分别展示；不能只用一次成功 demo 推导完整安全性。
- FIPS 203 页面目前带有后续修订提示，FIPS 204 页面也有 errata 提示，因此标准目录需要保留版本/发布日期，并在后续同步时复查 NIST 修订记录。

### 2.2 轻量密码与现有标准

NIST SP 800-232（2025-08 最终版）覆盖 Ascon-AEAD128、Ascon-Hash256、Ascon-XOF128 和 Ascon-CXOF128。项目已保存本地 PDF，并保留了历史草案目录；文档中应明确草案与最终版的区别，避免把 withdrawn draft 当作现行标准。[NIST SP 800-232](https://csrc.nist.gov/pubs/sp/800/232/final)

### 2.3 原始方案论文的价值

Kyber、Dilithium 和 SPHINCS+ 论文适合解释“标准名称”与“原始方案/参数”的关系，但标准实现应以 NIST FIPS 文本为主。尤其是标准发布后可能存在参数、命名、编码或 errata 差异，demo 的期望值必须跟随标准版本和官方向量。

## 3. 实现正确性与安全保证

### 3.1 当前项目已经做到的

- Demo harness 对 57 个注册 demo 执行生成代码并比对期望值。
- 模板 harness 对 29 个模板检查预填链结构，并对可执行模板运行 JS/Python 结果检查。
- 双语言生成器共享块类型和连接约束，减少“可连接但无法生成”的接口漂移。
- 代码和文档已经把动态函数模板与原子块区分开，避免把动态展开误报为缺失生成器。

### 3.2 当前项目不能声称的

- 通过官方向量不等于形式化证明；它主要证明选定输入上的功能结果。
- JavaScript/Python 教学实现不应默认声称 constant-time、抗缓存侧信道、内存擦除或 FIPS 140-3 验证。
- FIPS 140-3 Implementation Guidance 涉及密码模块验证、已知答案测试（KAT）及条件测试等要求；项目现有 harness 可作为工程质量基础，但不是 CMVP 验证流程的替代品。[FIPS 140-3 Implementation Guidance](https://csrc.nist.gov/projects/cryptographic-module-validation-program)

### 3.3 高保证实现研究给出的方向

- HACL* 展示了对内存安全、功能正确性和秘密无关性的机器辅助验证路径；这类保证依赖规范、证明工具链和可信计算基，不能由普通单元测试自动获得。[HACL*](https://www.microsoft.com/en-us/research/publication/hacl-a-verified-modern-cryptographic-library/)
- 机器检查密码标准研究说明，标准文字、可执行规范和证明之间可以建立可追踪链路；这适合未来给每个算法补充规范版本、伪代码段和向量来源。[Machine-Checked Proofs](https://eprint.iacr.org/2019/1155)
- 常量时间验证研究表明，常量时间需要专门的污点分析/安全验证等工具链；“代码没有明显分支”不足以形成保证。[Constant-Time Verification](https://arxiv.org/abs/2402.13506)

## 4. Blockly 教学研究与产品启示

CryptoScratch 将 AES、RSA、SHA-256 等密码算法做成视觉积木，并引入任务块和反馈机制；论文报告了 16 名中学生的初步可用性研究。它支持本项目继续采用“原子块 + 可观察中间态 + 任务/向量反馈”的教学路线，但样本小、场景特定，不能直接外推为学习效果结论。[CryptoScratch](https://arxiv.org/abs/2302.11606)

对 CipherCat 的直接启示：

1. 原子块负责展示算法状态和标准步骤；一键模板负责快速进入可运行结果，两者必须明确标注层级。
2. Demo 除了输出最终值，还应说明输入、参数集、标准章节和失败条件。
3. 任务验证应区分“结构完成”“代码可执行”“官方向量通过”三种结果。
4. 生成代码页面应持续显示“教学/参考实现”提示，避免用户把可视化代码当作生产密码库。

## 5. 建议的后续分批工作

| 批次 | 内容 | 验收标准 |
|---|---|---|
| A | 为每个标准目录补充版本、来源 URL、官方向量出处和已知 errata | `COVERAGE.md` 与目录 README 一致 |
| B | 将 demo 验证拆成 KAT、性质测试、负例/拒绝路径三类 | 每个核心算法至少有成功与失败路径 |
| C | 引入参考库差分测试（仅作测试 oracle，不复制实现） | 固定种子和随机样本均能报告差异 |
| D | 对秘密相关算法增加 constant-time/side-channel 风险说明 | 文档明确“未验证”与工具链边界 |
| E | 选择少量稳定原语建立形式化验证试点 | 规范、实现、证明和生成物可互相追溯 |

## 6. 本次结论

项目目前适合作为“密码算法结构、标准步骤和代码生成”的教学/研究平台；文档、函数模板和 demo 的一致性问题已在本次核对中修正。下一阶段最有价值的提升不是继续堆积算法数量，而是把向量来源、失败路径、差分测试和安全保证边界写进每个可运行示例。
