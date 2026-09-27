# GB/T 17964 — 分组密码操作模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 17964-2021 — 信息安全技术 分组密码算法的工作模式（代替 2008 版）
      下载: https://openstd.samr.gov.cn/ (需登录)

## 模式

| 模式 | 名称 | 对标 | 块实现 |
|------|------|------|----------|
| ECB | 电码本 | NIST SP 800-38A | `mode_ecb_encrypt` · `mode_ecb_decrypt` |
| CBC | 密码分组链接 | 同上 | `mode_cbc_encrypt` |
| CFB | 密码反馈 | 同上 | 未实现 |
| OFB | 输出反馈 | 同上 | 未实现 |
| CTR | 计数器 | 同上 | `mode_ctr_encrypt` |

> 当前 `mode_*` 生成器实际固定调用 AES helper；SM4 的 GB/T 17964 映射仍是待实现项，不能仅凭目录名称宣称已覆盖。

## 未覆盖

| 模式 | 说明 |
|------|------|
| BC | 块链接 (中国特有) |
| OFB-8 | 8-bit OFB 变体 |

> 本地原件为 GB/T 17964-2021；其 PDF 文本层存在字体映射问题，因此以 [01-Modes.md](./01-Modes.md)
> 的结构化摘要和原 PDF 视觉内容为准。2021 版还包含 XTS、HCTR、BC、OFBNL 等模式，
> 当前目录只导航已实现的 ECB/CBC/CTR 子集。

## 函数/原语索引

- [01-Modes.md](./01-Modes.md)：模式总览
- [02-ECB.md](./02-ECB.md)：ECB
- [03-CBC.md](./03-CBC.md)：CBC
- [04-CTR.md](./04-CTR.md)：CTR
