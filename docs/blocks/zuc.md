# 祖冲之序列密码块参考 (GB/T 33133)


ZUC（祖冲之）是国密序列密码，3GPP 128-EEA3/EIA3 核心组件。原子块按算法结构拆分：两个 8×8 S 盒 + 两个 32-bit 线性变换 + 非线性函数 F。

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的流密码分类详情页。ZUC 应称为序列密码/流密码，不属于后量子密码；EEA3/EIA3 是其上层移动通信算法，不与 ZUC 原子函数混为一谈。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [GB/T 33133 ZUC](../standards/gbt33133-ZUC/)、[标准覆盖矩阵](../standards/COVERAGE.md)；3GPP LTE 语境用于说明 EEA3/EIA3 的参数构造 |
| 实现 | `src/blocks/zuc/` |
| Demo 与测试 | [Demo 指南](../guides/DEMO.md)、[EEA3 工作区](../../demos/procedures/EEA3.json)、[EIA3 工作区](../../demos/procedures/EIA3.json)、[Demo 测试登记](../../demos/tests.json) |
| 边界 | 覆盖 ZUC-128 密钥流、EEA3 教学链和 EIA3 MAC 生成；这不代表认证、恒定时间或生产安全保证 |

## ZUC (GB/T 33133-2016)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `zuc_s0` | 1 | value(→) | Number→Number | 8×8 S0 S-box 查表（附录 A.1） |
| `zuc_s1` | 1 | value(→) | Number→Number | 8×8 S1 S-box 查表（附录 A.2） |
| `zuc_l1` | 1 | value(→) | Number→Number | L1 线性变换：X⊕(X<<<2)⊕(X<<<10)⊕(X<<<18)⊕(X<<<24) |
| `zuc_l2` | 1 | value(→) | Number→Number | L2 线性变换：X⊕(X<<<8)⊕(X<<<14)⊕(X<<<22)⊕(X<<<30) |
| `zuc_f` | 1 | value(→) | Number×5→Number | 非线性函数 F(X0,X1,X2,R1,R2)→W，含 S0/S1 交织 + L1/L2 |
| `zuc_eia3` | 2 | value(→) | Bytes×2 + Number×4→Number | 128-EIA3 完整性码：16-byte key、32-bit COUNT、5-bit BEARER、DIRECTION、消息和 bit 长度；输出 32-bit MAC-I |

## 拼接提示

- **S 盒交织**：32-bit S 盒 S(x) = S0(x>>24) ‖ S1(x>>16) ‖ S0(x>>8) ‖ S1(x)——`zuc_f` 内部自动完成，教学可拆开观察
- **F 记忆单元**：`zuc_f` 为纯函数返回 W；R1'/R2' 更新在生成器注释中给出，完整密钥流循环需外部变量承接（初始化 32 轮 + 工作模式）
- **官方向量**：GB/T 33133 附录 C（全 0 / 全 1 / 随机三组测试数据）双语言验证通过
- **EIA3 向量**：GB/T 33133.3-2021 附录 B 示例 1、2（1 bit、577 bit）在 Python 和 JavaScript 生成代码中通过；非法参数也有拒绝测试

## 数据来源

S0/S1 S 盒数据对照 ETSI TS 135 222 参考实现（luminousmen/ZUC），S0 与本仓库 `docs/standards/gbt33133-ZUC/01-ZUC.md` 附录 A.1 交叉验证一致。
