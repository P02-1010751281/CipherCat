# HMAC — 密钥规范化原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 密钥预处理 |
| 标准定位 | FIPS 198-1 §3 |
| 原文证据 | [HMAC 原文提取](./00-Standard-Source.md) · [PDF](./NIST.FIPS.198-1.pdf) |
| 原文位置 | PDF 物理第 10 页（标准页 4）；[提取稿 §3](./00-Standard-Source.md#L318) |
| 项目状态 | 由 `hash_hmac` 内部实现 |

## 原文定位与引用

> “When an application uses a K longer than B-bytes, then it shall first hash the K using H.”
>
> — FIPS 198-1 §3；[提取稿第 321 行](./00-Standard-Source.md#L321)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L318)。

    3
    3. CRYPTOGRAPHIC KEYS
    HMAC uses a key, K, of appropriate security strength, as discussed in NIST Special

## 标准定义

HMAC 先把密钥转换为与底层哈希分组长度相同的 `K0`。长于分组的密钥先哈希，短于分组的密钥
在右侧补零，恰好一个分组则直接使用。

## 公式或伪代码

```text
NormalizeKey(K, B):
    if len(K) > B: K0 = H(K)
    else:          K0 = K
    return K0 || 0x00 * (B - len(K0))
```

这里的 `B` 是底层哈希的分组长度，不是摘要长度；`H(K)` 的结果长度必须小于等于 `B`。

## 输入与输出

| 项目 | 约束 |
|---|---|
| 输入 | 任意字节串密钥、底层哈希 `H` |
| 参数 | `B` 为哈希分组长度，`L` 为摘要长度 |
| 输出 | 恰好 `B` 字节的 `K0` |
| 错误条件 | 不接受把摘要长度当作 `B` 的调用约定 |

## 项目映射

规范化由 `hash_hmac` 内部完成；`hmac_sha256` 与 `sm3_hmac` 是生成器 helper，复用同一规则，
不是独立 Blockly 块。完整构造见 [03-Construction.md](./03-Construction.md)。

## 核验与缺项

至少核验 `len(K)<B`、`=B`、`>B` 三个分支，并与 HMAC-SHA-256/SM3 向量联测。密钥擦除、常量
时间和认证模块状态不属于本页保证。
