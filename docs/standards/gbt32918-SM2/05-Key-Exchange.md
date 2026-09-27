# SM2 — 密钥交换原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | SM2 — 密钥交换原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §6.1，行 7455–7581](./00-Standard-Source.md#L7455-L7581)；流程图行 7584–7591；PDF 第 4–5 页 |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“SM2 — 密钥交换原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页对应标准 §6.1。完整 A1–A10/B1–B10 步骤在 [提取稿行 7455–7581](./00-Standard-Source.md#L7455-L7581)，流程图在 [行 7584–7591](./00-Standard-Source.md#L7584-L7591)；中文 PDF 文字层的上下标/字形需以 PDF 第 4–5 页复核。

原件：[GB/T 32918.3-2016 PDF](./GBT-32918.3-2016.pdf)。以下保留标准双方角色的完整步骤；仅恢复了文字层丢失的空格、下标和连接符。

```text
Let w = (log2(n) / 2) - 1.

User A (initiator):
A1. Generate rA in [1, n-1].
A2. Compute RA = [rA]G = (x1, y1).
A3. Send RA to user B.

User B (responder):
B1. Generate rB in [1, n-1].
B2. Compute RB = [rB]G = (x2, y2).
B3. Convert x2 to an integer and compute xbar2 = 2^w + (x2 & (2^w - 1)).
B4. Compute tB = (dB + xbar2*rB) mod n.
B5. Validate RA; on failure, abort. Convert x1 and compute xbar1 = 2^w + (x1 & (2^w - 1)).
B6. Compute V = h*tB · (PA + xbar1 · RA); if V is infinity, abort.
B7. Compute KB = KDF(xV || yV || ZA || ZB, klen).
B8. Optionally compute SB = Hash(0x02 || yV || Hash(xV || ZA || ZB || x1 || y1 || x2 || y2)).
B9. Send RB and optional SB to user A.

User A (initiator):
A4. Convert x1 and compute xbar1 = 2^w + (x1 & (2^w - 1)).
A5. Compute tA = (dA + xbar1*rA) mod n.
A6. Validate RB; on failure, abort. Convert x2 and compute xbar2 = 2^w + (x2 & (2^w - 1)).
A7. Compute U = h*tA · (PB + xbar2 · RB); if U is infinity, abort.
A8. Compute KA = KDF(xU || yU || ZA || ZB, klen).
A9. Optionally compute S1 = Hash(0x02 || yU || Hash(xU || ZA || ZB || x1 || y1 || x2 || y2)); verify S1 = SB.
A10. Optionally compute SA = Hash(0x03 || yU || Hash(xU || ZA || ZB || x1 || y1 || x2 || y2)); send SA to user B.

User B (responder):
B10. Optionally compute S2 = Hash(0x03 || yV || Hash(xV || ZA || ZB || x1 || y1 || x2 || y2)); verify S2 = SA.
```

## 公式或伪代码

> 本条目当前没有从 GB/T 32918.3 原件完整恢复协议算法块；下面的项目公式不能冒充标准原文。完整标准公式仍须回到原件和 source 的第 6 章逐项核对。

## 协议骨架

双方分别拥有静态密钥、临时密钥和身份绑定值 `ZA/ZB`。协议使用静态/临时公钥点组合计算共享点，再将共享点坐标和身份绑定信息送入 KDF；确认值用于证明双方得到同一共享密钥。

## CipherCat 映射

`sm2_key_exchange` 当前实现第 3 部分 §6.2 的 B 侧路径：

```text
RB=[rB]G
tB=(dB+x̄2·rB) mod n
V=[h·tB](PA+[x̄1]RA)
K=KDF(xV||yV||ZA||ZB,klen)
```

块还生成 B 侧确认值所需的中间量，输入包含 `dB/rB/PA/RA/RB/ZA/ZB`。

## 缺项

当前缺少角色对称的 A/B 端到端负例、临时点/身份错误处理矩阵和独立互操作向量；不能用一次普通 ECDH 结果替代 SM2 密钥交换验证。

Demo：`demos/procedures/SM2-KeyExchange.json`。
