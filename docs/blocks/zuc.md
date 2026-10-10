# 祖冲之序列密码块参考 (GB/T 33133)


ZUC（祖冲之）是国密序列密码，3GPP 128-EEA3/EIA3 核心组件。Blockly 同时提供按算法结构拆分的原子块（两个 8×8 S 盒、两个 32-bit 线性变换和非线性函数 F），以及管理完整状态循环的 `zuc_keystream` 密钥流块。

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的流密码分类详情页。ZUC 应称为序列密码/流密码，不属于后量子密码；EEA3/EIA3 是其上层移动通信算法，不与 ZUC 原子函数混为一谈。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [GB/T 33133 ZUC](../standards/gbt33133-ZUC/)、[标准覆盖矩阵](../standards/COVERAGE.md)；3GPP LTE 语境用于说明 EEA3/EIA3 的参数构造 |
| 实现 | 工具箱中的对应积木与代码生成器 |
| 示例工作区 | [Demo 指南](../guides/DEMO.md)、[EEA3 工作区](../../demos/procedures/EEA3.json)、[EIA3 工作区](../../demos/procedures/EIA3.json) |
| 边界 | 覆盖 ZUC-128 密钥流、EEA3 教学链和 EIA3 MAC 生成；这不代表认证、恒定时间或生产安全保证 |

## ZUC (GB/T 33133-2016)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `zuc_s0` | 1 | value(→) | Number→Number | 8×8 S0 S-box 查表（附录 A.1）；输入须为 0–255 的整数 |
| `zuc_s1` | 1 | value(→) | Number→Number | 8×8 S1 S-box 查表（附录 A.2）；输入须为 0–255 的整数 |
| `zuc_l1` | 1 | value(→) | Number→Number | L1 线性变换，输入须为无符号 32-bit 整数：X⊕(X<<<2)⊕(X<<<10)⊕(X<<<18)⊕(X<<<24) |
| `zuc_l2` | 1 | value(→) | Number→Number | L2 线性变换，输入须为无符号 32-bit 整数：X⊕(X<<<8)⊕(X<<<14)⊕(X<<<22)⊕(X<<<30) |
| `zuc_f` | 1 | value(→) | Number×5→Number | 非线性函数 F(X0,X1,X2,R1,R2)→W；五个输入均须为无符号 32-bit 整数 |
| `zuc_keystream` | 2 | value(→) | Bytes×2 + Number→IntList | 完整 ZUC-128 密钥流算法；输入 16-byte key、16-byte IV 和输出字数，内部管理初始化、状态更新及工作模式 |
| `zuc_eia3` | 2 | value(→) | Bytes×2 + Number×4→Number | 128-EIA3 完整性码：16-byte key、32-bit COUNT、5-bit BEARER、DIRECTION、消息和 bit 长度；输出 32-bit MAC-I |

## 拼接提示

- **S 盒交织**：32-bit S 盒 S(x) = S0(x>>24) ‖ S1(x>>16) ‖ S0(x>>8) ‖ S1(x)——`zuc_f` 内部自动完成，教学可拆开观察
- **完整流程与原子块**：`zuc_keystream` 内部维护 R1/R2 与 LFSR 状态，完成 32 轮初始化、丢弃轮和工作模式；`zuc_f` 原子块只输出 W，用于观察 F 的计算，不单独承担跨轮状态管理。完整流程可直接使用 `zuc_keystream`，或使用密钥流 Procedure 模板。
- **向量覆盖**：单元回归在 Python 和 JavaScript 中覆盖 GB/T 33133.1 附录 C 的 C1（全 0）、C2（key 与 IV 均为 16 字节 `0xFF`）、C3（随机）密钥流向量；Demo 回归另覆盖 GB/T 33133.2 附录 A.1 的 EEA3 向量，以及 GB/T 33133.3-2021 附录 B 示例 1、2 的 EIA3 向量。搭建指南列出三组附录 C 输入与预期输出，并标注 [C1 输入/输出（物理第 13 页）](../standards/gbt33133-ZUC/GBT-33133.1-2016.pdf#page=13)、[C1 状态表、C2（物理第 14 页）](../standards/gbt33133-ZUC/GBT-33133.1-2016.pdf#page=14) 与 [C3（物理第 15 页）](../standards/gbt33133-ZUC/GBT-33133.1-2016.pdf#page=15) 原文页。
- **密钥流输入**：`zuc_keystream` 要求 16 字节 key、16 字节 IV 和非负整数输出字数；生成器对输出长度另设资源上限，该上限不是标准算法限制。
- **EIA3 向量**：GB/T 33133.3-2021 附录 B 示例 1、2（1 bit、577 bit）在 Python 和 JavaScript 生成代码中通过；非法参数也有拒绝测试
- **原语输入**：S0/S1 拒绝非整数或超出 0–255 的输入；L1/L2/F 拒绝非整数或超出 32-bit 无符号范围的输入。整数值浮点数（如 `1.0`）按对应整数处理。

## 数据来源

S0/S1 S 盒数据逐项对照本仓库 `docs/standards/gbt33133-ZUC/00-Standard-Source.md` 的 GB/T 33133.1 附录表 A.1/A.2 提取原文。
