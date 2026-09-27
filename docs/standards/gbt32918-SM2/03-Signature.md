# SM2 — 数字签名原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法 / 签名与验签 |
| 标准定位 | GB/T 32918.2-2016 §6–§7 |
| 原文证据 | [SM2 原文提取](./00-Standard-Source.md) · [第 2 部分 PDF](./GBT-32918.2-2016.pdf) |
| 原文位置 | GB/T 32918.2-2016 §6.1、§7.1；[签名算法](./00-Standard-Source.md#L6651)、[验签算法](./00-Standard-Source.md#L6713) |
| 项目状态 | `sm2_sign` / `sm2_verify` 已映射；协议边界仍需独立验证 |

## 原文定位与引用

> “A1 :置 M = ZA ‖ M”
>
> — GB/T 32918.2-2016 §6.1；[提取稿第 6620 行](./00-Standard-Source.md#L6620)

## 原文摘录

> 以下为 00-Standard-Source.md 中 §6.1、§7.1 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L6651)。

    6.1 数字签名的生成算法
    A1：置 M = ZA ‖ M；
    A2：计算 e = Hv(M)；
    A3：用随机数发生器产生随机数 k ∈ [1,n−1]；
    A4：计算椭圆曲线点 (x1,y1) = [k]G；
    A5：计算 r = (e+x1) mod n，若 r=0 或 r+k=n 则返回 A3；
    A6：计算 s = ((1+dA)^−1 · (k−r·dA)) mod n，若 s=0 则返回 A3。

    7.1 数字签名的验证算法
    B1：检验 r′∈[1,n−1]；B2：检验 s′∈[1,n−1]；
    B3：置 M′ = ZA ‖ M′；B5：计算 t=(r′+s′) mod n，若 t=0 则验证不通过；
    B6：计算 (x1′,y1′)=[s′]G+[t]PA；B7：检验 r′=(e′+x1′) mod n。

## 标准定义

SM2 签名先把用户标识、曲线参数和公钥绑定到 `ZA`，再对 `ZA || M` 做 SM3。签名随机数的
范围和重试条件是算法的一部分；验签必须先检查签名标量范围。

## 公式或伪代码

```text
ZA = SM3(ENTL || IDA || a || b || Gx || Gy || PAx || PAy)
e  = SM3(ZA || M)

repeat:
    k = fresh_scalar(1, n-1)
    (x1,y1) = [k]G
    r = (e + x1) mod n
until r != 0 and r + k != n
s = ((1 + dA)^(-1) * (k - r*dA)) mod n
retry if s = 0
signature = (r,s)

t = (r+s) mod n
(x,y) = [s]G + [t]PA
accept iff (x,y) != O and r == (e+x) mod n
```

`ENTL` 是 `IDA` 的 bit 长度 16-bit 大端编码；所有标量运算在 `mod n` 下进行。

## 输入与输出

| 操作 | 输入 | 输出 |
|---|---|---|
| 签名 | `dA`、`IDA`、消息 `M`、随机数源 | `r || s` |
| 验签 | `PA`、`IDA`、`M`、`r || s` | Boolean |
| 前置条件 | `1 ≤ dA ≤ n−2`、公钥合法、`r,s ∈ [1,n−1]` | 非法输入拒绝 |

## 项目映射

`sm2_sign` / `sm2_verify` 是对应块；SM2 曲线原语见 [02-Curve-Operations.md](./02-Curve-Operations.md)。
`ZA` 的编码和 SM3 helper 由上层流程内部完成，不能用普通 `SM3(M)` 替换。

## 核验与缺项

使用 GB/T 32918.2 附录 A 及 `demos/procedures/SM2-Sign.json` 核对 `ZA`、`e`、`r`、`s` 和验签结果；
另测 `r=0`、`s=0`、`r+s=n`、错误 ID/公钥/消息。向量通过不等于密钥管理、随机源或模块认证通过。
