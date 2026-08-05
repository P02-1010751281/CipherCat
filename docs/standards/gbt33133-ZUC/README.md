# GB/T 33133 — ZUC 祖冲之序列密码算法

来源: GB/T 33133-2016 — 信息安全技术 祖冲之序列密码算法（第 1-3 部分）
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

## 实现状态

已实现：`src/blocks/zuc/` 6 块（S0/S1/L1/L2/F 原子块 + zuc_keystream 完整块）+ `proc_zuc_keystream` 模板（🔧 ZUC_Keystream），demo 见 `demos/procedures/EEA3.json`。搭建方法见上方指南。
