# CipherCat 演示指南

预构建的 Blockly 工作区示例，**全部使用原子块**（无便利封装），理解每个密码学原语的底层实现。按算法拆分独立文档：

| 算法 | 文档 | 场景 |
|------|------|------|
| SM4 | [demos/sm4.md](./demos/sm4.md) | 轮函数 F/L · S-box 查表（官方向量） |
| AES | [demos/aes.md](./demos/aes.md) | 单轮加密 · 函数封装 |
| 哈希 | [demos/hash.md](./demos/hash.md) | SHA-256 · SM3（官方向量） |
| SM2 | [demos/sm2.md](./demos/sm2.md) | 点乘 k·G（官方向量） |
| 后量子 | [demos/post-quantum.md](./demos/post-quantum.md) | ML-KEM 底层 · Encaps 全链（官方向量） |

---

## 快速开始

1. 打开 CipherCat → 菜单「More → Import Workspace」→ 选择 `demos/` 下的 `.json` 文件
2. 观察块连接 → 「▶ Generate」查看 JS/Python 输出
3. Procedure demo → 观察函数封装后如何在其他地方调用

## 官方向量验证（场景 6-9 通用）

全部官方向量 demo 的生成代码（Python + JavaScript）经 headless harness 实测通过官方测试向量：

```bash
npx vite build --config vite.verify.config.ts   # 构建 headless harness
node dist-verify/verify-demo.js demos/procedures/SM4-Sbox.json --exec
node dist-verify/verify-demo.js demos/procedures/SM3-Hash.json --exec
node dist-verify/verify-demo.js demos/procedures/SM2-PointMul.json --exec
node dist-verify/verify-demo.js demos/procedures/ML-KEM-Encaps.json --exec
```

`--exec` 模式加载工作区 → 生成 Python/JS → 追加测试 driver 执行 → 与 `demos/tests.json` 期望值比对。全部 PASS 输出 `=== ALL VECTORS PASS ===`。

---

## 进阶：自我探索

### 原子块串联
所有轮函数均为原子块直接串联（便利组合块已移除）：
- AES 单轮 = `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key`
- SM4 轮函数 = `sm4_round_func`（含 S-box + L 变换细节）

### 自定义函数封装
1. 选中你搭建好的密码学流程
2. 用 `procedures_defreturn` 封装为可复用函数
3. 设置参数类型（bytes / int_list / poly / seed）
4. 其他项目 → 右键导出 → 导入复用

### 类型系统
- `Bytes`（黄色）：Uint8Array / bytes — 密钥、密文、seed
- `IntList`（蓝色）：number[] / list[int] — 多项式系数、状态字
- `Number`（粉色）：Blockly 原生数字 — 标量参数

Blockly 自动检查连接类型——不匹配的连接会被阻止。

---

## 相关文档

- [积木块索引](./blocks/INDEX.md) — 全部自定义积木块的完整列表
- [架构文档](./ARCHITECTURE.md) — 系统架构与数据流
- [开发指南](./DEVELOPMENT.md) — 环境搭建、添加新块
- [类型系统](./TYPE-SYSTEM.md) — 数据类型规范与转换规则
