# ECDSA — 曲线与点运算原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语族 / 椭圆曲线点运算 |
| 标准定位 | FIPS 186-5 §6；项目使用 NIST P-256 参数 |
| 原文证据 | [ECDSA 原文提取](./00-Standard-Source.md) · [PDF](./NIST.FIPS.186-5.pdf) |
| 原文位置 | PDF 物理第 20–22 页（标准页 20–22）；[提取稿 §6.1 第 1174 行](./00-Standard-Source.md#L1174) |
| 项目状态 | 教学用 P-256 点运算已映射 |

## 原文定位与引用

> “ECDSA Domain Parameters”
>
> — FIPS 186-5 §6.1；[提取稿第 1174 行](./00-Standard-Source.md#L1174)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L952)。

```text
6.1 ECDSA Domain Parameters
ECDSA and deterministic ECDSA require that the private/public key pairs used for digital
signature generation and verification be generated with respect to a particular set of domain
parameters. Domain parameters are of the form (q, FR, h, n, Type, a, b, G, {domain_parameter_seed}).
```

## 标准定义

曲线点属于素域上的短 Weierstrass 曲线。公钥为 `Q=[d]G`；点运算前应检查坐标域、曲线方程和
阶条件。无穷远点是群运算中的特殊元素，不能当作普通 `(x,y)` 编码。

## 公式或伪代码

```text
Curve: y^2 = x^3 + a*x + b (mod p)

Add(P,Q):
    λ = (yQ-yP)/(xQ-xP) mod p       if P != Q
    λ = (3*xP^2+a)/(2*yP) mod p     if P = Q
    xR = λ^2 - xP - xQ mod p
    yR = λ*(xP-xR) - yP mod p
    return R=(xR,yR)

Multiply(k,P): double-and-add over the bits of k
```

分母求逆均在 `GF(p)` 中；处理无穷远点和 `P = -Q` 的分支后才能作为完整点加实现。

## 输入与输出

| 原语 | 输入 | 输出 |
|---|---|---|
| `ecc_load_curve_params` | `p,a,b,G,n` | 曲线参数对象 |
| `ecc_load_point` | `x,y` | 曲线点或错误 |
| `ecc_add` / `ecc_point_double` | 曲线点 | 曲线点/无穷远点 |
| `ecc_multiply` | 标量 `k`、点 `P` | `[k]P` |

## 项目映射

块为 `ecc_load_curve_params`、`ecc_load_point`、`ecc_add`、`ecc_point_double`、`ecc_multiply`；
ECDSA 签名/验签流程分别见 [03-Sign.md](./03-Sign.md) 和 [04-Verify.md](./04-Verify.md)。

## 核验与缺项

核验 `G` 的曲线归属、`[n]G=O`、点加交换律和标量乘往返。项目只开放 P-256 教学表示，未覆盖
FIPS 186-5 全部曲线、密钥生成格式或侧信道防护。
