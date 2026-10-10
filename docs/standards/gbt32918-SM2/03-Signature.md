# SM2 — 数字签名原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法 / 签名与验签 |
| 标准定位 | GB/T 32918.2-2016 §6–§7 |
| 原文证据 | [SM2 原文提取](./00-Standard-Source.md) · [第 1 部分 PDF](./GBT-32918.1-2016.pdf) · [第 2 部分 PDF](./GBT-32918.2-2016.pdf) |
| 原文位置 | GB/T 32918.1-2016 §6.2.1、GB/T 32918.2-2016 §6.1、§7.1；[公钥验证](./00-Standard-Source.md#L1536)、[签名算法](./00-Standard-Source.md#L6651)、[验签算法](./00-Standard-Source.md#L6713) |
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
范围和重试条件是算法的一部分；验签必须先检查签名标量范围。此实现还在计算 `ZA` 前按
GB/T 32918.1-2016 §6.2.1 校验公钥：验签接口采用仿射坐标输入（无穷远点不属于可输入表示），并检查坐标范围、曲线方程及 `[n]PA = O`。
第 1 部分将公钥验证列为可选步骤；本块选择在验签入口执行，避免把未经验证的点带入运算。

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
| 签名 | `dA`、`IDA`、消息 `M`、随机数源 | `r ‖ s` |
| 验签 | `PA`、`IDA`、`M`、`r ‖ s` | Boolean |
| 前置条件 | `1 ≤ dA ≤ n−2`、公钥合法、`r,s ∈ [1,n−1]` | 非法输入拒绝 |

## 项目映射

`sm2_sign` / `sm2_verify` 是对应块；SM2 曲线原语见 [02-Curve-Operations.md](./02-Curve-Operations.md)。
`ZA` 的编码和 SM3 helper 由上层流程内部完成，不能用普通 `SM3(M)` 替换。

## 核验与缺项

`tests/unit/sm2-verification.test.ts` 直接加载 Blockly `sm2_verify` 块并执行 JavaScript/Python 生成代码；块级用例覆盖 GB/T 32918.2 附录 A 向量、`r/s` 为 0 或 `n`、将有效 `r/s` 加 `n`、`r+s=n`、错误 ID 和消息，以及以非规范坐标伪装同一曲线点的端到端拒绝。公钥坐标域外/不在曲线上的输入由同文件直接调用验证 helper 检查；子群拒绝分支也在 helper 级测试中通过替换阶参数触发，不代表构造了真实非平凡余因子点。该测试集只覆盖所列回归，不等于完整官方测试集。

仍需补齐适用的完整官方测试数据、错误输入矩阵及目标产品环境验证。向量通过不等于密钥管理、随机源、算法正式验证或模块认证通过。
