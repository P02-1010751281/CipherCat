# ZUC — 128-EEA3 与 128-EIA3

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 保密性构造 / 完整性构造 |
| 标准定位 | GB/T 33133.2-2021 §5.2；GB/T 33133.3-2021 §5.2 |
| 原文证据 | [ZUC 原文提取](./00-Standard-Source.md) · [第 2 部分 PDF](./GBT+33133.2-2021.pdf) · [第 3 部分 PDF](./GBT+33133.3-2021.pdf)，含 §5.2 算法及附录 B 测试示例 |
| 原文位置 | 第 2、3 部分算法和 LTE IV 构造见 PDF 物理第 6–8 页（标准印刷第 2–4 页）；[第 2 部分算法 L156–L170](./00-Standard-Source.md#L156-L170)、[第 3 部分算法 L464–L485](./00-Standard-Source.md#L464-L485)；附录 B 示例见第 3 部分 PDF 物理第 9–10 页（印刷第 5–6 页） |
| 项目状态 | EEA3 教学链和 EIA3 MAC 块已覆盖；GB/T 33133.3 附录 B 示例 1、2（1 bit、577 bit）及非法参数拒绝在双语言 Demo 中验证 |

## 原文摘录

本页完整列出 GB/T 33133.2-2021 和 GB/T 33133.3-2021 的输入表、输出表、IV 构造和算法步骤。公式按 PDF 视觉页规范化。

## 原文定位与引用

完整算法来自 GB/T 33133.2-2021 §5.2 和 GB/T 33133.3-2021 §5.2；对应原文行号见上方“原文证据”和“原文位置”。

## 公式或伪代码

### 128-EEA3 保密性算法

### 输入与输出

| 参数 | 长度 | 含义 |
|---|---:|---|
| `CK` | 128 bit | 保密性密钥 |
| `IV` | 128 bit | 初始向量 |
| `LENGTH` | 32 bit | 明文比特长度 |
| `IBS` | `LENGTH` | 输入比特流 |
| `OBS` | `LENGTH` | 输出比特流 |

### 算法步骤

```text
L = ceil(LENGTH / 32)
K[0..32*L-1] = ZUC(CK, IV, L) as a bit string

IBS = IBS[0] || IBS[1] || ... || IBS[LENGTH-1]
OBS = OBS[0] || OBS[1] || ... || OBS[LENGTH-1]

for i = 0, 1, ..., LENGTH-1:
    OBS[i] = IBS[i] xor K[i]
```

### 3GPP LTE IV 构造

```text
COUNT = COUNT[0] || COUNT[1] || COUNT[2] || COUNT[3]
IV = IV[0] || IV[1] || ... || IV[15]

IV[0] = COUNT[0]
IV[1] = COUNT[1]
IV[2] = COUNT[2]
IV[3] = COUNT[3]
IV[4] = BEARER || DIRECTION || 00
IV[5] = IV[6] = IV[7] = 00000000
IV[8] = IV[0]
IV[9] = IV[1]
IV[10] = IV[2]
IV[11] = IV[3]
IV[12] = IV[4]
IV[13] = IV[5]
IV[14] = IV[6]
IV[15] = IV[7]
```

## 128-EIA3 完整性算法

### 输入与输出

| 参数 | 长度 | 含义 |
|---|---:|---|
| `IK` | 128 bit | 完整性密钥 |
| `IV` | 128 bit | 初始向量 |
| `LENGTH` | 32 bit；`1 ≤ LENGTH ≤ 2³²−1` | 输入消息比特长度 |
| `M` | `LENGTH` | 输入消息比特流；字节数组按高位到低位读取，末字节未使用的低位忽略 |
| `MAC` | 32 bit | 消息认证码 |

### 算法步骤

```text
L = ceil(LENGTH / 32) + 2
K[0..32*L-1] = ZUC(IK, IV, L) as a bit string

for i = 0, 1, ..., 32*(L-1):
    k_i = K[i] || K[i+1] || ... || K[i+31]

T = 0
for i = 0, 1, ..., LENGTH-1:
    if M[i] == 1:
        T = T xor k_i

T = T xor k_LENGTH
MAC = T xor k_(32*(L-1))
```

### 3GPP LTE IV 构造

```text
COUNT = COUNT[0] || COUNT[1] || COUNT[2] || COUNT[3]
IV = IV[0] || IV[1] || ... || IV[15]

IV[0] = COUNT[0]
IV[1] = COUNT[1]
IV[2] = COUNT[2]
IV[3] = COUNT[3]
IV[4] = BEARER || 000
IV[5] = IV[6] = IV[7] = 00000000
IV[8] = IV[0] xor (DIRECTION << 7)
IV[9] = IV[1]
IV[10] = IV[2]
IV[11] = IV[3]
IV[12] = IV[4]
IV[13] = IV[5]
IV[14] = IV[6] xor (DIRECTION << 7)
IV[15] = IV[7]
```

`EEA3` 使用 ZUC 密钥流逐位异或。`EIA3` 使用滑动 32-bit 密钥流字计算 MAC，不能用“截取密钥流”替代。

## 项目边界

- `128-EEA3`：标准公式与 `demos/procedures/EEA3.json` 教学链已覆盖。
- `128-EIA3`：由 `zuc_eia3` 生成 32-bit MAC-I；`demos/procedures/EIA3.json` 使用 GB/T 33133.3-2021 附录 B 示例 1、2 验证双语言实现，覆盖 1-bit 与 577-bit 消息，以及密钥长度、BEARER 范围、零长度和消息缓冲区不足的拒绝。
- 这些回归向量不构成认证、全面互操作性、侧信道安全或生产密码学保证。
- 两者均建立在 [ZUC 密钥流](./04-Keystream.md) 上；EEA3 是保密性构造，EIA3 是完整性构造，不是分组密码。
