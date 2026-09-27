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
| 教学块 | entropy、nonce、personalization、输出长度 | 指定长度字节串 |
| 标准 Generate | 已实例化状态、请求长度、可选 additional input | 随机比特和新状态 |
| 状态错误 | 未实例化、需 reseed、请求超限 | 应拒绝/报错 |

## 项目映射

`drbg_generate` 对应一次性 HMAC-DRBG 路径，demo 为 `demos/procedures/DRBG.json`。Hash_DRBG、
CTR_DRBG、公开 reseed/additional-input/prediction-resistance 块均未覆盖。

## 核验与缺项

核验 NIST CAVP HMAC_DRBG 向量、重复输入确定性、连续 Generate 状态变化和请求长度边界。完整
实例化/重播种/故障响应矩阵仍需补齐；CAVP 向量通过不等于 CMVP/FIPS 认证。
