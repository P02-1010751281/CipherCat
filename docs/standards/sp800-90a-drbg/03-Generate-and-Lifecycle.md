# DRBG — Generate 与生命周期边界

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法 / 状态生命周期 |
| 标准定位 | NIST SP 800-90A Rev.1 §10.1.2 |
| 原文证据 | [DRBG 原文提取](./00-Standard-Source.md) · [PDF](./NIST.SP.800-90A.pdf) |
| 原文位置 | PDF 物理第 52–56 页（标准页 43–47）；[提取稿 §10.1.2](./00-Standard-Source.md#L2332) |
| 项目状态 | HMAC-DRBG 一次性教学路径已覆盖；完整生命周期为缺项 |

## 原文定位与引用

> “HMAC_DRBG uses multiple occurrences of an approved keyed hash function.”
>
> — NIST SP 800-90A Rev.1 §10.1.2；[提取稿第 2332–2337 行](./00-Standard-Source.md#L2332)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L2332)。

    10.1.2 HMAC_DRBG
    HMAC_DRBG uses multiple occurrences of an approved keyed hash function, which is
    based on an approved hash function. This DRBG mechanism uses the

## 标准定义

HMAC_DRBG 的 Generate 以当前 `K,V` 迭代 HMAC 产生请求长度的输出，完成后必须更新状态。实例化、
重播种、additional input、prediction resistance 和请求上限是独立生命周期规则，不能用一次 Generate
替代。

## 公式或伪代码

```text
Generate(requested_bits, additional_input):
    if additional_input != NULL:
        Update(additional_input)
    temp = empty
    while len(temp) < requested_bits:
        V = HMAC(K, V)
        temp = temp || V
    returned_bits = leftmost(temp, requested_bits)
    Update(additional_input or NULL)
    return returned_bits
```

状态初始 `K=00…00`、`V=01…01`；具体 `Update` 见 [02-HMAC-DRBG-Update.md](./02-HMAC-DRBG-Update.md)。

## 输入与输出

| 项目 | 输入 | 输出 |
|---|---|---|
| 教学块 | entropy、nonce、personalization、整数请求位数（最多 `2^19` bit） | 左端指定数量的位；块以字节数组返回。项目将末字节未请求的低位清零，作为字节数组编码约定 |
| 标准 Generate | 已实例化状态、请求长度、可选 additional input | 随机比特和新状态 |
| 状态错误 | 未实例化、需 reseed、请求超限 | 应拒绝/报错 |

## 项目映射

`drbg_generate` 对应一次性 HMAC-DRBG 路径，按 SP 800-90A Rev.1 §10.1 Table 2 拒绝超过 `2^19` bit 的请求；标准定义左端位截取，项目另约定由字节数组承载时采用 MSB-first，末字节的未请求低位清零。该字节表示是项目 API 契约，不是标准规定的字节格式。双语言生成器要求请求值为非负安全整数。Demo 为 `demos/procedures/DRBG.json`。Hash_DRBG、
CTR_DRBG、公开 reseed/additional-input/prediction-resistance 块均未覆盖。

## 核验与缺项

[`drbg-block-contract.test.ts`](../../../tests/unit/drbg-block-contract.test.ts) 通过真实 Blockly 块生成并执行 JavaScript/Python，核对零位空输出、`2^19` bit 上限、负数/小数/超上限拒绝，以及 1/8/9/16 bit 左端截取和项目末字节编码约定；另以内部状态 helper 核对 NIST CAVS 14.3 HMAC_DRBG SHA-256、无重播种配置下 COUNT=0 的选定返回值（Instantiate 后连续调用两次 Generate）。NIST 将这些公开向量定位为非正式正确性核验，并明确不能替代 CAVP 验证：[DRBG CAVP 测试与向量](https://csrc.nist.gov/Projects/Cryptographic-Algorithm-Validation-Program/Random-Number-Generators)。当前仍未覆盖完整 CAVP HMAC_DRBG 向量集、实例化熵要求、状态/重播种计数、additional input 生命周期、预测抗性与故障响应矩阵。该有限向量不等于 CMVP/FIPS 认证。
