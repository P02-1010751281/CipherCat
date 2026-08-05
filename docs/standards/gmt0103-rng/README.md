# GM/T 0103-2021 — 随机数发生器总体框架

来源: GM/T 0103-2021
      PDF: [GMT-0103-2021.pdf](./GMT-0103-2021.pdf)
      仓库: https://github.com/gmkits/cryptography-standards

## 内容

中国随机数发生器 (RNG) 标准，定义确定性随机比特生成器 (DRBG) 框架。

## 实现状态

✅ 已实现：`gm_rng`（SM3-HMAC-DRBG，GM/T 0103 框架），官方向量 Demo：`demos/procedures/GM-RNG.json`。`seed_bytes` 块提供种子输入。
