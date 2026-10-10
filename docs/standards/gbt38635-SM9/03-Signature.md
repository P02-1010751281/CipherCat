# SM9 — 数字签名与验签

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 标识密码 / 数字签名 |
| 标准定位 | GB/T 38635.1-2020 §5.5、§7.2.7、§7.2.9；GB/T 38635.2-2020 §6.2、§6.4（流程图：§6.3、§6.5） |
| 原文证据 | [第 1 部分 source](./00-Standard-Source.md#L313)、[第 1 部分 PDF](./GBT+38635.1-2020.pdf)；[第 2 部分 source](./00-Standard-Source.md#L2040)、[第 2 部分 PDF](./GBT+38635.2-2020.pdf) |
| 原文位置 | [第 1 部分 §5.5](./00-Standard-Source.md#L313)、[§7.2.7](./00-Standard-Source.md#L457)、[§7.2.9](./00-Standard-Source.md#L509)；[第 2 部分 §6.2](./00-Standard-Source.md#L2040)、[§6.4](./00-Standard-Source.md#L2062) |
| 项目映射 | sm9_sign、sm9_verify；[SM9 签名 Demo](../../../demos/procedures/SM9-Sign.json) |
| 项目状态 | 已有实现；下列测试覆盖不等同完整符合性结论、第三方算法验证或产品认证 |

## 原文定位与引用

标准原文及版面保存在对应 PDF；本页按算法步骤和输入契约拆分整理。引用定位如下：

- GB/T 38635.1-2020 §5.5：有限域曲线点须满足曲线方程及 [N]Q = O；无穷远点不属于 G1/G2 的有效输入点。[source 行 313–322](./00-Standard-Source.md#L313)
- GB/T 38635.1-2020 §7.2.7：基域元素解码为整数后须落在 [0,q−1]。[source 行 457–472](./00-Standard-Source.md#L457)
- GB/T 38635.1-2020 §7.2.9：点编码按所选编码格式解码坐标，并对坐标执行 §7.2.7 的域元素转换。[source 行 509–545](./00-Standard-Source.md#L509)
- GB/T 38635.2-2020 §6.2、§6.4：签名生成和验签步骤；§6.3、§6.5 为对应流程图。[签名步骤 source 行 2040–2052](./00-Standard-Source.md#L2040)、[验签步骤 source 行 2062–2076](./00-Standard-Source.md#L2062)

## 原文摘录

以下完整列出与本块对应的签名与验签算法步骤，按 source 正规化分页和换行；它是结构化转写，不替代标准逐字文本。公式中 N 为群阶，P1、P2 分别为 G1、G2 生成元，Ppub-s 为签名主公钥，deA 为身份 IDA 对应的签名私钥。

## 公式或伪代码

### 签名

~~~text
g = e(P1, Ppub-s)
重复：
    r ← [1, N−1]
    w = g^r，并按标准编码 w
    h = H2(M || w, N)
    l = (r − h) mod N
直到 l ≠ 0
S = [l]deA
按标准编码 h 和 S，输出 (h, S)
~~~

### 验签

~~~text
输入消息 M′、签名 (h′, S′)、身份 IDA、标识 hid 和系统公钥 Ppub-s
B1. 按标准将 h′ 解码为整数；要求 1 ≤ h′ < N
B2. 按标准解码 S′；要求 S′ ∈ G1
B3. g = e(P1, Ppub-s)
B4. t = g^h′
B5. h1 = H1(IDA || hid, N)
B6. Q = [h1]P2 + Ppub-s
B7. u = e(S′, Q)
B8. w′ = u · t，并按标准编码 w′
B9. h2 = H2(M′ || w′, N)；当且仅当 h2 = h′ 时通过
~~~

S′ ∈ G1 不是仅检查曲线方程：标准还要求有效有限域坐标和 [N]S′ = O。坐标字节若解码为 q 或更大的整数，不是合法的基域元素，即使对模 q 运算后会落到曲线上，也必须拒绝。

## 块的输入与输出

| 参数 | Blockly 表示 | 约束 / 含义 |
|---|---|---|
| sm9_sign: MSG、DS、PPUB | 字节数组 | 消息、身份私钥 deA、签名主公钥 Ppub-s |
| sm9_sign: R | 可选字节数组 | 插槽留空时使用安全随机标量；显式输入须为 32 字节且满足 1 ≤ r < N |
| sm9_sign: 输出 | 97 字节数组 | h(32 字节) ‖ S(65 字节，0x04 ‖ x ‖ y) |
| sm9_verify: MSG、ID | 字节数组 | 消息、用户身份 IDA；身份编码须与签发密钥时一致 |
| sm9_verify: H | 32 字节数组 | 签名中的 h；验签要求其整数值位于 [1,N−1] |
| sm9_verify: S | 65 字节数组 | 未压缩点格式 0x04 ‖ x ‖ y；x、y 各 32 字节 |
| sm9_verify: PPUB | 128 字节数组 | 签名主公钥 Ppub-s；四个基域坐标按 x、y 的两个 Fp2 分量编码 |
| sm9_verify: HID | 固定值 `0x01` | 本块仅用于 SM9 签名；与用户签名私钥生成块保持一致 |
| sm9_verify: 输出 | Boolean | 有效返回 true；被验签拒绝的输入返回 false |

生成代码只接受元素为整数 [0,255] 的字节数组。签名 R 插槽留空会使用 Web Crypto（JavaScript）或 secrets（Python）生成标量；显式 R 不做模 N 约减，越界或非 32 字节输入拒绝。随机生成的 r 若导致 l=0 会重新抽取；固定 R 出现该情况则返回错误。

项目签名块将 HID 固定为 `0x01`（签名用途），不提供加密用途 `0x03`。签名与验签入口均检查 Ppub-s 坐标小于 q、非无穷远点、满足 G2 曲线方程及 [N]Ppub-s = O；签名入口还对 DS 做相应的 G1 检查。验签入口检查 H、S、Ppub-s 的长度、h 的区间、S 坐标小于 q、非无穷远点、满足曲线方程及 [N]S = O。非法或非规范点会被拒绝。调用方仍须提供与身份私钥来自同一系统参数和密钥生成流程的公钥；点有效性检查不能证明 DS 与 Ppub-s 相互匹配。

## 实现映射与核验

sm9_sign / sm9_verify 的 JavaScript 和 Python 生成器位于 src/generators/{javascript,python}/sm9/blocks.ts。验签测试 tests/unit/sm9-verification.test.ts 直接加载 Blockly 块、生成两种语言代码并执行，覆盖：

- GB/T 38635.2-2020 附录 A 签名验签向量；
- 消息、身份或签名散列被修改；签名块的 HID 固定为 `0x01`；
- h=0、h=N、错误点前缀、错误长度、非曲线签名点/系统公钥，以及在曲线上但不属于 N 阶子群的系统公钥；
- 字节数组中超出 [0,255] 的元素；
- 将合法曲线坐标加 q 的非规范编码。该负例用固定散列替身隔离输入解码逻辑；独立标准向量测试仍使用实际 SM9 散列和配对实现。

JavaScript 与 Python 对这些用例均产生相同布尔结果。该回归集用于定位已修正的输入解码问题，不覆盖全部标准测试数据、所有非法编码或完整系统参数验证。正式产品边界和第三方验证路径见[产品认证可行性与边界](../PRODUCT-CERTIFICATION-FEASIBILITY.md)。

`tests/unit/sm9-keygen-range.test.ts` 直接执行 `sm9_master_key` 与 `sm9_user_key` Blockly 块生成的两种语言代码，验证密钥标量必须由 32 个 `[0,255]` 字节编码、`N−1` 可接受，而 `0`、`N` 和 `N+1` 均拒绝。

`tests/unit/sm9-randomness.test.ts` 还执行签名块在 `MSG`、`DS`、`Ppub` 各输入含非字节元素时的 JavaScript/Python 拒绝路径；对应语言统一按字节数组契约报错。

签名随机数回归 tests/unit/sm9-randomness.test.ts 检查显式标量边界、双语言标准向量、随机标量拒绝采样，以及通过故障注入覆盖 l=0 的重抽路径。故障注入仅核验分支，不代表自然发生的 KAT；当前测试不等于独立熵源质量检测或正式算法验证。
