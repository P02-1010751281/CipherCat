# CipherCat 密码学调研文献

本目录保存本次调研实际下载并通过 `pdfinfo` 检查可读取的标准和论文 PDF。最近核验/下载日期：2026-09-25。校验值为 SHA-256；来源链接保留在表中，便于后续重新核对版本。这里的 PDF 是研究与教学依据，不代表 CipherCat 已通过相应认证。

随机性测评补充引用的 NIST 原文集中登记于[补充文献索引](../../docs/research/sources/README.md)，避免把同一 PDF 作为多套书目重复管理。

| 文件 | 文献 / 标准 | 用途 | 来源 |
|---|---|---|---|
| [NIST.FIPS.203.pdf](./NIST.FIPS.203.pdf) | FIPS 203 ML-KEM | ML-KEM 参数集、KEM 流程与合规边界 | [NIST](https://csrc.nist.gov/pubs/fips/203/final) |
| [NIST.FIPS.204.pdf](./NIST.FIPS.204.pdf) | FIPS 204 ML-DSA | ML-DSA 签名/验签规范 | [NIST](https://csrc.nist.gov/pubs/fips/204/final) |
| [NIST.FIPS.205.pdf](./NIST.FIPS.205.pdf) | FIPS 205 SLH-DSA | SPHINCS+ 标准化后的无状态哈希签名规范 | [NIST](https://csrc.nist.gov/pubs/fips/205/final) |
| [NIST.SP.800-232.pdf](./NIST.SP.800-232.pdf) | NIST SP 800-232 Ascon | 轻量 AEAD、Hash、XOF 标准 | [NIST](https://csrc.nist.gov/pubs/sp/800/232/final) |
| [NIST.SP.800-227.pdf](./NIST.SP.800-227.pdf) | NIST SP 800-227 KEM 建议 | KEM 定义、属性、安全实现与使用建议 | [NIST](https://csrc.nist.gov/pubs/sp/800/227/final) |
| [NIST.SP.800-90B.pdf](./NIST.SP.800-90B.pdf) | NIST SP 800-90B 熵源 | 熵源模型、最小熵估计和健康测试 | [NIST](https://csrc.nist.gov/pubs/sp/800/90/b/final) |
| [NIST.SP.800-90C.pdf](./NIST.SP.800-90C.pdf) | NIST SP 800-90C RBG 构造 | 熵源、DRBG 与随机比特生成器构造 | [NIST](https://csrc.nist.gov/pubs/sp/800/90/c/final) |
| [NIST.SP.800-22r1a.pdf](./NIST.SP.800-22r1a.pdf) | NIST SP 800-22 Rev. 1a | 统计测试方法、结果解释与样本数量建议 | [NIST](https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final) |
| [NIST.IR.8446.pdf](./NIST.IR.8446.pdf) | NIST IR 8446（2026-01） | 比较 NIST SP 800-90 系列与 BSI AIS 20/31 的术语、假设与要求 | [NIST](https://csrc.nist.gov/pubs/ir/8446/final) |
| [NIST.IR.8454.pdf](./NIST.IR.8454.pdf) | NIST IR 8454 轻量密码最终轮报告 | Ascon 入选过程与最终轮评估背景 | [NIST](https://nvlpubs.nist.gov/nistpubs/ir/2023/NIST.IR.8454.pdf) |
| [FIPS-140-3-IG.pdf](./FIPS-140-3-IG.pdf) | FIPS 140-3 Implementation Guidance（2026-08-19） | KAT、条件测试和密码模块验证边界 | [NIST CMVP](https://csrc.nist.gov/projects/cryptographic-module-validation-program/fips-140-3-ig-announcements) |
| [CRYSTALS-Kyber-2017-634.pdf](./CRYSTALS-Kyber-2017-634.pdf) | CRYSTALS-Kyber | ML-KEM 的原始方案与 Module-LWE 背景 | [IACR ePrint 2017/634](https://eprint.iacr.org/2017/634) |
| [CRYSTALS-Dilithium-2017-633.pdf](./CRYSTALS-Dilithium-2017-633.pdf) | CRYSTALS-Dilithium | ML-DSA 的原始方案与格签名结构 | [IACR ePrint 2017/633](https://eprint.iacr.org/2017/633) |
| [SPHINCS-plus-2019-1086.pdf](./SPHINCS-plus-2019-1086.pdf) | The SPHINCS+ Signature Framework | SLH-DSA 的前身、FORS、可调哈希与安全分析 | [IACR ePrint 2019/1086](https://eprint.iacr.org/2019/1086) |
| [HACL-star-verified-library.pdf](./HACL-star-verified-library.pdf) | HACL*: A Verified Modern Cryptographic Library | 内存安全、功能正确性、秘密无关性与验证工程 | [Microsoft Research](https://www.microsoft.com/en-us/research/publication/hacl-a-verified-modern-cryptographic-library/) |
| [machine-checked-crypto-standards-2019-1155.pdf](./machine-checked-crypto-standards-2019-1155.pdf) | Machine-Checked Proofs for Cryptographic Standards | 将标准规范与机器检查证明连接起来 | [IACR ePrint 2019/1155](https://eprint.iacr.org/2019/1155) |
| [practical-formal-methods-crypto-2019.pdf](./practical-formal-methods-crypto-2019.pdf) | Practical Formal Methods for Real World Cryptography | HACL*、F*、Low* 等高保证密码实现方法 | [Dagstuhl / LIPIcs](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.FSTTCS.2019.1) |
| [constant-time-verification-2024.pdf](./constant-time-verification-2024.pdf) | Towards Efficient Verification of Constant-Time Cryptographic Implementations | 常量时间性质的自动化验证方向 | [arXiv:2402.13506](https://arxiv.org/abs/2402.13506) |
| [CryptoScratch-2023.pdf](./CryptoScratch-2023.pdf) | CryptoScratch | 面向教学的密码积木、任务块和反馈机制 | [arXiv:2302.11606](https://arxiv.org/abs/2302.11606) |

## SHA-256 校验值

```text
9876686de5a893e72727691adf5b2659520b2d65bd90696c02e8a7a60a00c5dd  CRYSTALS-Dilithium-2017-633.pdf
f7f36ce2f05d8d666510bbc9296a435bb32cc1849d38699701b1848e6450f1af  CRYSTALS-Kyber-2017-634.pdf
fabee41a9e46d2a02d9873f3fb6f35a717548ede56685db73c97568ceac8252b  CryptoScratch-2023.pdf
15ebdd396a31129f9d75137ace99be56b1085feb25a95c990f8b6558440aeb02  FIPS-140-3-IG.pdf
2c8e0345089d700452b5edfde90af5143fb19633621821916d7ebf0218b47639  HACL-star-verified-library.pdf
fe1f12f32a7e44ec9fdebbf400cda843a40b506dee676725234dc6f7923b6cac  NIST.FIPS.203.pdf
57239b9f84c03227eda3ca0991204dc7764c79af9ce2e6824eda774918d46b6b  NIST.FIPS.204.pdf
8ef34228276f3386d23cb0da8c14592b8cfb0db3358016bba64df7a004f8d13d  NIST.FIPS.205.pdf
1be9bb9a5fef3665ee8b258babe54b8e500d667fcfbbcc99710fe6077c6bad27  NIST.SP.800-232.pdf
41e427a461c1ae0ceed2a68dc29507400983d1d495c35631306d0f4803ca4614  NIST.SP.800-227.pdf
9b0dd77131ade3617a91cd8457fa09e0dc354c273bb2220a6afeaca16e5defe7  NIST.SP.800-90B.pdf
22dc2de903b2fe602fa0729c38b9512927ad96ef5669a3da8a0ffb4d22c8e6d8  NIST.SP.800-90C.pdf
38aba1b34a7fa52c440790d6e0cabf498e4b525177b3b6cebb399ab8ccf031d2  NIST.SP.800-22r1a.pdf
39919f9c7313c47371d7b996e97ee03ef1c4116a9dca4f3cd8af46129a7dba56  NIST.IR.8446.pdf
0f89ee7b08f4670042a3f558fb911230af1f24fc0932fe3604cf2150a00db5eb  NIST.IR.8454.pdf
9b49545b61bc194f0d7793556b04ca8f2257990057e229f51164ce2aafe89aa6  SPHINCS-plus-2019-1086.pdf
ac0394201b88f96f21163ce08154327092d8526d158805570f1801f35351b041  constant-time-verification-2024.pdf
463214a90569716bc29ca12dd04d4573f5d272d70da4e24b738e82c5a304003b  machine-checked-crypto-standards-2019-1155.pdf
5376ad69425f84ea7f9cfd4748399249d4f99710b41f940a3514ad24862580fd  practical-formal-methods-crypto-2019.pdf
```
