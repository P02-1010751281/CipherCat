---
doc_type: approval-report
unit: .codestable/epics/formal-cryptographic-certification.md
status: pending
reason: route-choice
approvals: {}
approval_groups: {}
created_at: 2026-10-01
---
# Approval Report

## Decision History

- 2026-09-30：Owner 要求把所有适用路线纳入可行性调研；这不是同时申报或指定首个市场。
- 2026-09-30：Owner 选择新建固定密码模块作为首个产品候选，并明确模块必须能够接入随机源；未批准产品实现或对外申报。

## Current Decision

本轮只请求确认首要市场与认证优先级。目标运行环境、申请/生产主体和随机性源的具体接入形态仍会逐项确认，但不与本问题捆绑。固定模块必须能够接入可审查的随机性源；这项硬要求不因市场选择而改变。

### `first-market-and-route`

确定固定模块首先要满足的市场/采购要求，并据此确定优先认证路线。无论首要路线如何选择，所有已识别且适用的路线都继续纳入可行性比较；首要选择仅确定核验优先级，不表示同时申报。互斥选项：

- **中国优先**：先按中国商用密码产品认证的“其他密码模块”候选继续范围确认；美国/加拿大 CMVP 路线保留为后续独立验证，不推定中国证书覆盖 FIPS 140-3 要求。
- **美国/加拿大 CMVP（FIPS 140-3）优先**：先按 NIST 与加拿大网络安全中心共同管理的 CMVP 规划；NIST 将其描述为美国和加拿大政府的联合方案（[NIST FIPS 140-3 / CMVP](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-standards)）。这只说明计划的联合治理范围，不代表所有采购部门或其他国家自动接受证书；中国商用密码产品认证仍是独立路线。
- **其他明确市场/采购要求优先**：注明具体国家/地区及适用的法规、采购或合同要求，再从对应路径中选首要路线。IPA 当前页面说明，自 2024-04-01 起暂停 JCMVP 密码模块认证申请受理，目前仅继续受理算法确认；其标准移行信息页还说明新版 ISO/IEC 19790:2025、24759:2025 的模块申请须待受理恢复（[IPA 受理状态](https://www.ipa.go.jp/security/jcmvp/index.html)、[IPA 标准与移行信息](https://www.ipa.go.jp/security/jcmvp/kikaku.html)）；韩国 KCMVP 面向其国家/公共网络范围（[KISA 制度概览](https://seed.kisa.or.kr/kisa/kcmvp/EgovSummary.do)）；马来西亚 MyCV 的 CMV 以 CAV 为前置，官方列表存在预计 2026 年第四季度完成的在途验证，但新申请受理与境外申请资格未确认；其 CNII 产品流程另有 PKTN（[MyCV 申请说明](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/how-to-apply)、[验证中项目](https://iscb.cybersecurity.my/index.php/certification/product-certification/mycv/list-of-algorithm-and-module-under-validation)、[PKTN](https://www.cybersecurity.my/portal-main/services/pktn-overview)）；Common Criteria / EUCC 是否相关取决于产品安全目标及采购要求（[CC Portal](https://www.commoncriteriaportal.org/index.cfm)、[EUCC 框架](https://digital-strategy.ec.europa.eu/en/policies/cybersecurity-certification-framework)）。BSI Group 另有公开 ISO/IEC 19790 模块方案，但属发布方方案，不是国家计划，采购接受度须单独确认（[BSI 方案](https://page.bsigroup.com/bsi-certification-scheme)）。这些均不自动成为首选。
- **市场尚未确定**：继续对中国商用密码认证、NIST 算法验证（CAVP/ACVP）、美国/加拿大 CMVP 模块验证及短名单中的条件路线做有界可行性比较；短名单不代表穷尽全球制度，也不冻结送测对象、算法范围或产品实现。待真实采购/部署要求明确后再选优先路线。

## Later Decisions (not requested in this step)

以下事项会在首要市场明确后按依赖顺序逐项询问，不需要在本轮回答。

### `initial-operational-environment`

指定首个拟送测的 CPU 架构/型号、操作系统及版本、编译器/运行时和交付形态；若目前尚未选定，请明确标为“未定”。仅写“支持信创”或“支持龙芯”不足以匹配标准、熵源/RBG 证书和模块运行环境。

### `applicant-and-producer`

指出拟作为申请主体/认证委托人的法律实体，以及研发、生产/发布与持续质量/安全保障由哪个实体承担；如未确定，请明确标为“未定”。国内产品认证的申请资料与持续一致性检查、NIST vendor 与认可实验室的职责都依赖这些组织角色。

### 随机源接入形态与认证边界（DEC-4，后续确认）

固定模块必须能够接入可审查的随机性源；该能力不因首要市场或路线选择而改变。当前待决的只是接入形态与认证边界：消费外部、具有目标计划所需证据的 RNG/RBG 输出，或接收原始熵并在模块内构造 RBG。当前工程建议偏向前者，但不能替代市场、平台、机构意见或 Owner 决定。

## Why Now

没有首要市场，就无法知道应以哪项正式结果作为第一个验收目标；没有冻结平台，就无法判断某个随机源/RBG 证据是否覆盖目标运行环境；没有申请与生产主体，就无法确认国内认证的持续保障责任或美国/加拿大 CMVP 中 vendor 与实验室的责任。继续直接实现会过早冻结可能不适用的边界。

## Context

当前 CipherCat 是 Blockly 教学/研究前端，尚无独立固定版本/API 的生产密码模块。候选固定模块必须具备接入可审查随机性源的能力；这是硬要求。OS API 仅说明供数方式，不自动证明其认证状态。现有可行性依据与路线差异见[双语产品认证可行性方案](../../../docs/standards/PRODUCT-CERTIFICATION-FEASIBILITY.md)和[永久 Epic](../../epics/formal-cryptographic-certification.md)。

NIST 官方资料分别列出熵源与 SP 800-90C RBG 验证，并要求按证书核对被验证版本/运行环境：[Entropy Validations](https://csrc.nist.gov/projects/cryptographic-module-validation-program/entropy-validations) · [CMVP Validated Modules](https://csrc.nist.gov/projects/cryptographic-module-validation-program/validated-modules)。中国目录、GM/T 条款和检测/认证职责区分已收录在可行性方案及其官方原文资料包中；是否受理拟建产品仍未获机构确认。

## Options

| 选项 | 收益 | 代价/边界 |
|---|---|---|
| 中国优先 | 先对齐中国商用密码产品类别、商用算法范围和目标客户采购条件 | 需要确认申请主体、生产一致性、目标安全等级、商用算法及具体平台；不替代 FIPS 验证 |
| 美国/加拿大 CMVP 优先 | 先对齐 FIPS 140-3 模块边界、RBG/熵源证据与认可实验室路径 | 需要确定目标采购用途、提交 vendor、操作环境及实验室；不替代中国商用密码产品认证，也不代表其它国家或采购方自动接受 |
| 其他明确市场/采购要求优先 | 按指定国家/地区及采购、法规或合同要求评估实际适用路线 | 需先给出具体市场与要求；日本、韩国、马来西亚、CC/EUCC 路径有各自边界；BSI Group 属发布方方案且采购接受度待确认 |
| 市场尚未确定 | 继续比较中国商用密码认证、NIST 算法验证、美国/加拿大 CMVP 及已识别的条件路线，不预设市场 | 短名单不穷尽全球制度；不能冻结首个送测目标，适合采购/部署要求仍未知的阶段 |

## Recommendation

不要仅凭现有仓库算法或开发者所在地推定目标市场。请按真实部署/采购要求选择中国优先、美国/加拿大 CMVP 优先、其他明确市场/采购要求优先，或“市场尚未确定”；若尚无实际要求，推荐先选“市场尚未确定”，继续核验所有已识别且适用的路线，不冻结产品专属实现。目标运行环境、申请/生产主体和随机源接入形态在后续节点分别确认，本轮无需提供这些信息。

## Risks And Tradeoffs

- 中国商用密码产品认证、NIST CAVP/ACVP、CMVP/FIPS 140-3、熵源/RBG 验证解决不同问题；一个路径的本地测试或正式记录不能自动替代另一路径。
- 过早指定操作系统、CPU 或随机源可能导致源证据与证书运行环境不匹配；模块接入随机性源是硬要求，但不能将接口简化为来源不明的任意字节输入。
- 首要路线只确定推进优先级，不缩减对其他适用路线的可行性比较。“市场尚未确定”时继续核验已识别路线，但无法冻结首个送测计划；无论选择哪项，产品实现仍须等待完整 Epic 获 Owner 批准，不能把市场选项理解为放宽该门槛。

## Non-Automatic Actions

本报告仅请求路线与产品前置条件确认。回答不会自动授权代码实现、修改 Epic 的批准状态/哈希、提交或推送、联系实验室/供应商、开设账户、签约、付款、上传材料或正式申报；这些动作仍须按各自权限另行确认。

## After You Answer

将答案和日期记入 Decision History 与首要市场的 named approval 状态，同时保留所有已识别且适用路线的比较。随后按 Epic 中的待决策依赖逐项确认目标运行环境、申请/生产主体和随机性源接入形态；全部路线级问题解决后，形成完整 proposed Epic，完成独立 design review，再交 Owner 确认。Owner 批准前保持 Epic `proposed`、work `planning`、`approved_revision: pending`，不开始产品实现。
