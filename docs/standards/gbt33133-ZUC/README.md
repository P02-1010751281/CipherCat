# GB/T 33133 — ZUC 祖冲之序列密码算法

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 33133-2016/2021 — 信息安全技术 祖冲之序列密码算法（第 1-3 部分）
      第1部分 [GBT-33133.1-2016.pdf](./GBT-33133.1-2016.pdf) · 第2部分 [GBT+33133.2-2021.pdf](./GBT+33133.2-2021.pdf) · 第3部分 [GBT+33133.3-2021.pdf](./GBT+33133.3-2021.pdf)

## 参数

| 参数 | 值 |
|------|-----|
| 密钥长度 | 128 bit (ZUC-128) |
| IV 长度 | 128 bit |
| 输出 | 32-bit 密钥流字 |

## 结构

| 组件 | 说明 |
|------|------|
| LFSR | 16 级线性反馈移位寄存器 (31-bit cells) |
| BR | 比特重组 (从 LFSR 提取 4×32-bit) |
| F | 非线性函数 (含 S-box) |

> 相关标准：GM/T 0001.4-2024《祖冲之序列密码算法 第4部分：鉴别式加密机制》（AEAD，2024 新行业标准，未覆盖）；ZUC-256（256 位密钥/184 位 IV）为后续变体，未覆盖。

## 指南

- [ZUC-KeyStream-搭建指南.md](guides/ZUC-KeyStream-搭建指南.md)（中文）
- [ZUC-KeyStream-搭建指南.en.md](guides/ZUC-KeyStream-搭建指南.en.md)（English）

## 函数/原语索引

- [02-SBox-Linear.md](./02-SBox-Linear.md)：`S0/S1/L1/L2`
- [03-F-and-LFSR.md](./03-F-and-LFSR.md)：比特重组、F 和 LFSR
- [04-Keystream.md](./04-Keystream.md)：密钥流生成
- [05-EEA3-EIA3.md](./05-EEA3-EIA3.md)：EEA3 与 EIA3 的完整公式、Blockly 块及向量覆盖

## 实现状态

已实现：`src/blocks/zuc/` 7 块（S0/S1/L1/L2/F 原子块、`zuc_keystream` 和 `zuc_eia3`）+ `proc_zuc_keystream` 模板。EEA3 与 EIA3 Demo 分别见 `demos/procedures/EEA3.json` 和 `demos/procedures/EIA3.json`；后者使用 GB/T 33133.3-2021 附录 B 示例 1、2，并验证双语言输出及非法参数拒绝。搭建方法见上方指南。

> 说明：算法主线已在 [01-ZUC.md](./01-ZUC.md) 重新整理；PDF 保留用于逐条核验。
> 128-EIA3 的块和选定官方向量已接入；覆盖范围不等于认证或生产安全证明。
