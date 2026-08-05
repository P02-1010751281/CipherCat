# GM/T 0103-2021 — 随机数发生器总体框架

来源: GM/T 0103-2021
      PDF: [GMT-0103-2021.pdf](./GMT-0103-2021.pdf)
      仓库: https://github.com/gmkits/cryptography-standards

## 内容

中国随机数发生器 (RNG) 标准，定义确定性随机比特生成器 (DRBG) 框架。

## 实现状态

✅ 已实现：`gm_rng`（SM3-HMAC-DRBG，GM/T 0103 框架），官方向量 Demo：`demos/procedures/GM-RNG.json`。`seed_bytes` 块提供种子输入。

> ⚠️ 扫描版 PDF 提取：本目录拆分/提取文件来自扫描版 PDF 的 OCR 文本层，
> 数学公式的上下标与特殊符号可能丢失/粘连（如 SM3/SM4 已修复核心公式区）；
> 精确公式以目录内 PDF 原文为准。
