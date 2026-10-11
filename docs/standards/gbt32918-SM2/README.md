# GB/T 32918 — SM2 椭圆曲线公钥密码算法

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 32918-2016 — 信息安全技术 SM2椭圆曲线公钥密码算法
      [国家标准全文公开系统](https://openstd.samr.gov.cn/bzgk/gb/std_list_type?p.p2=GB%2FT+32918)
      PDF✅ 已下载 (5部分)，条款导航见 [01-SM2.md](./01-SM2.md)

## 函数/原语索引

- [02-Curve-Operations.md](./02-Curve-Operations.md)：曲线、点加、倍点、标量乘
- [03-Signature.md](./03-Signature.md)：`sm2_sign` / `sm2_verify`
- [04-Encryption.md](./04-Encryption.md)：`sm2_encrypt` / `sm2_decrypt`
- [05-Key-Exchange.md](./05-Key-Exchange.md)：`sm2_key_exchange` 与角色边界

## 组成

| 部分 | 内容 | 块实现 |
|------|------|----------|
| 第1部分 | 总则 | — |
| 第2部分 | 数字签名算法 | `sm2_sign` · `sm2_verify` ✅（GB/T 32918.2-2016 附录 A 官方向量） |
| 第3部分 | 密钥交换协议 | 底层就绪（ecc_* 原语） |
| 第4部分 | 公钥加密算法 | `sm2_encrypt` · `sm2_decrypt` ✅（GB/T 32918.4-2016 附录 A 示例 2） |
| 第5部分 | 参数定义 | 需预设 SM2 曲线 |

## SM2 曲线参数

| 参数 | 值 |
|------|-----|
| p | 0xFFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF 00000000 FFFFFFFF FFFFFFFF |
| a | 0xFFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF 00000000 FFFFFFFF FFFFFFFC |
| b | 0x28E9FA9E 9D9F5E34 4D5A9E4B CF6509A7 F39789F5 15AB8F92 DDBCBD41 4D940E93 |
| Gx | 0x32C4AE2C 1F198119 5F990446 6A39C994 8FE30BBF F2660BE1 715A4589 334C74C7 |
| Gy | 0xBC3736A2 F4F6779C 59BDCEE3 6B692153 D0A9877C C62A4740 02DF32E5 2139F0A0 |
| n | 0xFFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF 7203DF6B 21C6052B 53BBF409 39D54123 |

## 相关块

| 块 | 说明 |
|----|------|
| `ecc_load_curve_params` | 加载 SM2 曲线参数 |
| `ecc_multiply` | 标量乘法 k*P |
| `sm2_sign` / `sm2_verify` | SM2 数字签名/验签（GB/T 32918.2） |
| `sm2_encrypt` / `sm2_decrypt` | SM2 加密/解密（GB/T 32918.4） |
| `sm3_hash` | 生成器内部 helper（签名/加密需要）；模板 `proc_sm3_hash` |

Demo：`demos/procedures/SM2-PointMul.json` · `SM2-Sign.json` · `SM2-Encrypt.json`。

> 说明：`01-SM2.md` 已从本地 PDF 的标题、条款、公式和示例重新整理为结构化参考；
> 原 PDF 保留用于逐条核验。该目录不宣称完整实现 GB/T 32918 的全部协议细节。

<!-- standard-body:start -->

## 标准内容

本目录对应 **GB/T 32918 — SM2 椭圆曲线公钥密码算法**，按标准条款拆分为 5 个结构化条目，覆盖 「GB/T 32918 — SM2 算法参考」、「GB/T 32918.1-2016 §5；GB/T 32918.5-2017 参数」、「GB/T 32918.2-2016 §6–§7」、「SM2 — 公钥加密原语」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [GB/T 32918 — SM2 算法参考](./01-SM2.md) | GB/T 32918 — SM2 算法参考 | 已实现（不代表完整标准覆盖） |
| [SM2 — 曲线与点运算原语](./02-Curve-Operations.md) | GB/T 32918.1-2016 §5；GB/T 32918.5-2017 参数 | `ecc_*` 教学原语已覆盖 |
| [SM2 — 数字签名原语](./03-Signature.md) | GB/T 32918.2-2016 §6–§7 | `sm2_sign` / `sm2_verify` 已映射；协议边界仍需独立验证 |
| [SM2 — 公钥加密原语](./04-Encryption.md) | SM2 — 公钥加密原语 | 仅参考（未映射为块实现） |
| [SM2 — 密钥交换原语](./05-Key-Exchange.md) | SM2 — 密钥交换原语 | 部分实现（不代表完整标准覆盖） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `ecc_load_curve_params` | — | — | — |
| `ecc_load_point` | — | — | — |
| `ecc_add` | — | — | — |
| `ecc_point_double` | — | — | — |
| `ecc_multiply` | — | — | — |
| `sm2_sign` | GB/T 32918.2-2016 附录 A 示例 1（ZA/e/r/s） | `procedures/SM2-Sign.json` 回归该示例；`sm2-verification.test.ts` 与 `sm2-nonce.test.ts` 覆盖验签与随机数路径；`public-key-bytes-output-contract.test.ts` 核对签名容器 | 不覆盖其它 ID、曲线参数或完整标准测试集 |
| `sm2_verify` | GB/T 32918.2-2016 §7.1；公钥检查依 GB/T 32918.1-2016 §6.2.1，详见SM2 签名条目 | `sm2-verification.test.ts` 中的验签块双语端到端用例覆盖附录 A 向量、`r/s` 边界、`r+s=n`、身份/消息篡改及非规范公钥坐标；同文件的 helper 级测试检查公钥域外/离曲线输入和子群拒绝分支。子群分支通过替换阶参数触发，未构造真实非平凡余因子点 | 完整官方测试集、额外曲线/运行环境、密钥生命周期及正式算法验证 |
| `sm2_encrypt` | — | — | — |
| `sm2_decrypt` | — | — | — |
| `sm2_key_exchange` | GB/T 32918.3-2016 附录 A.2 示例 1（B 侧共享密钥） | `SM2-KeyExchange.json` 与 `sm2-key-exchange.test.ts` 覆盖该示例的单方向计算 | 未覆盖完整协议双方与密钥确认流程 |

示例工作区：`demos/procedures/SM2-PointMul.json`、`demos/SM2-Sign.json`、`demos/SM2-Encrypt.json`、`demos/SM2-KeyExchange.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
