## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | NIST SP 800-38D — GCM 参考 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 Algorithm 4](./00-Standard-Source.md#L926)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38D — GCM 参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L926) 与同目录 PDF。

## 原文摘录

> 以下为 GCM 认证加密算法的说明性定位引文；完整算法、公式和边界请回看 [source 提取稿](./00-Standard-Source.md#L926)。

    Algorithm 4: GCM-AE_K (IV, P, A)
    Output: ciphertext C; authentication tag T.

原件：[NIST.SP.800-38D.pdf](./NIST.SP.800-38D.pdf) · [NIST 页面](https://csrc.nist.gov/pubs/sp/800/38/d/final)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 构造

NIST SP 800-38D 将 GCM 定义为使用获批的 128-bit 分组密码；该标准并未把密码限定为 AES-128。本项目的 `gcm_encrypt` 选择 AES-128 作为 `CIPH` 实例。GCM 将计数器加密函数 GCTR 与有限域乘法构造的 GHASH 组合，用于加密和认证。

96-bit IV 的预计数器块为 `J0 = IV || 0^31 || 1`；其他长度的 IV 必须按 Algorithm 4 的 IV 编码规则经 GHASH 导出。标签输入还包含填充后的 AAD、密文以及两者的 64-bit 比特长度。完整的 `u`、`v`、`S` 和标签公式见 [Algorithm 4 完整摘录](./08-GCM-AE.md)；认证解密及标签拒绝路径见 [Algorithm 5](./09-GCM-AD.md)。本页作为总览，不重复算法全文。

## 项目边界

`gcm_encrypt` 固定 AES-128、输出 `C || T` 和完整 128-bit 标签；支持任意字节数组 IV 的加密路径。当前没有解密/标签验证块，也没有把一次向量通过解释为 nonce 重用、长度上限或侧信道安全保证。Demo：`demos/procedures/GCM-Encrypt.json`。
