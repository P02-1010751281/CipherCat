# NIST SP 800-232 — ASCON 轻量认证加密

来源: NIST SP 800-232 — Ascon-Based Lightweight Cryptography Standards for Constrained
      Devices: Authenticated Encryption, Hash, and Extendable Output Functions
      https://csrc.nist.gov/pubs/sp/800/232/final      (2025-08-13 正式发布)
      PDF: [NIST.SP.800-232.pdf](./NIST.SP.800-232.pdf)（Final 版；仓库曾误存 2024-11 IPD 草案，2025-08-05 替换）

## 算法

| 模式 | 类型 | 块实现 |
|------|------|----------|
| Ascon-AEAD128 | AEAD 认证加密 | `ascon_encrypt` ✅（IV=0x00001000808C0001，rate 128/16B，8 轮，即原 Ascon-128a 参数） |
| Ascon-Hash / Ascon-XOF | 哈希 / 可扩展输出 | 未实现 |

## 实现状态

`ascon_encrypt` 已实现并过官方向量（ascon-c 仓 `LWC_AEAD_KAT_128_128.txt` 1089 例 +
pyascon 交叉），Demo：`demos/procedures/ASCON.json`。
