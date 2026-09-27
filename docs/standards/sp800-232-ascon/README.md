# NIST SP 800-232 — ASCON 轻量认证加密

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

## 算法逐项拆分

原文 7 个独立算法均有独立条目页；概览页只负责导航和项目边界。

| 算法 | 条目页 | 项目状态 |
|:--:|---|---|
| 1 `parse` | [`05-parse.md`](./05-parse.md) | 仅参考 |
| 2 `pad` | [`06-pad.md`](./06-pad.md) | 仅参考 |
| 3 `Ascon-AEAD128.enc` | [`07-Ascon-AEAD128-enc.md`](./07-Ascon-AEAD128-enc.md) | 部分实现 |
| 4 `Ascon-AEAD128.dec` | [`08-Ascon-AEAD128-dec.md`](./08-Ascon-AEAD128-dec.md) | 已实现选定路径 |
| 5 `Ascon-Hash256` | [`09-Ascon-Hash256.md`](./09-Ascon-Hash256.md) | 已实现选定路径 |
| 6 `Ascon-XOF128` | [`10-Ascon-XOF128.md`](./10-Ascon-XOF128.md) | 已实现选定路径 |
| 7 `Ascon-CXOF128` | [`11-Ascon-CXOF128.md`](./11-Ascon-CXOF128.md) | 已实现选定路径 |

来源: NIST SP 800-232 — Ascon-Based Lightweight Cryptography Standards for Constrained
      Devices: Authenticated Encryption, Hash, and Extendable Output Functions
      https://csrc.nist.gov/pubs/sp/800/232/final      (2025-08-13 正式发布)
      PDF: [NIST.SP.800-232.pdf](./NIST.SP.800-232.pdf)（Final 版；仓库曾误存 2024-11 IPD 草案，2025-08-05 替换）

## 算法

| 模式 | 类型 | 块实现 |
|------|------|----------|
| Ascon-AEAD128 | AEAD 认证加密 | `ascon_encrypt` ✅（IV=0x00001000808C0001，rate 128/16B，8 轮，即原 Ascon-128a 参数） |
| Ascon-Hash256 / XOF128 / CXOF128 | 哈希 / 可扩展输出 | `ascon_hash256` / `ascon_xof128` / `ascon_cxof128`；扩展 Demo 已验证 |

## 实现状态

`ascon_encrypt` 已实现并通过官方向量（ascon-c 仓 `LWC_AEAD_KAT_128_128.txt` 1089 例 +
pyascon 交叉）；`ascon_decrypt`、`ascon_hash256`、`ascon_xof128`、`ascon_cxof128` 已接入，
并由 `demos/procedures/ASCON-Extended.json` 做双语言输出和错误标签拒绝核验。当前扩展 Demo
不是完整官方 Hash/XOF KAT 套件，也不覆盖标准定义的流式 API。

## 函数/原语索引

- [01-Ascon.md](./01-Ascon.md)：标准范围与 AEAD 总览
- [02-Permutation.md](./02-Permutation.md)：320-bit 置换（由高层块内部使用）
- [12-pC.md](./12-pC.md)、[13-pS.md](./13-pS.md)、[14-pL.md](./14-pL.md)：置换三层的公式与边界
- [03-Hash-XOF.md](./03-Hash-XOF.md)：Hash/XOF/CXOF 缺项
- [04-AEAD.md](./04-AEAD.md)：AEAD 加密与解密边界
