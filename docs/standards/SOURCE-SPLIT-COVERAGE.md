# 标准原文拆分覆盖审计

核对日期：2026-09-26

> 当前结论：原文提取层已保留 25 个本地 PDF 标准的文本证据（多文件标准按 source 分段保存），
> 38 个目录共 227 个结构化条目已有统一清单。GB/T 32915 目录目前仅有状态入口，原件及结构化拆分仍待补。7 个含独立 `Algorithm N` 标题的标准、共 123 个算法条目已通过逐算法检查；其余条目按函数/原语/边界页维护，并明确记录章节级定位或原件缺口。

## 这两层分别做什么

`00-Standard-Source.md` 是标准 PDF/RFC 的完整提取层和事实回溯入口：保留原文顺序、公式、伪代码、表格、脚注及提取异常，供人工回到 PDF 视觉版式核对。

其余条目页是从 source 拆出的结构化参照层，分别服务于：

- Blockly：识别可以成为块的函数、原语、算法阶段、输入输出和项目映射；
- 用户：按一个可独立核对的概念阅读公式、伪代码、参数、错误条件和验证边界；
- 审查：把标准定义、项目实现、demo 结果和“未实现”分开，避免用摘要或同名函数冒充标准覆盖。

条目页不是第二份 PDF。它必须能回链 source 和原件；source 也不是“已经拆完”的证明，必须有下面的覆盖记录。

## 拆分标准

1. 标准有独立算法编号的函数，必须一算法一页，并保留 Algorithm 标题、Input/Output 和可执行伪代码。
2. 可单独作为 Blockly 块或教学中间值的原语，独立成页；例如 Ascon 的 `pC`/`pS`/`pL` 和 GCM 的 `inc32`。
3. 只服务于同一函数的一行内部公式，不单独制造文件，放在所属算法页的“公式或伪代码”字段。
4. 没有独立块但标准定义了的步骤，可以归入紧密耦合的上层条目，但“项目映射”必须写明“由上层块内部实现”。
5. 缺少可靠原件或文本层失真时，保留证据边界并标为“仅参考/缺项”，不能根据实现反推标准。

## 第一阶段：有独立算法编号的目录

| 标准 | source 算法数 | 独立条目覆盖 | 机器检查 |
|---|---:|---:|---:|
| FIPS 197 AES | 5 | 5/5 | `standards:split-check` |
| FIPS 202 SHA-3 | 11 | 11/11 | `standards:split-check` |
| FIPS 203 ML-KEM | 21 | 21/21 | `standards:split-check` |
| FIPS 204 ML-DSA | 49 | 49/49 | `standards:split-check` |
| FIPS 205 SLH-DSA | 25 | 25/25 | `standards:split-check` |
| NIST SP 800-232 Ascon | 7 | 7/7 | `standards:split-check` |
| NIST SP 800-38D GCM | 5 | 5/5 | `standards:split-check` |

检查脚本只对 source 中真正的算法标题计数，并排除目录和叙述性文字；它不把“存在 source 文件”当作“完成拆分”。

## 额外命名原语

| 标准 | 原语/阶段 | 条目页 | 项目映射 |
|---|---|---|---|
| SP 800-232 | `pC`、`pS`、`pL` | [12-pC](./sp800-232-ascon/12-pC.md)、[13-pS](./sp800-232-ascon/13-pS.md)、[14-pL](./sp800-232-ascon/14-pL.md) | Ascon 置换内部调用 |
| SP 800-38D | `inc32` | [10-inc32](./sp800-38d-gcm/10-inc32.md) | GCM 计数器内部调用 |
| FIPS 197 | SubBytes、ShiftRows、MixColumns、AddRoundKey | [组成变换索引](./fips197-AES/README.md#组成变换索引) | AES 轮函数组成件 |
| FIPS 205 | ADRS member functions、WOTS+/FORS 树组件 | [结构概览](./fips205-SLH-DSA/README.md#块实现明细) | 结构块/上层内部实现，详见 Algorithm 1–25 |

## 每次验收

```text
source 原件存在且可回链
    → 算法/原语覆盖率无缺口
    → 条目含原文定位、完整原文摘录、完整公式/伪代码规范单元、输入输出、项目映射、核验结论
    → PDF 视觉版式抽查公式/表格/分页
    → npm run standards:check
    → npm run standards:split-check
    → npm run standards:formula-check
    → npm run docs:check-links
```

`standards:split-check` 只保证结构覆盖和编号存在，不替代密码学语义审查、CAVP/KAT、平台认证或安全评估。

补充验收：清单按规范条目统计 227 个条目（25 个标准原文目录共 221 个条目，另有 6 个外部/历史参考页）；4 个条目另有结构化英文对应稿。公式检查覆盖全部 231 个中英文页面，均有“公式或伪代码”字段，其中 207 页含 Markdown 代码块；20 个中文条目明确属于组合/边界/缺项页，逐页面统计为 22 页（含两个英文对应页）。实际标准原文锚点共 220 个（185 个行号、35 个精确 PDF 物理页）；25 个目录的 221 个条目中包含 1 个非规范性后端评估说明页，不计入原文锚点。另有 2 个 RFC 全文证据项、2 个仅回链研究书目的条目和 2 个缺原件来源项。研究书目回链不计为标准原文锚点。条目—source 逐项清单见 [SOURCE-SPLIT-INVENTORY.md](./SOURCE-SPLIT-INVENTORY.md)。这个字段覆盖不等于 PDF 中所有表格、图和失真公式都已经完成视觉核验。

## 当前完成边界与剩余工作

本次的 `123/123` 是“source 中存在独立 `Algorithm N` 标题”的可验证拆分覆盖率，不等于 38 个目录的所有段落都已经逐字拆为独立页面。

- 已有 source 且包含编号算法的 7 份标准：已逐算法拆分，覆盖 123 个条目。
- 当前 220 个标准原文锚点中，185 个按 source 行号分类，35 个按精确 PDF 物理页码分类；同时具备两类链接的条目按 PDF 页码分类，但清单仍保留两者。锚点分类由 `npm run standards:inventory` 校验，不等同于全部页面均已视觉复核。
- 其中有 6 个 GB/T 17964/GM/T 0091 条目已按原 PDF 渲染页逐页视觉核对；其他精确 PDF 页码仅代表有可定位的页码链接，不应据此宣称已完成视觉核验。Classic McEliece 的两个条目只回链研究书目，不计入标准原文锚点。
- 仍没有 `00-Standard-Source.md` 的目录包括中国抗量子密码公开进展追踪、GB/T 15852、GB/T 36624 和 Classic McEliece。追踪页没有单一算法标准原文；GB/T 15852 与 GB/T 36624 的本地全文仍是来源缺项；Classic McEliece 的 `00-Research-Source.md` 收录 NIST 状态报告和论文引用，但 ISO 修正案全文受版权/付费访问限制，McEliece 原始论文扫描件也没有可提取文本层。两项均未伪造转录，也不可由项目实现反向生成标准原文。另有 8 个 RFC 目录使用仓库内的 RFC Editor `.txt` 作为原始证据，不应误报为缺少 source artifact。

因此，可以宣称“全目录已有可审计的结构化清单”，但不能宣称“所有条款已完成逐字拆分或全部实现”。后续工作集中在 4 个外部/原件缺口的证据补齐，以及实现与平台后端测评缺项；机械检查入口为
`npm run standards:inventory`、`npm run standards:split-check` 和 `npm run standards:formula-check`。
